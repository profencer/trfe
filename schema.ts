// t.obj({
//     a: t.num,
//     b: t.bool,
//     c: t.str,
//     d: t.arr(t.num),
//     f: t.obj({ a: t.num }),
// });

// export const subResult = <F extends Ids>(t: FormatDescriptors<F>) => t.obj({
//     x: t.num,
//     y: t.str,
//     z: t.bool,
// });
// const createApi = (p: ApiDescription) => {
//     return p.iface(hax({
//         sub: p.fun(
//             1,
//             subParams(deserializers),
//             subResult(serializers),
//         ),
//     }))
// };
class Api {
    @id(1)
    sub(
        a: Int32, 
        b: Bool, 
        c: String, 
        d: Array<Int32>, 
        f: { a: Int32 },
    ): {
        x: Int32,
        y: String,
        z: Bool,
    }
    @id(2)
    add(
        a: Int32,
        b: Int32,
    ): {
        result: Int32,
    }
}
