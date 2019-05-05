import { hax } from "./lib/core";
import { serializers } from "./lib/serializers";
import { deserializers } from "./lib/deserializers";
import { serverDesc } from "./lib/server";
import { ApiDescription } from "./lib/server";
import { subParams } from "./generated-types";
import { subResult } from "./generated-types";

const createApi = (p: ApiDescription) => p.iface(hax({
  sub: p.fun(1, subParams(deserializers), subResult(serializers))
}));

export const server = createApi(serverDesc);