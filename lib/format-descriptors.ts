import { Type, Ids } from "./hkt";
import { Json } from "./core";

export interface FormatDescriptors<F extends Ids> {
    str: Type<F, string>,
    num: Type<F, number>,
    bool: Type<F, boolean>,
    arr<T>(x: Type<F, T>): Type<F, Array<T>>,
    obj<O>(x: { [K in keyof O]: Type<F, O[K]> }): Type<F, O>,
    id: Type<F, Json>,
    satisfy<T>(fields: Type<F, T>, test: (t: T) => boolean): Type<F, T>,
}

export const exactString = <F extends Ids>(f: FormatDescriptors<F>) => {
    return (s: string): Type<F, string> => f.satisfy(f.str, (input: string) => input === s);
};

export const int32 = <F extends Ids>(f: FormatDescriptors<F>): Type<F, number> => {
    return f.satisfy(f.num, (n: number) => n === ~~n); 
};

