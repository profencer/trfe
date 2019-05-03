import { Serializer, makeSerializer } from "./serializers";
import { Deserializer, makeDeserializer } from "./deserializers";
import { Json } from "./core";
import WS from 'ws';


export const JsonRpcResponseDeserializer = makeDeserializer(t => t.obj({
    requestId: t.num,
    result: t.id,
}));
export const JsonRpcRequestSerializer = makeSerializer(t => t.obj({
    functionId: t.num,
    requestId: t.num,
    params: t.id,
}));

export type SendRequest = <T, U>(
    functionId: number,
    paramsSerializer: Serializer<T>,
    resultDeserializer: Deserializer<U>,
) => (params: T) => Promise<U>

export const createWebSocketClient = (connection: WS) => {
    let requestId: number = 0;
    const responseHandlers: { [key: string]: (input: Json) => void } = {}
    connection.on('message', (rawMsg: string) => {
        const msg = JsonRpcResponseDeserializer(JSON.parse(rawMsg));
        responseHandlers[msg.requestId](msg.result);
        delete responseHandlers[msg.requestId];
    });
    return <T, U>(
        functionId: number,
        paramsSerializer: Serializer<T>,
        resultDeserializer: Deserializer<U>,
    ): (params: T) => Promise<U> => {
        return (params: T): Promise<U> => {
            requestId += 1;
            connection.send(
                JSON.stringify(
                    JsonRpcRequestSerializer({
                        functionId,
                        requestId,
                        params: paramsSerializer(params),
                    })
                )
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
}

export const createRequestSender = (url: string) => {
    const connection = new WS(url);
    return new Promise<SendRequest>((res, rej) => {
        connection.on('open', () => {
            res(createWebSocketClient(connection));
        });
        connection.on('error', (err) => {
            rej(err);
        })
    });
}