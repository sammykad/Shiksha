'use client';

import {
    useState,
    useRef,
    useCallback,
    useEffect,
    type RefObject,
} from 'react';
import type { Role } from '@/generated/prisma/enums';

export interface MentionUser {
    id: string;
    name: string;
    role?: Role;
    department?: string;
    email?: string;
    profileImage?: string;
}

export interface MentionedPerson {
    id: string;
    name: string;
    role?: Role;
    department?: string;
}

export interface MentionCoords {
    top: number;
    left: number;
}

export interface UseMentionOptions {
    organizationId: string;
    initialUsers: MentionUser[];
    fetchUsers: (orgId: string, query: string, signal: AbortSignal) => Promise<MentionUser[]>;
    debounceMs?: number;
    maxResults?: number;
}

export interface UseMentionReturn {
    textareaRef: RefObject<HTMLTextAreaElement | null>;
    handleChange: (value: string) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    isOpen: boolean;
    results: MentionUser[];
    activeIndex: number;
    dropdownCoords: MentionCoords;
    isLoading: boolean;
    selectUser: (user: MentionUser) => void;
    closeDropdown: () => void;
    mentionedPeople: MentionedPerson[];
    removeMentionedPerson: (id: string) => void;
}

function getActiveMentionQuery(
    text: string,
    cursorPos: number,
): { query: string; atIndex: number } | null {
    const before = text.slice(0, cursorPos);
    const lastAt = before.lastIndexOf('@');
    if (lastAt === -1) return null;

    const charBefore = before[lastAt - 1];
    if (charBefore !== undefined && !/[\s\n]/.test(charBefore)) return null;

    const query = before.slice(lastAt + 1);
    if (/[\s\n]/.test(query)) return null;

    return { query, atIndex: lastAt };
}

function getCaretCoords(textarea: HTMLTextAreaElement, atIndex: number): MentionCoords {
    const cs = window.getComputedStyle(textarea);
    const mirror = document.createElement('div');

    const props = [
        'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant',
        'letterSpacing', 'lineHeight', 'textTransform', 'textIndent',
        'wordBreak', 'overflowWrap', 'whiteSpace', 'tabSize', 'boxSizing',
    ] as const;

    props.forEach((p) => {
        (mirror.style as unknown as Record<string, string>)[p] = cs[p];
    });

    mirror.style.width = `${textarea.offsetWidth}px`;
    mirror.style.height = 'auto';
    mirror.style.position = 'absolute';
    mirror.style.top = '-99999px';
    mirror.style.left = '-99999px';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';

    mirror.appendChild(document.createTextNode(textarea.value.slice(0, atIndex)));

    const marker = document.createElement('span');
    marker.textContent = '\u200b';
    mirror.appendChild(marker);

    document.body.appendChild(mirror);
    const lineH = parseFloat(cs.lineHeight) || 20;
    const top = marker.offsetTop - textarea.scrollTop + lineH + 4;
    const left = marker.offsetLeft;
    document.body.removeChild(mirror);

    return {
        top,
        left: Math.max(0, Math.min(left, textarea.offsetWidth - 250)),
    };
}

export function useMention({
    organizationId,
    initialUsers,
    fetchUsers,
    debounceMs = 200,
    maxResults = 10,
}: UseMentionOptions): UseMentionReturn {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Seed results synchronously so first @ shows users immediately
    const [results, setResults] = useState<MentionUser[]>(() =>
        initialUsers.slice(0, maxResults)
    );
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [dropdownCoords, setDropdownCoords] = useState<MentionCoords>({ top: 0, left: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [mentionedPeople, setMentionedPeople] = useState<MentionedPerson[]>([]);

    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeQueryRef = useRef<{ query: string; atIndex: number } | null>(null);
    const isOpenRef = useRef(false);
    const resultsRef = useRef<MentionUser[]>(initialUsers.slice(0, maxResults));
    const activeIndexRef = useRef(0);
    const selectUserRef = useRef<(u: MentionUser) => void>(() => undefined);

    // Cache seeded synchronously — key is `orgId::query`
    const cacheRef = useRef<Map<string, MentionUser[]>>(
        new Map([[`${organizationId}::`, initialUsers.slice(0, maxResults)]])
    );

    // Keep refs in sync
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
    useEffect(() => { resultsRef.current = results; }, [results]);
    useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);

    // Re-seed cache if initialUsers changes
    useEffect(() => {
        const sliced = initialUsers.slice(0, maxResults);
        cacheRef.current.set(`${organizationId}::`, sliced);
        // Also update results if no query is active (dropdown not open)
        if (!isOpenRef.current) {
            setResults(sliced);
            resultsRef.current = sliced;
        }
    }, [initialUsers, organizationId, maxResults]);

    const runSearch = useCallback(
        (query: string) => {
            abortRef.current?.abort();
            if (debounceRef.current) clearTimeout(debounceRef.current);

            const cacheKey = `${organizationId}::${query.toLowerCase()}`;

            if (cacheRef.current.has(cacheKey)) {
                const cached = cacheRef.current.get(cacheKey)!;
                setResults(cached);
                resultsRef.current = cached;
                setActiveIndex(0);
                setIsLoading(false);
                return;
            }

            // Show initialUsers immediately for short/empty queries
            if (query.length < 2) {
                const fallback = cacheRef.current.get(`${organizationId}::`) ?? initialUsers.slice(0, maxResults);
                setResults(fallback);
                resultsRef.current = fallback;
                setActiveIndex(0);
            }

            setIsLoading(true);

            debounceRef.current = setTimeout(async () => {
                const controller = new AbortController();
                abortRef.current = controller;

                try {
                    const users = await fetchUsers(organizationId, query, controller.signal);
                    if (controller.signal.aborted) return;

                    const sliced = users.slice(0, maxResults);
                    cacheRef.current.set(cacheKey, sliced);
                    setResults(sliced);
                    resultsRef.current = sliced;
                    setActiveIndex(0);
                } catch (err) {
                    if (!controller.signal.aborted && (err as Error).name !== 'AbortError') {
                        // keep current results on error
                    }
                } finally {
                    if (!controller.signal.aborted) setIsLoading(false);
                }
            }, debounceMs);
        },
        [organizationId, fetchUsers, debounceMs, maxResults, initialUsers],
    );

    const closeDropdown = useCallback(() => {
        setIsOpen(false);
        isOpenRef.current = false;
        setActiveIndex(0);
        activeIndexRef.current = 0;
        activeQueryRef.current = null;
        abortRef.current?.abort();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setIsLoading(false);
    }, []);

    const handleChange = useCallback(
        (value: string) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const cursorPos = textarea.selectionStart ?? value.length;
            const ctx = getActiveMentionQuery(value, cursorPos);

            if (!ctx) {
                if (isOpenRef.current) {
                    closeDropdown();
                }
                return;
            }

            activeQueryRef.current = ctx;
            const coords = getCaretCoords(textarea, ctx.atIndex);

            setDropdownCoords(coords);
            setIsOpen(true);
            isOpenRef.current = true;
            runSearch(ctx.query);
        },
        [runSearch, closeDropdown],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (!isOpenRef.current) return;
            const len = resultsRef.current.length;
            if (len === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setActiveIndex((i) => {
                        const next = (i + 1) % len;
                        activeIndexRef.current = next;
                        return next;
                    });
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setActiveIndex((i) => {
                        const next = (i - 1 + len) % len;
                        activeIndexRef.current = next;
                        return next;
                    });
                    break;
                case 'Enter':
                case 'Tab': {
                    const user = resultsRef.current[activeIndexRef.current];
                    if (user) { e.preventDefault(); selectUserRef.current(user); }
                    break;
                }
                case 'Escape':
                    e.preventDefault();
                    closeDropdown();
                    break;
            }
        },
        [closeDropdown],
    );

    const selectUser = useCallback(
        (user: MentionUser) => {
            const textarea = textareaRef.current;
            if (!textarea || !activeQueryRef.current) return;

            const { atIndex } = activeQueryRef.current;
            const curVal = textarea.value;
            const cursorPos = textarea.selectionStart ?? curVal.length;

            const inserted = `@${user.name} `;
            const newValue = curVal.slice(0, atIndex) + inserted + curVal.slice(cursorPos);

            // Bypass React batching so RHF / onChange picks up the new value
            const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
            setter?.call(textarea, newValue);
            textarea.dispatchEvent(new Event('input', { bubbles: true }));

            const newCursor = atIndex + inserted.length;
            requestAnimationFrame(() => {
                textarea.selectionStart = newCursor;
                textarea.selectionEnd = newCursor;
                textarea.focus();
            });

            setMentionedPeople((prev) =>
                prev.some((p) => p.id === user.id)
                    ? prev
                    : [...prev, { id: user.id, name: user.name, role: user.role, department: user.department }]
            );

            closeDropdown();
        },
        [closeDropdown],
    );

    useEffect(() => { selectUserRef.current = selectUser; }, [selectUser]);

    useEffect(() => () => {
        abortRef.current?.abort();
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }, []);

    const removeMentionedPerson = useCallback((id: string) => {
        setMentionedPeople((prev) => prev.filter((p) => p.id !== id));
    }, []);

    return {
        textareaRef,
        handleChange,
        handleKeyDown,
        isOpen,
        results,
        activeIndex,
        dropdownCoords,
        isLoading,
        selectUser,
        closeDropdown,
        mentionedPeople,
        removeMentionedPerson,
    };
}