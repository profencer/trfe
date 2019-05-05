import { FormatDescriptors } from "./format-descriptors";
import { Ids } from "./hkt";

export const requestFormat = <T extends Ids>(t: FormatDescriptors<T>)  => t.obj({
    functionId: t.num,
    requestId: t.num,
    params: t.id,
});

export const responseFormat = <T extends Ids>(t: FormatDescriptors<T>) => t.obj({
    requestId: t.num,
    result: t.id,
});
