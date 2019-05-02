import { obj, exactString, num, id } from "./validators";

export const JsonRpcRequestValidator = obj({
    protocolVersion: exactString('1.0'),
    procedureId: num,
    id: num,
    params: id,
});

// OMG TS NEEDS THIS TO INFER TYPE CORRECTLY
// TRY USING VALIDATOR WITHOUT THIS LOL
export const hax = <T>(t: T) => t;

