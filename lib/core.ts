export interface JsonMap extends Array<Json> { }
export type Json = { [member: string]: Json } | JsonMap | string | number | boolean | null;

export const hax = <T>(t: T) => t;
