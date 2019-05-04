import WS from 'ws';
import { requestFormat, responseFormat } from './json-rpc-types';
import { serializers } from './serializers';
import { deserializers } from './deserializers';
import { Json, ArgType } from './core';

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


const createConnection = (connection: WS): Connection => {
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

