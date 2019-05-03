import { hax, Json } from "./lib/core";
import { makeSerializer } from "./lib/serializers";
import { makeDeserializer } from "./lib/deserializers";
import { JsonRpcRequestValidator, JsonRpcResponseSerializer } from "./lib/server";

export interface Api {
    sub(
        params: {
            a: number,
            b: boolean,
            c: string,
            d: number[],
            f: { a: number },
        }
    ): Promise<{
        x: number,
        y: string,
        z: boolean,
    }>
}
const subParamsValidator = makeDeserializer(t => t.obj({
    a: t.num,
    b: t.bool,
    c: t.str,
    d: hax(t.arr(t.num)),
    f: hax(t.obj({ a: t.num })),
}));
const subResultSerializer = makeSerializer(t => t.obj({
    x: t.num,
    y: t.str,
    z: t.bool,
}));

const sub = async (api: Api, rawParams: Json) => {
    const params = subParamsValidator(rawParams);
    return subResultSerializer(await api.sub(params));
}

const handlers: { [key: number]: (api: Api, rawParams: Json) => Promise<Json> } = {
    1: sub,
};

export const createHandler = (api: Api) => async (reqBody: string) => {
    const req = JsonRpcRequestValidator(JSON.parse(reqBody));
    const result = await handlers[req.functionId](api, req.params);
    return JSON.stringify(JsonRpcResponseSerializer({
        requestId: req.requestId,
        result,
    }));
} 