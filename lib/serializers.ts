import { Json, JsonMap } from "./core";

export type Serializer<T> = (input: T) => Json;

interface FormatDescriptors {
    str: Serializer<string>,
    num: Serializer<number>,
    bool: Serializer<boolean>,
    arr<T>(elementSerializer: Serializer<T>): Serializer<Array<T>>,
    obj<O>(serializers: { [K in keyof O]: Serializer<O[K]> }): Serializer<O>,
    id: Serializer<Json>,
}

interface FormatDescriptorsExt {
    satisfy<T>(serializer: Serializer<T>, test: (t: T) => boolean): Serializer<T>,
    exactString(s: string): Serializer<string>,
    int32: Serializer<number>,
}

const Deserializers: FormatDescriptors = {
    str(input) {
        return input;
    },
    bool(input) {
        return input;
    },
    num(input) {
        return input;
    },
    arr<T>(elementSerializer: Serializer<T>): Serializer<T[]> {
        return (input) => input.map(elementSerializer);
    },
    obj<O>(serializers: { [K in keyof O]: Serializer<O[K]> }): Serializer<O> {
        return (input) => {
            return Object.keys(serializers).reduce((current: JsonMap, key: string) => {
                return { ...current, [key]: (serializers as any)[key]((input as any)[key]) } as JsonMap;
            }, {} as JsonMap);
        };
    },
    id(input) { return input; }
}
export const satisfy = <T>(serializer: Serializer<T>, test: (t: T) => boolean) => (input: T): Json => {
    if (!test(input)) {
        throw new Error('Input does not satisfy provided test');
    } else {
        return serializer(input);
    }
}
const withExt = (s: FormatDescriptors): FormatDescriptors & FormatDescriptorsExt => ({
    ...s,
    satisfy,
    exactString: (label: string) => satisfy(s.str, (input: string) => input === label),
    int32: satisfy(s.num, (n: number) => n === ~~n),
});

export const makeSerializer = <T>(f: (ds: FormatDescriptors & FormatDescriptorsExt) => T) => {
    return f(withExt(Deserializers));
}