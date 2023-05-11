import { InkitEntityKeys, MethodsType } from "./index";

declare function buildRequestData(
  path: string,
  method: MethodsType,
  data: any
): void;
declare function setMethods(type: InkitEntityKeys): void;
