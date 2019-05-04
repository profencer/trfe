export interface JsonArray extends Array<Json> { }
export type JsonMap = { [member: string]: Json }
export type Json = JsonMap | JsonArray | string | number | boolean | null;
export type AsyncFunction<T, U> = (input: T) => Promise<U>;
export const hax = <T>(t: T) => t;
export type ArgType<T> = T extends (args: infer U) => any ? U : never;