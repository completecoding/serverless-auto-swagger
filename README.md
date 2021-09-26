# Serverless Auto Swagger

This plugin allows you to automatically generate a swagger endpoint, describing your application endpoints.

## Usage

This plugin is designed to work with vanilla Serverless Framework. All you need to do is add this plugin to your plugin list and it will generate the swagger file and add the endpoints required. Your new swagger UI will be available at `https://{your-url-domain}/swagger`.

### Adding more details

The default swagger file from vanilla Serverless framework will have the correct paths and methods but no details about the data.

#### Adding Data Types

This plugin uses typescript types to generate the data types for the endpoints. By default it pulls the types from `src/types/api-types.d.ts`.

You can then assign these typescript definition to post requests

#### Responses

You can now add responses to each of the http endpoint events. This is an object that contains the response code with some example details:

```js
responses: {
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

### with Serverless Offline

In the plugin list, you must list serverless-auto-swagger before the serverless-offline plugin. If you don't you won't get the required endpoints added to your local endpoints.
