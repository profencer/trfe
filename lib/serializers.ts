import { Json, JsonMap } from "./core";
import { FormatDescriptors } from "./format-descriptors";

export type Serializer<T> = (input: T) => Json;
export type SerializerId = 'Serializer';

declare module './hkt' {
    interface IdToHkt<T> {
        Serializer: Serializer<T>,
    }
}

export const serializers: FormatDescriptors<SerializerId> = {
    str(input: string) {
        return input;
    },
    bool(input: boolean) {
        return input;
    },
    num(input: number){
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
    id(input: Json) {
        return input;
    },
    satisfy<T>(serializer: Serializer<T>, test: (t: T) => boolean) {
        return (input: T): Json => {
            if (!test(input)) {
                throw new Error('Input does not satisfy provided test');
            } else {
                return serializer(input);
            }
        };
    },
};
