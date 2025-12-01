let tickerInterval: number | undefined = undefined;

function runTicker(): void {
    tickerInterval ??= setInterval(() => {
        globalThis.postMessage(1);
    }, 250);
}

function stopTicker(): void {
    clearInterval(tickerInterval);
    tickerInterval = undefined;
}

globalThis.addEventListener('message', (event) => {
    if (event.data === 'start') {
        runTicker();
    } else if (event.data === 'stop') {
        stopTicker();
    }
});
