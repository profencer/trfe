import { serializers, Serializer, SerializerId } from "./lib/serializers";
import { subResult, subParams } from "./generated-types";
import { deserializers, Deserializer, DeserializerId } from "./lib/deserializers";
import { Json, AsyncFunction, hax } from "./lib/core";
import { Connection } from "./lib/client";
import { Type, Ids } from "./lib/hkt";
import { FormatDescriptors } from "./lib/format-descriptors";

type F<T> = (c: Connection) => T;

interface ApiDescription<F extends Ids> {
    iface: <O>(o: { [K in keyof O]: Type<F, O[K]> }) => Type<F, O>;
    fun: <T, U>(
        functionId: number,
        paramsFormat: <G extends Ids>(t: FormatDescriptors<G>) => Type<G, T>,
        resultFormat: <G extends Ids>(t: FormatDescriptors<G>) => Type<G, U>,
    ) => Type<F, AsyncFunction<T, U>>,
}

const description: ApiDescription<F> = {
    iface: <O>(o: { [K in keyof O]: F<O[K]> }) => (c: Connection) => {
        return Object.keys(o).reduce((res: O, key: string) => {
            return { ...res, [key]: (o as any)[key](c) };
        }, {} as O);
    },
    fun: (<T, U>(
        functionId: number,
        paramsFormat: <G extends Ids>(t: FormatDescriptors<G>) => Type<G, T>,
        resultFormat: <G extends Ids>(t: FormatDescriptors<G>) => Type<G, U>,
    ) => {
        return {} as any;
        // const paramsSerializer = paramsFormat(serializers);
        // const resultDeserializer = resultFormat(deserializers);
        // return ({ send, getNextRequestId, responseHandlers }: Connection) => {
        //     return (params: T): Promise<U> => {
        //         const requestId = getNextRequestId();
        //         send({
        //             functionId,
        //             requestId,
        //             params: paramsSerializer(params),
        //         });
        //         // TODO process error messages from server if method call resulted in error
        //         // TODO raise error if timeout exceeded
        //         return new Promise((res, rej) => {
        //             responseHandlers[requestId] = (input: Json) => {
        //                 res(resultDeserializer(input));
        //             };
        //         });
        //     };
        })
    },

};

const createApi = (p: ApiDescription) => {
    return p.iface(hax({
        sub: p.fun(
            1,
            subParams,
            subResult,
        ),
    }))
};

export const client = createApi(description);
