import { Json } from "./core";
import { FormatDescriptors } from "./format-descriptors";

export type Deserializer<T> = (input: Json) => T;
export type DeserializerId = 'Deserializer';

declare module './hkt' {
    interface IdToHkt<T> {
        Deserializer: Deserializer<T>,
    }
}

export const deserializers: FormatDescriptors<DeserializerId> = {
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
    id(input) {
        return input;
    },
    satisfy<T>(validator: (input: Json) => T, test: (t: T) => boolean) {
        return (input: Json): T => {
            const res = validator(input);
            if (!test(res)) {
                throw new Error('Input does not satisfy provided test');
            } else {
                return res;
            }
        };
    },
};
