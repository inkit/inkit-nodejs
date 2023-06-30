import camelCase from "lodash/camelCase";
import snakeCase from "lodash/snakeCase";

export const b64EncodeUnicode = (str: string) => {
  return Buffer.from(
    encodeURIComponent(str).replace(
      /%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        const code: any = "0x" + p1;
        return String.fromCharCode(code);
      }
    )
  ).toString("base64");
};

export const convertCaseKebabCamel = (
  obj: any,
  baseFrom: "snake" | "camel" = "camel",
  exceptions: string[] = ["mergeParameters"]
) => {
  const keys = Object.keys(obj);
  const returnObj = {} as { [key: string]: any };
  const stringConvertFunction = baseFrom === "snake" ? camelCase : snakeCase;

  for (const key of keys) {
    const propValue = obj[key];

    if (exceptions.includes(key)) {
      returnObj[stringConvertFunction(key)] = propValue;
      continue;
    }

    if (propValue && typeof propValue === "object") {
      if (Array.isArray(propValue)) {
        const returnArr = [];

        for (const idx in propValue) {
          if (propValue[idx] && typeof propValue[idx] === "object") {
            returnArr.push(convertCaseKebabCamel(propValue[idx], baseFrom));
          } else {
            returnArr.push(propValue[idx]);
          }
        }

        returnObj[stringConvertFunction(key)] = returnArr;
      } else {
        returnObj[stringConvertFunction(key)] = convertCaseKebabCamel(
          propValue,
          baseFrom
        );
      }
    } else {
      returnObj[stringConvertFunction(key)] = propValue;
    }
  }

  return returnObj;
};

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
