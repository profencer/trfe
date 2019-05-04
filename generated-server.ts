import { hax, Json, AsyncFunction } from "./lib/core";
import { requestFormat, responseFormat } from "./lib/json-rpc-types";
import { serializers, Serializer } from "./lib/serializers";
import { deserializers, Deserializer } from "./lib/deserializers";
import { subResult, subParams } from "./generated-types";
import { FormatDescriptors } from "./lib/format-descriptors";


const requestDeserializer = requestFormat(deserializers);
const responseSerializer = responseFormat(serializers);

type F<T> = (handler: T) => { [key: number]: AsyncFunction<Json, Json> }

interface ApiDescription {
    iface: <O>(o: { [K in keyof O]: F<O[K]> }) => F<O>;
    fun: <T, U>(
        functionId: number,
        paramsDeserializer: Deserializer<T>,
        resultSerializer: Serializer<U>,
    ) => F<AsyncFunction<T, U>>,
    api: <T>(handler: F<T>) => (api: T) => AsyncFunction<string, string>,
}

const description: ApiDescription = {
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
    api: <T>(handler: F<T>) => {
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
    },
};

const createApi = (p: ApiDescription) => (api: Api) => {
    return p.api(
        p.iface(hax({
            sub: p.fun(
                1,
                subParams(deserializers),
                subResult(serializers),
            ),
        }))
    );
};

export const server = createApi(description);
