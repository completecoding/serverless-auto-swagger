import {
  CustomHttpEvent,
  HeaderParameters,
  HttpResponses,
  PathParameterPath,
  PathParameters,
  QueryStringParameters,
} from './types/serverless-plugin.types';
import { Parameter, Response } from './types/swagger.types';
import { removeStringFromArray } from './helperFunctions';

export const formatResponses = (responseData: HttpResponses | undefined): Record<string, Response> => {
  if (!responseData) {
    // could throw error
    return { 200: { description: '200 response' } };
  }
  const formatted: Record<string, Response> = {};
  Object.entries(responseData).forEach(([statusCode, responseDetails]) => {
    if (typeof responseDetails == 'string') {
      formatted[statusCode] = {
        description: responseDetails,
      };
      return;
    }
    const response: Response = { description: responseDetails.description || `${statusCode} response` };
    if (responseDetails.bodyType) {
      response.schema = { $ref: `#/definitions/${responseDetails.bodyType}` };
    }

    formatted[statusCode] = response;
  });

  return formatted;
};

// httpEventToSecurity = (http: EitherHttpEvent) => {
//   // TODO - add security sections
//   return undefined
// }

// The arg is actually type `HttpEvent | HttpApiEvent`, but we only use it if it has httpEvent props (or shared props),
//  so we can lie to the compiler to make typing simpler
export const httpEventToParameters = (httpEvent: CustomHttpEvent): Parameter[] => {
  const parameters: Parameter[] = [];

  if (httpEvent.bodyType) {
    parameters.push({
      in: 'body',
      name: 'body',
      description: 'Body required in the request',
      required: true,
      schema: { $ref: `#/definitions/${httpEvent.bodyType}` },
    });
  }

  const rawPathParams: PathParameters['path'] = httpEvent.request?.parameters?.paths;
  const match = httpEvent.path.match(/[^{}]+(?=})/g);
  let pathParameters: string[] = match ?? [];

  if (rawPathParams) {
    Object.entries(rawPathParams ?? {}).forEach(([param, paramInfo]) => {
      parameters.push(pathToParam(param, paramInfo));
      pathParameters = removeStringFromArray(pathParameters, param);
    });
  }

  // If no match, will just be [] anyway
  pathParameters.forEach((param: string) => parameters.push(pathToParam(param)));

  if (httpEvent.headerParameters || httpEvent.request?.parameters?.headers) {
    // If no headerParameters are provided, try to use the builtin headers
    const rawHeaderParams: HeaderParameters =
      httpEvent.headerParameters ??
      Object.entries(httpEvent.request!.parameters!.headers!).reduce(
        (acc, [name, required]) => ({ ...acc, [name]: { required, type: 'string' } }),
        {}
      );

    Object.entries(rawHeaderParams).forEach(([param, data]) => {
      parameters.push({
        in: 'header',
        name: param,
        required: data.required ?? false,
        type: data.type ?? 'string',
        description: data.description,
      });
    });
  }

  if (httpEvent.queryStringParameters || httpEvent.request?.parameters?.querystrings) {
    // If no queryStringParameters are provided, try to use the builtin query strings
    const rawQueryParams: QueryStringParameters =
      httpEvent.queryStringParameters ??
      Object.entries(httpEvent.request!.parameters!.querystrings!).reduce(
        (acc, [name, required]) => ({ ...acc, [name]: { required, type: 'string' } }),
        {}
      );

    Object.entries(rawQueryParams).forEach(([param, data]) => {
      parameters.push({
        in: 'query',
        name: param,
        type: data.type ?? 'string',
        description: data.description,
        required: data.required ?? false,
        ...(data.type === 'array'
          ? {
              items: { type: data.arrayItemsType },
              collectionFormat: 'multi',
            }
          : {}),
      });
    });
  }

  return parameters;
};
export const pathToParam = (pathParam: string, paramInfoOrRequired?: PathParameterPath[string]): Parameter => {
  const isObj = typeof paramInfoOrRequired === 'object';
  const required = (isObj ? paramInfoOrRequired.required : paramInfoOrRequired) ?? true;

  return {
    name: pathParam,
    in: 'path',
    required,
    description: isObj ? paramInfoOrRequired.description : undefined,
    type: 'string',
  };
};
