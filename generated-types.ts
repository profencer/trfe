import { Ids } from "./lib/hkt";
import { FormatDescriptors } from "./lib/format-descriptors";
export const subParams = <F extends Ids>(p: FormatDescriptors<F>) => p.obj({
  a: p.num,
  b: p.bool,
  c: p.str,
  d: p.arr(p.num),
  f: p.obj({
    a: p.num
  })
});
export const subResult = <F extends Ids>(p: FormatDescriptors<F>) => p.obj({
  x: p.num,
  y: p.str,
  z: p.bool
});