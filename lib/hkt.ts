export interface IdToHkt<T> { }
export type Ids = keyof IdToHkt<any>
export type Type<Id extends Ids, A> = Id extends Ids ? IdToHkt<A>[Id] : any