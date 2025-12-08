import { SocketClientMessage } from '@/core/pxls-socket/schemas/message-schemas.ts';
import {
    type EventBusKey,
    useEventBus,
    type UseEventBusReturn,
    useWebSocket,
    type UseWebSocketReturn,
} from '@vueuse/core';
import * as v from 'valibot';

let canvasSocket: UseWebSocketReturn<unknown> | undefined;

const CANVAS_SOCKET_MESSAGE_BUS_KEY: EventBusKey<SocketClientMessage> = Symbol('Canvas socket message bus');
const CANVAS_SOCKET_ERROR_BUS_KEY: EventBusKey<Event> = Symbol('Canvas socket error bus');
const CANVAS_SOCKET_CONNECTED_BUS_KEY: EventBusKey<void> = Symbol('Canvas socket connected bus');
const CANVAS_SOCKET_DISCONNECTED_BUS_KEY: EventBusKey<Event> = Symbol('Canvas socket disconnected bus');

export function usePxlsSocketMessageEventBus(): UseEventBusReturn<SocketClientMessage, unknown> {
    return useEventBus(CANVAS_SOCKET_MESSAGE_BUS_KEY);
}

export function usePxlsSocketErrorEventBus(): UseEventBusReturn<Event, unknown> {
    return useEventBus(CANVAS_SOCKET_ERROR_BUS_KEY);
}

export function usePxlsSocketConnectedEventBus(): UseEventBusReturn<void, unknown> {
    return useEventBus(CANVAS_SOCKET_CONNECTED_BUS_KEY);
}

export function usePxlsSocketDisconnectedEventBus(): UseEventBusReturn<Event, unknown> {
    return useEventBus(CANVAS_SOCKET_DISCONNECTED_BUS_KEY);
}

const messageEventBus = usePxlsSocketMessageEventBus();
const errorEventBus = usePxlsSocketErrorEventBus();
const connectedEventBus = usePxlsSocketConnectedEventBus();
const disconnectedEventBus = usePxlsSocketDisconnectedEventBus();

export function usePxlsSocket(): UseWebSocketReturn<unknown> {
    canvasSocket ??= useWebSocket(new URL(`${__PXLS_SOCKET_BASE_URL__}/ws`, window.location.origin), {
        immediate: false,
        onMessage: (_, event) => {
            try {
                const data = JSON.parse(event.data);
                const parseResult = v.safeParse(SocketClientMessage, data);
                if (parseResult.success) {
                    messageEventBus.emit(parseResult.output);
                } else {
                    console.error('Invalid canvas socket message', parseResult.issues);
                }
            } catch {}
        },
        onError: (_, event) => {
            errorEventBus.emit(event);
        },
        onConnected: () => {
            connectedEventBus.emit();
        },
        onDisconnected: (_, event) => {
            disconnectedEventBus.emit(event);
        },
    });
    return canvasSocket;
}
