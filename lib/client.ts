import WS from 'ws';
import { requestFormat, responseFormat } from './json-rpc-types';
import { serializers, Serializer } from './serializers';
import { deserializers, Deserializer } from './deserializers';
import { Json, ArgType, AsyncFunction } from './core';

const requestSerializer = requestFormat(serializers);
const responseDeserializer = responseFormat(deserializers);

type Request = ArgType<typeof requestSerializer>

export interface Connection {
    send: (r: Request) => void,
    getNextRequestId: () => number,
    responseHandlers: { [key: string]: (input: Json) => void },
}

export const createWsConnection = (url: string): Promise<WS> => {
    const connection = new WS(url);
    return new Promise((res, rej) => {
        connection.on('open', () => {
            res(connection);
        });
        connection.on('error', (err) => {
            rej(err);
        })
    })
};


export const createConnection = (connection: WS): Connection => {
    let requestId: number = 0;
    const responseHandlers: { [key: string]: (input: Json) => void } = {}
    connection.on('message', (rawMsg: string) => {
        const msg = responseDeserializer(JSON.parse(rawMsg));
        responseHandlers[msg.requestId](msg.result);
        delete responseHandlers[msg.requestId];
    });
    return {
        send: (x) => connection.send(JSON.stringify(requestSerializer(x))), 
        getNextRequestId: () => requestId += 1,
        responseHandlers,
    };
};

type Client<T> = (c: Connection) => T;

export interface ApiDescription {
    iface: <O>(o: { [K in keyof O]: Client<O[K]> }) => Client<O>;
    fun: <T, U>(
        functionId: number,
        paramsFormat: Serializer<T>,
        resultFormat: Deserializer<U>,
    ) => Client<AsyncFunction<T, U>>,
}

export const clientDesc: ApiDescription = {
    iface: <O>(o: { [K in keyof O]: Client<O[K]> }) => (c: Connection) => {
        return Object.keys(o).reduce((res: O, key: string) => {
            return { ...res, [key]: (o as any)[key](c) };
        }, {} as O);
    },
    fun: <T, U>(
        functionId: number,
        paramsFormat: Serializer<T>,
        resultFormat: Deserializer<U>,
    ) => {
        return ({ send, getNextRequestId, responseHandlers }: Connection) => {
            return (params: T): Promise<U> => {
                const requestId = getNextRequestId();
                send({
                    functionId,
                    requestId,
                    params: paramsFormat(params),
                });
                // TODO process error messages from server if method call resulted in error
                // TODO raise error if timeout exceeded
                return new Promise((res, rej) => {
                    responseHandlers[requestId] = (input: Json) => {
                        res(resultFormat(input));
                    };
                });
            };
        } 
    },
};
