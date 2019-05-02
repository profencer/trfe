import { obj, exactString, num, id, bool, str, arr } from "./lib/validators";
import { hax, JsonRpcRequestValidator } from "./lib/core";
interface Api {
    sub(
        params: {
            a: number,
            b: boolean,
            c: string,
            d: number[],
            f: { a: number },
        }
    ): Promise<number>
}

const subParamsValidator = obj({
    a: num,
    b: bool,
    c: str,
    d: hax(arr(num)),
    f: hax(obj({ a: num })),
});
// const subResultSerializer = obj({
//     a: num,
//     b: bool,
//     c: str,
//     d: hax(arr(num)),
//     f: hax(obj({ a: num })),
// }).serializer
const sub = (api: Api, rawParams: any) => {
    const params = subParamsValidator(rawParams);
    return JSON.stringify(api.sub(params));
}
const handlers: {[key: number]: (api: Api, rawParams: any) => string} = {
    1: sub,
};
export const createHandler = (api: Api) => (reqBody: string) => {
    try {
        const req = JsonRpcRequestValidator(JSON.parse(reqBody));
        const handler = handlers[req.procedureId](api, req.params);
    } catch (e) {
        return () => {
            console.log('Provided message was in bad format')
        }
    }
} 