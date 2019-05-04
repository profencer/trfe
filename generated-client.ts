import { SendRequest, createRequestSender } from "./lib/client";
import { serializers } from "./lib/serializers";
import { subResult, subParams } from "./generated-types";
import { deserializers } from "./lib/deserializers";

const createApi = (sendRequest: SendRequest) => {
    const sub = sendRequest(
        1,
        subParams(serializers),
        subResult(deserializers),
    );
    return {
        sub,
    };
};

export const client = async (url: string) => createApi(await createRequestSender(url));
