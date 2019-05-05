import { parse } from '@babel/parser';
import generate from '@babel/generator';
import * as t from '@babel/types';
import tpl from '@babel/template';
import fs from 'mz/fs';

const typedIdentifier = (name: string, type: t.TSType) => {
    const i = t.identifier(name);
    i.typeAnnotation = t.tsTypeAnnotation(type);
    return i;
}

const importTpl = (what: string, from: string) => t.importDeclaration([
    t.importSpecifier(t.identifier(what), t.identifier(what)),
], t.stringLiteral(from))

const serverImportTpl = () => [
    importTpl('hax', '../lib/core'),
    importTpl('serializers', '../lib/serializers'),
    importTpl('deserializers', '../lib/deserializers'),
    importTpl('serverDesc', '../lib/server'),
    importTpl('ApiDescription', '../lib/server'),
];

const clientImportTpl = () => [
    importTpl('hax', '../lib/core'),
    importTpl('serializers', '../lib/serializers'),
    importTpl('deserializers', '../lib/deserializers'),
    importTpl('clientDesc', '../lib/client'),
    importTpl('ApiDescription', '../lib/client'),
];


const expressionTpl = tpl.expression`
    p.iface(hax(FUNCS))
`;
const serverFunTpl = tpl.expression`
    p.fun(
        FUNID,
        METHOD1(deserializers),
        METHOD2(serializers),
    )
`;
const clientFunTpl = tpl.expression`
    p.fun(
        FUNID,
        METHOD1(serializers),
        METHOD2(deserializers),
    )
`;
const serverExportTpl = tpl.statement`
    export const server = createApi(serverDesc);
`;
const clientExportTpl = tpl.statement`
    export const client = createApi(clientDesc);
`;
const createApiTpl = (funcs: ObjAst) => t.variableDeclaration('const', [
    t.variableDeclarator(
        t.identifier('createApi'),
        t.arrowFunctionExpression(
            [typedIdentifier('p', t.tsTypeReference(t.identifier('ApiDescription')))],
            expressionTpl({
                FUNCS: nativeObjTpl(funcs)
            })
        ),
    ),
]);

const typesImportTpl = () => [
    importTpl('Ids', '../lib/hkt'),
    importTpl('FormatDescriptors', '../lib/format-descriptors'),
];

// завести баги на бабель 
// где-то мы эни видели
// t.tsTypeReference имеет очень плохие типы, думал лучше будет
const typeSchemaTpl = (name: string, body: t.Expression) => {
    const pind = typedIdentifier(
        'p',
        t.tsTypeReference(t.identifier('FormatDescriptors'), t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier('F'))]))
    );

    const afe = t.arrowFunctionExpression(
        [pind],
        body,
    );
    const tparam = t.tsTypeParameter();

    tparam.name = 'F';
    tparam.constraint = t.tsTypeReference(t.identifier('Ids'));
    afe.typeParameters = t.tsTypeParameterDeclaration([tparam]);
    return t.exportNamedDeclaration(t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(name), afe),
    ]), [])
};
type ObjAst = { [k: string]: t.Expression }
const nativeObjTpl = (obj: ObjAst) => {
    const fields = Object.keys(obj).map((key: string) => {
        return t.objectProperty(t.identifier(key), obj[key]);
    });
    return t.objectExpression(fields)
}  
const objTpl = (obj: ObjAst) => {
    return t.callExpression(
        t.memberExpression(t.identifier('p'), t.identifier('obj')),
        [nativeObjTpl(obj)],
    );
};

const getType = (ta: t.TypeAnnotation | t.TSTypeAnnotation | t.Noop | null): t.TSType => {
    if (!ta || !t.isTSTypeAnnotation(ta)) {
        throw new Error()
    } else {
        return ta.typeAnnotation;
    }
}
const generateType = (type: t.TSType): t.Expression => {
    if (t.isTSTypeReference(type)) {
        const tn = type.typeName;
        if (!t.isIdentifier(tn)) {
            throw new Error();
        }
        if (tn.name === 'Int32') {
            return t.memberExpression(t.identifier('p'), t.identifier('num'));
        } else if (tn.name === 'Bool') {
            return t.memberExpression(t.identifier('p'), t.identifier('bool'));
        } else if (tn.name === 'String') {
            return t.memberExpression(t.identifier('p'), t.identifier('str'));
        } else if (tn.name === 'Array') {
            const tp = type.typeParameters;
            if (!tp) {
                throw new Error();
            }
            const p = tp.params;
            if (p.length !== 1) {
                throw new Error();
            }
            const q = p[0];
            return t.callExpression(
                t.memberExpression(t.identifier('p'), t.identifier('arr')),
                [generateType(q)],
            );
        } else {
            throw new Error();
        }
    } else if (t.isTSTypeLiteral(type)) {
        return objTpl(type.members.reduce((result: ObjAst, member: t.TSTypeElement) => {
            if (!t.isTSPropertySignature(member)) {
                throw new Error();
            }
            const key = member.key;
            if (!t.isIdentifier(key)) {
                throw new Error();
            }
            return { ...result, [key.name]: generateType(getType(member.typeAnnotation)) };
        }, {} as ObjAst));
    } else {
        throw new Error();
    }
};

const generateParams = (params: (t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty)[]) => {
    const obj: ObjAst = {};
    params.forEach((param) => {
        if (param.type !== 'Identifier') {
            throw new Error();
        }
        const x = param.typeAnnotation;
        if (!x || x.type !== 'TSTypeAnnotation') {
            throw new Error();
        }
        obj[param.name] = generateType(x.typeAnnotation);
    });
    return objTpl(obj);
};

(async () => {
    const code = await fs.readFile('./schema.ts', 'utf-8');
    const ast = parse(code, {
        plugins: ['typescript', 'decorators-legacy'],
        sourceType: 'module',
    });

    const c = ast.program.body;
    await fs.writeFile('./schema-ast.json', JSON.stringify(ast.program.body[0], null, 4));
    if (c.length !== 1) {
        throw new Error();
    }
    const d = c[0];

    if (d.type !== 'ClassDeclaration') {
        throw new Error();
    }
    const id = d.id;
    if (!t.isIdentifier(id)) {
        throw new Error();
    }
    if (id.name !== 'Api') {
        throw new Error();
    }
    const e = d.body.body;
    const result: t.Statement[] = [...typesImportTpl()];
    const schemaImports: t.Statement[] = [];
    const serverFunctions: ObjAst = {};
    const clientFunctions: ObjAst = {};
    e.forEach((elem: t.ClassMethod | t.ClassPrivateMethod | t.ClassProperty | t.ClassPrivateProperty | t.TSDeclareMethod | t.TSIndexSignature) => {
        if (elem.type !== 'TSDeclareMethod') {
            throw new Error();
        }
        const x = elem.key;
        if (x.type !== 'Identifier') {
            throw new Error();
        }
        const decorators = elem.decorators;
        if(!decorators || decorators.length != 1){
            throw new Error();
        }
        const decoratorExpression = decorators[0].expression
        if(!t.isCallExpression(decoratorExpression)){
            throw new Error();
        }
        const decoratorArguments = decoratorExpression.arguments;
        if(decoratorArguments.length !== 1){
            throw new Error();
        }
        const functionId = decoratorArguments[0];
        if(!t.isNumericLiteral(functionId)) {
            throw new Error();
        }
        
        const methodName = x.name;
        const paramsName = `${methodName}Params`;
        const resultName = `${methodName}Result`;
        schemaImports.push(importTpl(paramsName, './types'));
        schemaImports.push(importTpl(resultName, './types'));
        serverFunctions[methodName] = serverFunTpl({
            FUNID: functionId,
            METHOD1: t.identifier(paramsName),
            METHOD2: t.identifier(resultName),
        });
        clientFunctions[methodName] = clientFunTpl({
            FUNID: functionId,
            METHOD1: t.identifier(paramsName),
            METHOD2: t.identifier(resultName),
        });
        result.push(typeSchemaTpl(paramsName, generateParams(elem.params)));
        result.push(typeSchemaTpl(resultName, generateType(getType(elem.returnType))));
    });
    const serverCode = t.program([
        ...serverImportTpl(),
        ...schemaImports,
        createApiTpl(serverFunctions),
        serverExportTpl()
    ]);

    const clientCode = t.program([
        ...clientImportTpl(),
        ...schemaImports,
        createApiTpl(clientFunctions),
        clientExportTpl()
    ]);

    // раазобраться с индетацией
    await fs.writeFile('generated/client.ts', generate(clientCode).code);
    await fs.writeFile('generated/server.ts', generate(serverCode).code);
    await fs.writeFile('generated/types.ts', generate(t.program(result)).code);
})();