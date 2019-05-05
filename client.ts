import { createWsConnection, createConnection } from './lib/client';
import { client } from './generated/client';

const main = async () => {
    const api = await client(createConnection(await createWsConnection('ws://127.0.0.1:3000')));
    const res = await api.sub({ a: 1, b: true, c: "huy", d: [1, 2, 3], f: { a: 1 } });
    const res2 = await api.add({ a: 1, b: 2 });

    console.log(res, res2);
};
main();