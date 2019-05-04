export interface JsonArray extends Array<Json> { }
export type JsonMap = { [member: string]: Json }
export type Json = JsonMap | JsonArray | string | number | boolean | null;

export const hax = <T>(t: T) => t;
