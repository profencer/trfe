export interface IdToHkt<A> {}
export type Ids = keyof IdToHkt<any>
export type Type<Id extends Ids, A> = Id extends Ids ? IdToHkt<A>[Id] : any