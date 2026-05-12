"use client";

import * as React from "react";




/**
 * @example

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

function CopyButton({ text }: { text: string }) {
const { copyToClipboard, isCopied } = useCopyToClipboard();

return (
<button onClick={() => copyToClipboard(text)}>
{isCopied ? "Copied!" : "Copy"}
</button>
);
}
 */

export function useCopyToClipboard({
    timeout = 2000,
    onCopy,
}: {
    timeout?: number;
    onCopy?: () => void;
} = {}): { copyToClipboard: (value: string) => void; isCopied: boolean } {
    const [isCopied, setIsCopied] = React.useState(false);
    const timeoutIdRef = React.useRef<NodeJS.Timeout | null>(null);

    const copyToClipboard = (value: string): void => {
        if (typeof window === "undefined" || !navigator.clipboard.writeText) {
            return;
        }

        if (!value) return;

        navigator.clipboard.writeText(value).then(() => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
            setIsCopied(true);

            if (onCopy) {
                onCopy();
            }

            if (timeout !== 0) {
                timeoutIdRef.current = setTimeout(() => {
                    setIsCopied(false);
                    timeoutIdRef.current = null;
                }, timeout);
            }
        }, console.error);
    };

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return (): void => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
        };
    }, []);

    return { copyToClipboard, isCopied };
}
