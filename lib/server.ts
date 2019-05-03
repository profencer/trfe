import { makeDeserializer } from "./deserializers";
import { makeSerializer } from "./serializers";
import WS from 'ws';

export const JsonRpcRequestValidator = makeDeserializer(t => t.obj({
    functionId: t.num,
    requestId: t.num,
    params: t.id,
}));

export const JsonRpcResponseSerializer = makeSerializer(t => t.obj({
    requestId: t.num,
    result: t.id,
}));

export const createServer = (handler: (reqBody: string) => Promise<string>, opts: WS.ServerOptions): WS.Server => {
    const server = new WS.Server({
        port: 3000,
    });
    server.on('connection', (connection: WS) => {
        connection.on('message', async (rawMsg: string) => {
            connection.send(await handler(rawMsg));
        });
    });
    return server;
};
