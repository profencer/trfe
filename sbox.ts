import { Ids, Type } from "./lib/hkt";

// export interface IdToHkt<T> { }
// export type Ids = keyof IdToHkt<any>
// export type Type<Id extends Ids, A> = Id extends Ids ? IdToHkt<A>[Id] : any
type TT<A extends Ids, B> = Type<A, B>;
interface I<H> {
    fun: <T>(
        paramsFormat: <G extends Ids>(t: G) => TT<G, T>,
    ) => void,
}

const i: I<number> = {
    fun: <T>(
        paramsFormat: <G extends Ids>(t: G) => TT<G, T>,
    ) => {}
}

class A {
    m<T, U extends T>(t: T, u: U) { }
}

class B extends A {
    m<T, U>(t: T, u: U) { } 
//  ﹋ error
}
const compose = <A, B, C>(f: (a: A) => B, g: (b: B) => C) => (a: A): C => g(f(a));
const id = <A>(a: A): A => a;
const fuck = compose(id, id);