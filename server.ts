import { createServer, createServer2 } from "./lib/server";
import { server } from "./generated/server";

createServer(createServer2(server)({
    async sub(params) {
        return { x: 1, y: 'lol', z: false }
    },
    async add(params) {
        const {a, b} = params;
        return {
            result: a + b,
        };
    }
}), {
    port: 3000,
});