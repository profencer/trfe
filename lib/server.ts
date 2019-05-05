import WS from 'ws';
import { requestFormat, responseFormat } from './json-rpc-types';
import { deserializers, Deserializer } from './deserializers';
import { serializers, Serializer } from './serializers';
import { AsyncFunction, Json } from './core';

const requestDeserializer = requestFormat(deserializers);
const responseSerializer = responseFormat(serializers);

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
export const createServer2 = <T>(handler: F<T>) => {
    return (api: T) => {
        const concreteApi = handler(api);
        return async (reqBody: string) => {
            const req = requestDeserializer(JSON.parse(reqBody));
            const result = await concreteApi[req.functionId](req.params);
            return JSON.stringify(
                responseSerializer({
                    requestId: req.requestId,
                    result,
                })
            );
        };
    };
};

type F<T> = (handler: T) => { [key: number]: AsyncFunction<Json, Json> }

export interface ApiDescription {
    iface: <O>(o: { [K in keyof O]: F<O[K]> }) => F<O>;
    fun: <T, U>(
        functionId: number,
        paramsDeserializer: Deserializer<T>,
        resultSerializer: Serializer<U>,
    ) => F<AsyncFunction<T, U>>,
}

export const serverDesc: ApiDescription = {
    iface: <O>(o: { [K in keyof O]: F<O[K]> }) => {
        return (handlers: O) => Object.keys(handlers).reduce((current, functionName: string) => {
            return { ...current, ...(o as any)[functionName]((handlers as any)[functionName]) };
        }, {} as { [n: number]: (rawParams: Json) => Promise<Json> });
    },
    fun: <T, U>(
        functionId: number,
        paramsDeserializer: Deserializer<T>,
        resultSerializer: Serializer<U>,
    ) => {
        return (handler: AsyncFunction<T, U>) => {
            const wireHandler = async (rawParams: Json) => {
                const params = paramsDeserializer(rawParams);
                return resultSerializer(await handler(params));
            };
            return {
                [functionId]: wireHandler,
            };
        };
    },
};