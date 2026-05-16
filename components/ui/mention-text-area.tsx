'use client';

import React, {
    useRef,
    useEffect,
    useCallback,
    type TextareaHTMLAttributes,
} from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMention, type MentionUser, type MentionedPerson } from '@/hooks/use-mention';

interface MentionTextareaProps
    extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
    value: string;
    onChange: (value: string) => void;
    organizationId: string;
    initialUsers: MentionUser[];
    fetchUsers: (orgId: string, query: string, signal: AbortSignal) => Promise<MentionUser[]>;
    onMentionedPeopleChange?: (people: MentionedPerson[]) => void;
}

/**
 * XSS-safe highlight builder.
 * Only highlights confirmed mentions from the mentionedPeople list.
 */
function buildHighlightHtml(text: string, mentionedPeople: MentionedPerson[]): string {
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    // Replace newlines with <br> so div height tracks textarea height
    let html = escaped.replace(/\n/g, '<br>');

    // Sort by name length descending to avoid partial matches (e.g., "@John Doe" vs "@John")
    const sortedPeople = [...mentionedPeople].sort((a, b) => b.name.length - a.name.length);

    // We want to avoid double-highlighting. 
    // We'll replace mentions with a unique token, then swap tokens for <mark>
    const tokens: string[] = [];

    sortedPeople.forEach((person, idx) => {
        const mentionText = `@${person.name}`;
        // Escape for regex use
        const escapedName = person.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`@${escapedName}(?=[\\s\\n.,!?;:)<br>]|$)`, 'g');

        html = html.replace(regex, () => {
            const token = `__MENTION_${idx}__`;
            tokens[idx] = `<mark>${mentionText}</mark>`;
            return token;
        });
    });

    // Restore tokens
    tokens.forEach((markHtml, idx) => {
        if (markHtml) {
            html = html.replace(new RegExp(`__MENTION_${idx}__`, 'g'), markHtml);
        }
    });

    // Trailing space prevents last-line height desync
    return html + ' ';
}

export function MentionTextarea({
    value,
    onChange,
    organizationId,
    initialUsers,
    fetchUsers,
    onMentionedPeopleChange,
    className,
    placeholder,
    ...rest
}: MentionTextareaProps) {
    const listRef = useRef<HTMLUListElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    const {
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
    } = useMention({ organizationId, initialUsers, fetchUsers });

    useEffect(() => {
        onMentionedPeopleChange?.(mentionedPeople);
    }, [mentionedPeople, onMentionedPeopleChange]);

    useEffect(() => {
        if (!listRef.current) return;
        (listRef.current.children[activeIndex] as HTMLElement | undefined)
            ?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    useEffect(() => {
        if (!isOpen) return;
        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (
                !textareaRef.current?.contains(t) &&
                !document.getElementById('mention-listbox')?.contains(t)
            ) {
                closeDropdown();
            }
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [isOpen, closeDropdown, textareaRef]);

    // Sync highlight scroll with textarea scroll
    const syncScroll = useCallback(() => {
        if (highlightRef.current && textareaRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    }, [textareaRef]);

    const handleInput = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const v = e.target.value;
            onChange(v);
            handleChange(v);
        },
        [onChange, handleChange],
    );

    return (
        <div className="relative">
            {/*
             * ── HOW THIS WORKS ──────────────────────────────────────────────
             *
             * Layer 1 (highlight div, z-0, behind):
             *   - Renders the actual visible text with colored @mentions
             *   - `color: inherit` so normal text looks normal
             *   - `pointer-events: none` so it doesn't intercept clicks
             *
             * Layer 2 (textarea, z-10, on top):
             *   - `color: transparent` hides its text (avoids doubling)
             *   - `caret-color: currentColor` keeps the cursor visible
             *   - `background: transparent` lets layer 1 show through
             *   - Captures all user input events normally
             *
             * Result: user sees the highlight layer's colored text through
             * the transparent textarea, types into the textarea normally,
             * and the caret appears because caret-color is not transparent.
             * ────────────────────────────────────────────────────────────────
             */}
            <div
                ref={highlightRef}
                aria-hidden
                className="mention-highlight pointer-events-none absolute inset-0 z-0 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: buildHighlightHtml(value, mentionedPeople) }}
            />

            <textarea
                {...rest}
                ref={textareaRef}
                value={value}
                placeholder={placeholder}
                role="combobox"
                aria-expanded={isOpen}
                aria-autocomplete="list"
                aria-controls={isOpen ? 'mention-listbox' : undefined}
                aria-activedescendant={isOpen ? `mention-option-${activeIndex}` : undefined}
                className={cn(
                    // Layout — must match highlight div exactly
                    'relative z-10 min-h-[150px] w-full rounded-md border border-slate-300',
                    'px-3 py-2 text-sm shadow-sm',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    'resize-y',
                    // KEY: hide textarea text, keep caret visible, show highlight through bg
                    'bg-transparent',
                    'text-transparent',
                    '[caret-color:theme(colors.slate.900)] dark:[caret-color:theme(colors.slate.100)]',
                    // This is the critical fix for the "shadow" / ghosting during selection
                    '[&::selection]:bg-blue-500/30 [&::selection]:text-transparent',
                    className,
                )}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onScroll={syncScroll}
            />

            {isOpen && (
                <div
                    role="listbox"
                    id="mention-listbox"
                    className="absolute z-50 w-[280px] rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden"
                    style={{ top: dropdownCoords.top, left: dropdownCoords.left }}
                >
                    {isLoading && results.length === 0 ? (
                        <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Searching…
                        </div>
                    ) : results.length === 0 ? (
                        <p className="px-3 py-3 text-sm text-muted-foreground">No people found</p>
                    ) : (
                        <ul ref={listRef} className="max-h-[220px] overflow-y-auto py-1">
                            {results.map((user, i) => (
                                <MentionOption
                                    key={user.id}
                                    index={i}
                                    user={user}
                                    isActive={i === activeIndex}
                                    onSelect={selectUser}
                                />
                            ))}
                        </ul>
                    )}
                    {isLoading && results.length > 0 && (
                        <div className="flex items-center gap-1.5 border-t px-3 py-1.5 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Updating…
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface MentionOptionProps {
    index: number;
    user: MentionUser;
    isActive: boolean;
    onSelect: (user: MentionUser) => void;
}

const MentionOption = React.memo(function MentionOption({
    index,
    user,
    isActive,
    onSelect,
}: MentionOptionProps) {
    return (
        <li
            id={`mention-option-${index}`}
            role="option"
            aria-selected={isActive}
            className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-sm select-none cursor-pointer transition-colors duration-75',
                isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
            )}
            onMouseDown={(e) => {
                e.preventDefault(); // keep textarea focused
                onSelect(user);
            }}
        >
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border">
                <AvatarImage src={user.profileImage ?? undefined} alt="user.image" />
                <AvatarFallback className="text-xs font-medium">
                    {user.name[0]?.toUpperCase() ?? '?'}
                </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium leading-tight">{user.name}</span>
                {(user.role || user.department) && (
                    <span className="truncate text-xs text-muted-foreground leading-tight mt-0.5">
                        {[user.role, user.department].filter(Boolean).join(' · ')}
                    </span>
                )}
            </div>
        </li>
    );
});