import { Json } from "./core";

export type Deserializer<T> = (input: T) => Json;

interface FormatDescriptors {
    str: Deserializer<string>,
    num: Deserializer<number>,
    bool: Deserializer<boolean>,
    arr<T>(elementSerializer: Deserializer<T>): Deserializer<Array<T>>,
    obj<O>(validators: { [K in keyof O]: Deserializer<O[K]> }): Deserializer<O>,
    id: Deserializer<Json>,
}

interface FormatDescriptorsExt {
    satisfy<T>(deserializer: Deserializer<T>, test: (t: T) => boolean): Deserializer<T>,
    exactString(s: string): (input: Json) => string,
    int32(input: Json): number,
}

const Deserializers: FormatDescriptors = {
    str(input) {
        if (typeof input !== 'string') {
            throw new Error('Input should be string!');
        } else {
            return input;
        }
    },
    bool(input) {
        if (typeof input !== 'boolean') {
            throw new Error('Input should be string!');
        } else {
            return input;
        }
    },
    num(input) {
        if (typeof input !== 'number') {
            throw new Error('Input should be number!');
        } else {
            return input;
        }
    },
    arr<T>(elementValidator: (input: Json) => T): (input: Json) => T[] {
        return (input) => {
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
        };
    },
    obj<O>(validators: { [K in keyof O]: (input: Json) => O[K] }): (input: Json) => O {
        return (input) => {
            if (typeof input !== 'object' && !Array.isArray(input)) {
                throw new Error('Input should be object');
            } else {
                return Object.keys(validators).reduce((current: O, key: string) => {
                    return { ...current, [key]: (validators as any)[key]((input as any)[key]) } as O;
                }, {} as O);
            }
        };
    },
    id(input){ return input; }
}
export const satisfy = <T>(validator: (input: Json) => T, test: (t: T) => boolean) => (input: Json): T => {
    const res = validator(input);
    if (!test(res)) {
        throw new Error('Input does not satisfy provided test');
    } else {
        return res;
    }
}
const withExt = (s: FormatDescriptors): FormatDescriptors & FormatDescriptorsExt => ({
    ...s,
    satisfy,
    exactString: (label: string) => satisfy(s.str, (input: string) => input === label),
    int32: satisfy(s.num, (n: number) => n === ~~n),
});

export const makeDeserializer = <T>(f: (ds: FormatDescriptors & FormatDescriptorsExt) => T) => {
    return f(withExt(Deserializers));
}