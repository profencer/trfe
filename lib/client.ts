import WS from 'ws';

export const createWsConnection = (url: string): Promise<WS> => {
    const connection = new WS(url);
    return new Promise((res, rej) => {
        connection.on('open', () => {
            res(connection);
        });
        connection.on('error', (err) => {
            rej(err);
        })
    })
};
