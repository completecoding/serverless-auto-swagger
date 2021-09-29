const swagger = require('./swagger');

exports.handler = async () => {
    return {
        statusCode: 200,
        body: JSON.stringify(swagger),
    };
};
