export function eventIsInappropriate(event: MouseEvent, checkKeys: boolean): boolean {
    return !event.isTrusted || (checkKeys && (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey));
}
