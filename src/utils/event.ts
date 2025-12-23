export function eventIsUntrusted(event: Event): boolean {
    return !event.isTrusted;
}

export function eventHasModifierKeys(event: MouseEvent): boolean {
    return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

export function eventTargetIsInput(event: Event): boolean {
    return (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
    );
}
