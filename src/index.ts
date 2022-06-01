import axios from "axios";
import axiosRetry from "axios-retry";

import {
  b64EncodeUnicode,
  capitalizeFirstLetter,
  convertCaseKebabCamel,
} from "./utils";
import routingConfig from "./data/routing-config-map.json";
import config from "./data/config.json";

const client = axios.create();

export type InkitEntityKeys = keyof typeof InkitEntity;
export type ConfigKeys = "render";
export type MethodsType = "GET" | "PATCH" | "POST" | "DELETE";
export type InkitType = {
  token: string;
  set apiToken(token: string);
  Render?: any;
};

axiosRetry(client, {
  retries: 0,
  retryDelay: () => 0,
});

const InkitEntity = {
  Render: function Render(this: { apiToken: string }, token: string): any {
    this.apiToken = token;
  },
};

const buildRequest = (path: string, method: MethodsType, data: any) => {
  let requestData: { [key: string]: any } = { data:  convertCaseKebabCamel(data) };

  if (["GET", "DELETE"].includes(method)) {
    requestData  = {
      params: Object.entries(requestData.data).reduce((acc, [key, value]) => {
        const keyName = key.includes("data_") ? key.replace("_", "-") : key;
        return {
          ...acc,
          [keyName]: value,
        };
      }, {})
    };
  }
  if (RegExp("docx|pdf|html").test(path)) {
    requestData = {
      "axios-retry": {
        retries: 3,
        retryDelay: () => 1000,
      },
      data,
    };
  }
  if (["POST", "PATCH"].includes(method) && data.html) {
    requestData = {
      data: {
        ...data,
        html: b64EncodeUnicode(data.html),
      },
    };
  }

  return requestData;
};

const setMethods = (type: InkitEntityKeys) => {
  const confKey = type.toLowerCase() as ConfigKeys;

  routingConfig[confKey].routes.forEach((route: any) => {
    InkitEntity[type].prototype[route.sdkMethodName] = async function (
      data: any
    ) {
      try {
        let path = route.path;

        const reqData = buildRequest(path, route.httpMethod, data);

        if (path.includes("{id}")) {
          path = route.path.replace("{id}", data.entityId);
          if(reqData?.data?.entityId) {
            delete reqData.data.entityId
          }
        }

        if(reqData.data && !Object.values(reqData.data).length) {
          delete reqData.data
        }

        return await client({
          url: `${config.HOST}/${path}`,
          method: route.httpMethod,
          ...reqData,
          headers: {
            "X-Inkit-API-Token": this.apiToken,
            'User-Agent': config.USER_AGENT,
          },
        });
      } catch (error) {
        throw error;
      }
    };
  });
};

setMethods("Render");

const Inkit: InkitType = {
  token: "",
  set apiToken(token: string) {
    this.token = token;

    Object.entries(InkitEntity).forEach(([key, value]) => {
      const entityName = capitalizeFirstLetter(key) as InkitEntityKeys;

      this[entityName] = new (value as any)(token);
    });
  },
};

export default Inkit;
