import WS from 'ws';

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
