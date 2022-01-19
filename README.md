# Serverless Auto Swagger

This plugin allows you to automatically generate a swagger endpoint, describing your application endpoints. This is built from your existing serverless config and typescript definitions, reducing the duplication of work.

## Install

```sh
yarn add --dev serverless-auto-swagger
# or
npm install -D serverless-auto-swagger
```

Add the following plugin to your `serverless.yml`:

```yaml
plugins:
    - serverless-auto-swagger
```

## Usage

This plugin is designed to work with vanilla Serverless Framework. All you need to do is add this plugin to your plugin list and it will generate the swagger file and add the endpoints required. When you deploy your API, your new swagger UI will be available at `https://{your-url-domain}/swagger`.

You can also run `sls generate-swagger` if you want to generate the swagger file without deploying the application.

## Config Options

```
custom:
    autoswagger:
        generateSwaggerOnDeploy?: true | false
        typefiles?: ['./src/types/typefile1.d.ts', './src/subfolder/helper.d.ts']
        swaggerFiles?: ['./doc/endpointFromPlugin.json', './doc/iCannotPutThisInHttpEvent.json', './doc/aDefinitionWithoutTypescript.json']
        swaggerPath?: 'string'
```

`generateSwaggerOnDeploy` is a boolean which decides whether to generate a new swagger file on deployment. Default is `true`.

`typefiles` is an array of strings which defines where to find the typescript types to use for the request and response bodies. Default is `./src/types/api-types.d.ts`.

`swaggerFiles` is an array of string which will merge custom json OpenApi 2.0 files to the generated swagger

`swaggerPath` is a string for customize swagger path. Default is `swagger`. Your new swagger UI will be available at `https://{your-url-domain}/{swaggerPath}`

## Adding more details

The default swagger file from vanilla Serverless framework will have the correct paths and methods but no details about the requests or responses.

### Adding Data Types

This plugin uses typescript types to generate the data types for the endpoints. By default it pulls the types from `src/types/api-types.d.ts`.

You can then assign these typescript definitions to requests as `bodyType` on the http or https config, or to the response as seen just below.

### Responses

You can also add expected responses to each of the http endpoint events. This is an object that contains the response code with some example details:

```js
responseData: {
    // response with description and response body
    200: {
        description: 'this went well',
        bodyType: 'helloPostResponse',
    },

    // response with just a description
    400: {
        description: 'failed Post',
    },
    // shorthand for just a description
    502: 'server error',
}
```

### Post request expected body

When you create a `POST` or `PUT` endpoint, you expect to receive a specific structure of data as the body of the request.

You can do that by adding a `bodyType` to the http event:

```
http: {
    path: 'hello',
    method: 'post',
    cors: true,
    bodyType: 'helloPostBody',
}
```

### Query String Parameters

If you want to specify the query string parameters on an endpoint you can do this by adding an object of `queryStringParameters` to the event (original I know). This has two required properties of `required` and `type` as well as an optional `description`.

```
http: {
    path: 'goodbye',
    method: 'get',
    queryStringParameters: {
        bob: {
            required: true,
            type: 'string',
            description: 'bob',
        },
        count: {
            required: false,
            type: 'integer',
        },
    },
},
```

![Query String Parameters](./doc_images/queryStringParams.png)

### Exclude an endpoint

You can exclude some endpoints from the swagger generation by adding `exclude` to the http event:

```
http: {
    path: 'hello',
    method: 'post',
    exclude: true,
}
```

## with Serverless Offline

In the plugin list, you must list serverless-auto-swagger before the serverless-offline plugin. If you don't you won't get the required endpoints added to your local endpoints.



## Contributing
1. Clone repo
2. cd serverless-auto-swagger && npm install
3. node node ./node_modules/jest/bin/jest tests
