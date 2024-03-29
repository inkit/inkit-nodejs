import config from "./data/config.json";
import routingConfig from "./data/routing-config-map.json";
import {
  b64EncodeUnicode,
  capitalizeFirstLetter,
  convertCaseKebabCamel,
} from "./utils";
import axios from "axios";
import axiosRetry from "axios-retry";

const client = axios.create();

export type ConfigKeys =
  | "render"
  | "template"
  | "folder"
  | "document"
  | "batch";
export type MethodsType = "GET" | "PATCH" | "POST" | "DELETE";

export type InkitEntityKeys = (typeof EntityNameList)[number];

export type InkitType = {
  token: string;
  set apiToken(token: string);
} & {
  [k in InkitEntityKeys]: {
    list: (params?: any) => Promise<any>;
  } & { [key: string]: (params?: any) => Promise<any> };
};

axiosRetry(client, {
  retries: 0,
  retryDelay: () => 0,
});

const EntityNameList = [
  "Render",
  "Template",
  "Folder",
  "Batch",
  "Document",
] as const;

type InkitEntityType = Record<
  InkitEntityKeys,
  (this: { apiToken: string }, token: string) => void
>;

const InkitEntity: InkitEntityType = {} as any;

EntityNameList.forEach((name) => {
  InkitEntity[name] = function (this: { apiToken: string }, token: string) {
    this.apiToken = token;
  };
  setMethods(name);
});

const buildRequest = (path: string, method: MethodsType, data: any = {}) => {
  let requestData: { [key: string]: any } = {
    data: typeof data === "object" ? convertCaseKebabCamel(data) : {},
  };

  if (["GET", "DELETE"].includes(method)) {
    requestData = {
      params: Object.entries(requestData.data).reduce((acc, [key, value]) => {
        const keyName = key.includes("data_") ? key.replace("_", "-") : key;
        return {
          ...acc,
          [keyName]: value,
        };
      }, {}),
    };
  }

  if (RegExp("docx|pdf|html").test(path)) {
    requestData = {
      "axios-retry": {
        retries: 3,
        retryDelay: () => 1000,
        retryCondition: (...props: any) => {
          return props[0]?.response?.status === 404;
        },
      },
      data,
    };
  }

  if (["POST", "PATCH"].includes(method) && data.file) {
    requestData = {
      data: {
        ...data,
        file: b64EncodeUnicode(data.file),
      },
    };
  }

  if (path.includes("download")) {
    requestData = {
      responseType: "arraybuffer",
    };
  }

  return requestData;
};

function setMethods(type: InkitEntityKeys) {
  const confKey = type.toLowerCase() as ConfigKeys;

  routingConfig[confKey].routes.forEach((route: any) => {
    InkitEntity[type].prototype[route.sdkMethodName] = async function (
      data: any
    ) {
      try {
        let path = route.path;

        const reqData = buildRequest(path, route.httpMethod, data);

        if (path.includes("{id}")) {
          const id = data.entityId || data;

          path = route.path.replace("{id}", id);

          if (reqData?.data?.entityId) {
            delete reqData.data.entityId;
          }
        }

        if (reqData.data && !Object.values(reqData.data).length) {
          delete reqData.data;
        }

        return await client({
          url: `${config.HOST}/${path}`,
          method: route.httpMethod,
          ...reqData,
          headers: {
            "X-Inkit-API-Token": this.apiToken,
            "User-Agent": config.USER_AGENT,
          },
        });
      } catch (error) {
        throw error;
      }
    };
  });
}

const Inkit = {
  token: "",
  set apiToken(token: string) {
    this.token = token;

    Object.entries(InkitEntity).forEach(([key, value]) => {
      const entityName = capitalizeFirstLetter(key) as InkitEntityKeys;

      this[entityName] = new (value as any)(token);
    });
  },
} as InkitType;

module.exports = Inkit;
