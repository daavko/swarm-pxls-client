export function eventIsInappropriate(event: MouseEvent, checkKeys: boolean): boolean {
    return !event.isTrusted || (checkKeys && (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey));
}

export function eventTargetIsInput(event: Event): boolean {
    return (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
    );
}
