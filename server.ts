import { createServer, createServer2 } from "./lib/server";
import { server } from "./generated/server";

createServer(createServer2(server)({
    async sub(params) {
        return { x: 1, y: 'lol', z: false }
    }
}), {
    port: 3000,
});