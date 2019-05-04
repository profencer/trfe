import { serializers, Serializer } from "./lib/serializers";
import { subResult, subParams } from "./generated-types";
import { deserializers, Deserializer } from "./lib/deserializers";
import { Json, AsyncFunction, hax } from "./lib/core";
import { Connection } from "./lib/client";

type F<T> = (c: Connection) => T;

interface ApiDescription {
    iface: <O>(o: { [K in keyof O]: F<O[K]> }) => F<O>;
    fun: <T, U>(
        functionId: number,
        paramsSerializer: Serializer<T>,
        resultDeserializer: Deserializer<U>,
    ) => F<AsyncFunction<T, U>>,
}

const description: ApiDescription = {
    iface: <O>(o: { [K in keyof O]: F<O[K]> }) => (c: Connection) => {
        return Object.keys(o).reduce((res: O, key: string) => {
            return { ...res, [key]: (o as any)[key](c) };
        }, {} as O);
    },
    fun: <T, U>(
        functionId: number,
        paramsSerializer: Serializer<T>,
        resultDeserializer: Deserializer<U>,
    ) => {
        return ({ send, getNextRequestId, responseHandlers }: Connection) => {
            return (params: T): Promise<U> => {
                const requestId = getNextRequestId();
                send({
                    functionId,
                    requestId,
                    params: paramsSerializer(params),
                });
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

};

const createApi = (p: ApiDescription) => {
    return p.iface(hax({
        sub: p.fun(
            1,
            subParams(serializers),
            subResult(deserializers),
        ),
    }))
};

export const client = createApi(description);
