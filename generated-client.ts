import { SendRequest, createRequestSender } from "./lib/client";
import { makeSerializer } from "./lib/serializers";
import { hax } from "./lib/core";
import { makeDeserializer } from "./lib/deserializers";


const createApi = (sendRequest: SendRequest) => {
    const sub = sendRequest(
        1,
        makeSerializer(t => t.obj({
            a: t.num,
            b: t.bool,
            c: t.str,
            d: hax(t.arr(t.num)),
            f: hax(t.obj({ a: t.num })),
        })),
        makeDeserializer(t => t.obj({
            x: t.num,
            y: t.str,
            z: t.bool,
        })),
    );
    return {
        sub,
    };
};

export const client = async (url: string) => createApi(await createRequestSender(url));

