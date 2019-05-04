import { Ids } from "./lib/hkt";
import { FormatDescriptors } from "./lib/format-descriptors";

export const subParams = <F extends Ids>(t: FormatDescriptors<F>) => t.obj({
    a: t.num,
    b: t.bool,
    c: t.str,
    d: t.arr(t.num),
    f: t.obj({ a: t.num }),
});

export const subResult = <F extends Ids>(t: FormatDescriptors<F>) => t.obj({
    x: t.num,
    y: t.str,
    z: t.bool,
});
