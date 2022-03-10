module.exports = {
  goodbye: {
    handler: 'handler.hello',
    events: [
      {
        http: {
          path: 'goodbye',
          method: 'get',
          cors: true,
          responseData: {
            200: {
              description: 'this went well',
              bodyType: 'goodbye',
            },
          },
          queryStringParameters: {
            who: {
              required: true,
              type: 'string',
              description: 'the person to say goodbye to',
            },
            count: {
              required: false,
              type: 'integer',
            },
          },
        },
      },
    ],
  },

  hello: {
    handler: 'handler.hello',
    events: [
      {
        http: {
          path: 'hello/{userID}',
          method: 'get',
          cors: true,
        },
      },
    ],
  },
  hellopost: {
    handler: 'handler.hello',
    events: [
      {
        http: {
          path: 'hello',
          method: 'post',
          cors: true,
          bodyType: 'helloPostBody',
          summary: 'This is a test of a post request to do something',
          headerParameters: {
            authorisation: {
              required: true,
              description: 'the authorisation token',
            },
          },
          responseData: {
            200: {
              description: 'this went well',
              bodyType: 'helloPostResponse',
            },
            300: {
              description: 'this went wrong',
              bodyType: 'post300',
            },

            400: {
              description: 'failed Post',
            },
            502: 'server error',
          },
        },
      },
    ],
  },
};
