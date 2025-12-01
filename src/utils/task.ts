export function queueMacrotask(task: () => void): void {
    const channel = new MessageChannel();
    channel.port1.onmessage = (): void => {
        task();
    };
    channel.port2.postMessage(undefined);
}
