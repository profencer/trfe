import { createHandler, Api } from "./generated-server";
import WS from 'ws';
import { JsonRpcRequestValidator } from "./lib";
// import { parse } from '@babel/parser';
// import traverse from '@babel/traverse';
// import generate from '@babel/generator';
// import * as t from '@babel/types';
// import tpl from '@babel/template';
// import fs from 'mz/fs';

// // плагин бабеля - это настройки для traverse
// (async () => {
//     const code = await fs.readFile('./schema.ts', 'utf-8');
//     const ast = parse(code, {
//         plugins: ['typescript'],
//     });
//     // traverse(ast, {
//     //     enter(path) {
//     //         if (path.isIdentifier() && path.parent.type === 'TSInterfaceDeclaration' && path.parent.id === path.node) {
//     //             path.replaceWith(t.identifier('HOOY'));
//     //             path.stop();
//     //         }
//     //     }, 
//     //     exit(path) {
//     //         // так тоже бывает
//     //     }
//     // });



//     console.log(JSON.stringify(ast.program.body[0], null, 4));
//     debugger;
//     // console.log(generate(ast).code);
// })();
const api: Api = {
    async sub(params) {
        return { x: 1, y: 'lol', z: false }
    }
}
const handler = createHandler(api);
