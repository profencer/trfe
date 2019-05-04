import WS from 'ws';

const requestDeserializer = requestFormat(deserializers);
const responseSerializer = responseFormat(serializers);

export const createServer = (handler: (reqBody: string) => Promise<string>, opts: WS.ServerOptions): WS.Server => {
    const server = new WS.Server({
        port: 3000,
    });
    server.on('connection', (connection: WS) => {
        connection.on('message', async (rawMsg: string) => {
            connection.send(await handler(rawMsg));
        });
    });
    return server;
};
export const createServer2 = <T>(handler: F<T>) => {
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
};