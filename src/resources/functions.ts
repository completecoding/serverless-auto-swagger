import { Serverless, ServerlessFunction } from "../serverlessPlugin"

export default (serverless: Serverless) => {
  const handlerPath = "swagger/"
  const configInput = serverless?.configurationInput || serverless.service
  const path = serverless.service.custom?.autoswagger?.swaggerPath ?? "swagger"
  const name =
    typeof configInput?.service == "object"
      ? configInput.service.name
      : configInput.service
  const stage = configInput?.provider?.stage

  const useStage = serverless.service.custom?.autoswagger?.useStage

  if (useStage) {
    return {
      swaggerUI: {
        name: name && stage ? `${name}-${stage}-swagger-ui` : undefined,
        handler: handlerPath + "swaggerhtml.handler",
        disableLogs: true,
        events: [
          {
            httpApi: {
              method: "get",
              path: `/${stage}/swagger`,
            },
          },
        ],
      },

      swaggerJSON: {
        name: name && stage ? `${name}-${stage}-swagger-json` : undefined,
        handler: handlerPath + "swaggerjson.handler",
        disableLogs: true,
        events: [
          {
            httpApi: {
              method: "get",
              path: `/${stage}/swaggerjson`,
            },
          },
        ],
      },
    } as Record<string, ServerlessFunction>
  } else {
    return {
      swaggerUI: {
        name: name && stage ? `${name}-${stage}-swagger-ui` : undefined,
        handler: handlerPath + "swaggerhtml.handler",
        disableLogs: true,
        events: [
          {
            httpApi: {
              method: "get",
              path: `/swagger`,
            },
          },
        ],
      },

      swaggerJSON: {
        name: name && stage ? `${name}-${stage}-swagger-json` : undefined,
        handler: handlerPath + "swaggerjson.handler",
        disableLogs: true,
        events: [
          {
            httpApi: {
              method: "get",
              path: `/swaggerjson`,
            },
          },
        ],
      },
    } as Record<string, ServerlessFunction>
  }
}
