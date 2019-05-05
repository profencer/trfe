import { hax } from "./lib/core";
import { serializers } from "./lib/serializers";
import { deserializers } from "./lib/deserializers";
import { clientDesc } from "./lib/client";
import { ApiDescription } from "./lib/client";
import { subParams } from "./generated-types";
import { subResult } from "./generated-types";

const createApi = (p: ApiDescription) => p.iface(hax({
  sub: p.fun(1, subParams(serializers), subResult(deserializers))
}));

export const client = createApi(clientDesc);