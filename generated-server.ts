import { hax, Json } from "./lib/core";
import { requestFormat, responseFormat } from "./lib/json-rpc-types";
import { serializers } from "./lib/serializers";
import { deserializers } from "./lib/deserializers";
import { subResult, subParams } from "./generated-types";

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
const subParamsValidator = subParams(deserializers);
const subResultSerializer = subResult(serializers);

const sub = async (api: Api, rawParams: Json) => {
    const params = subParamsValidator(rawParams);
    return subResultSerializer(await api.sub(params));
}

const handlers: { [key: number]: (api: Api, rawParams: Json) => Promise<Json> } = {
    1: sub,
};

const requestDeserializer = requestFormat(deserializers);
const responseSerializer = responseFormat(serializers);

export const createHandler = (api: Api) => async (reqBody: string) => {
    const req = requestDeserializer(JSON.parse(reqBody));
    const result = await handlers[req.functionId](api, req.params);
    return JSON.stringify(responseSerializer({
        requestId: req.requestId,
        result,
    }));
};
