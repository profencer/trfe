import { makeDeserializer, Deserializer } from "./deserializers";
import WS from 'ws';
import { Serializer, makeSerializer } from "./serializers";

export const JsonRpcRequestValidator = makeDeserializer(t => t.obj({
    functionId: t.num,
    requestId: t.num,
    params: t.id,
}));

export const JsonRpcRequestSerializer = makeSerializer(t => t.obj({
    functionId: t.num,
    requestId: t.num,
    params: t.id,
}));

export const JsonRpcResponseSerializer = makeDeserializer(t => t.obj({
    requestId: t.num,
    result: t.id,
}));

export const JsonRpcResponseDeserializer = makeDeserializer(t => t.obj({
    requestId: t.num,
    result: t.id,
}));

// OMG TS NEEDS THIS TO INFER TYPE CORRECTLY
// TRY USING VALIDATOR WITHOUT THIS LOL
export const hax = <T>(t: T) => t;

export interface JsonMap extends Array<Json> { }
export type Json = { [member: string]: Json } | JsonMap | string | number | boolean | null;



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

