interface JsonMap extends Array<Json> { }
export type Json = { [member: string]: Json } | JsonMap | string | number | boolean | null;

export const str = (input: Json): string => {
    if (typeof input !== 'string') {
        throw new Error('Input should be string!');
    } else {
        return input;
    }
};

export const bool = (input: Json): boolean => {
    if (typeof input !== 'boolean') {
        throw new Error('Input should be string!');
    } else {
        return input;
    }
};

export const exactString = (s: string) => satisfy(str, (input: string) => input === s)

export const num = (input: Json): number => {
    if (typeof input !== 'number') {
        throw new Error('Input should be number!');
    } else {
        return input;
    }
};

export const arr = <T>(elementValidator: (input: Json) => T) => (input: Json): T[] => {
    if (!Array.isArray(input)) {
        throw new Error('Input should be array!');
    } else {
        try {
            input.forEach((el) => elementValidator(el))
            return (input as unknown) as T[];
        }
        catch (e) {
            throw new Error('Array elements should be of other type!');
        }
    }
}
export const satisfy = <T>(validator: (input: Json) => T, test: (t: T) => boolean) => (input: Json): T => {
    const res = validator(input);
    if (!test(res)) {
        throw new Error('Input does not satisfy provided test');
    } else {
        return res;
    }
}

export const id = (input: Json): any => input;

export const Int32 = satisfy(num, (n: number) => n === ~~n);

export const obj = <O extends any>(validators: { [K in keyof O]: (input: Json) => O[K] }) => (input: Json): O => {
    if (typeof input !== 'object' && !Array.isArray(input)) {
        throw new Error('Input should be object');
    } else {
        return Object.keys(validators).reduce((current: O, key: string) => {
            return { ...current, [key]: (validators as any)[key]((input as any)[key]) } as O;
        }, {} as O);
    }
};
