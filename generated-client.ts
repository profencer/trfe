// import { SendRequest, createRequestSender } from "./lib/client";
import { serializers, Serializer } from "./lib/serializers";
import { subResult, subParams } from "./generated-types";
import { deserializers, Deserializer } from "./lib/deserializers";
import { Json, AsyncFunction, hax } from "./lib/core";
import WS from 'ws';
import { requestFormat, responseFormat } from "./lib/json-rpc-types";

const requestSerializer = requestFormat(serializers);
const responseDeserializer = responseFormat(deserializers);
interface Connection {
    connection: WS,
    getNextRequestId: () => number,
    responseHandlers: { [key: string]: (input: Json) => void },
}

type F<T> = (c: Connection) => T;
type G<T> = T;
interface ApiDescription {
    iface: <O>(o: { [K in keyof O]: F<O[K]> }) => F<O>;
    fun: <T, U>(
        functionId: number,
        paramsSerializer: Serializer<T>,
        resultDeserializer: Deserializer<U>,
    ) => F<AsyncFunction<T, U>>,
    api: <T>(handler: F<T>) => (api: T) => AsyncFunction<string, string>,
}
const description: ApiDescription = {
    iface: <O>(o: { [K in keyof O]: F<O[K]> }) => (c: Connection) => {
        return Object.keys(o).reduce((res: O, key: string)=> {
            return {...res, [key]: (o as any)[key](c)};
        }, {} as O);
    },
    fun: <T, U>(
        functionId: number,
        paramsSerializer: Serializer<T>,
        resultDeserializer: Deserializer<U>,
    ) => {
        return ({ connection, getNextRequestId, responseHandlers }: Connection) => {
            return (params: T): Promise<U> => {
                const requestId = getNextRequestId();
                connection.send(
                    JSON.stringify(
                        requestSerializer({
                            functionId,
                            requestId,
                            params: paramsSerializer(params),
                        })
                    ),
                );
                // TODO process error messages from server if method call resulted in error
                // TODO raise error if timeout exceeded
                return new Promise((res, rej) => {
                    responseHandlers[requestId] = (input: Json) => {
                        res(resultDeserializer(input));
                    };
                });
            };
        }
    },
    api: 
};

const createWebSocketClient = (connection: WS) => {
    let requestId: number = 0;
    const responseHandlers: { [key: string]: (input: Json) => void } = {}
    connection.on('message', (rawMsg: string) => {
        const msg = responseDeserializer(JSON.parse(rawMsg));
        responseHandlers[msg.requestId](msg.result);
        delete responseHandlers[msg.requestId];
    });
    return <T, U>(
        functionId: number,
        paramsSerializer: Serializer<T>,
        resultDeserializer: Deserializer<U>,
    ): (params: T) => Promise<U> => {
        return (params: T): Promise<U> => {

        };
    }
}


const createApi = (p: ApiDescription) => {
    return p.api(
        p.iface(hax({
            sub: p.fun(
                1,
                subParams(serializers),
                subResult(deserializers),
            ),
        }))
    );
};

export const client = async (url: string) => createApi(await createRequestSender(url));
