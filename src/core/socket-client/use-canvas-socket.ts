import { API_HOST } from '@/core/api-client/const.ts';
import { SocketClientMessage } from '@/core/socket-client/schemas/message-schemas.ts';
import { type EventBusKey, useEventBus, useWebSocket, type UseWebSocketReturn } from '@vueuse/core';
import * as v from 'valibot';

let canvasSocket: UseWebSocketReturn<unknown> | undefined;

export const CANVAS_SOCKET_MESSAGE_BUS_KEY: EventBusKey<SocketClientMessage> = Symbol('Canvas socket message bus');
export const CANVAS_SOCKET_ERROR_BUS_KEY: EventBusKey<Event> = Symbol('Canvas socket error bus');
export const CANVAS_SOCKET_CONNECTED_BUS_KEY: EventBusKey<void> = Symbol('Canvas socket connected bus');
export const CANVAS_SOCKET_DISCONNECTED_BUS_KEY: EventBusKey<Event> = Symbol('Canvas socket disconnected bus');

const messageEventBus = useEventBus(CANVAS_SOCKET_MESSAGE_BUS_KEY);
const errorEventBus = useEventBus(CANVAS_SOCKET_ERROR_BUS_KEY);
const connectedEventBus = useEventBus(CANVAS_SOCKET_CONNECTED_BUS_KEY);
const disconnectedEventBus = useEventBus(CANVAS_SOCKET_DISCONNECTED_BUS_KEY);

export function useCanvasSocket(): UseWebSocketReturn<unknown> {
    canvasSocket ??= useWebSocket(`wss://${API_HOST}/pxls/ws`, {
        immediate: false,
        onMessage: (_, event) => {
            try {
                const data = JSON.parse(event.data);
                const parseResult = v.safeParse(SocketClientMessage, data);
                if (parseResult.success) {
                    messageEventBus.emit(parseResult.output);
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
