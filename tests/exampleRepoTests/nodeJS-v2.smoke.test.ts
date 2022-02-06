const swaggerJson = require('../../test-repos/nodeJS-v2/swagger/swagger.js');

describe('nodeJS-v2', () => {
  beforeAll(async () => {
    console.log('result', swaggerJson);
  });

  it('general Info', async () => {
    expect(swaggerJson.info.title).toEqual('nodeJS-v2');
    const paths = Object.keys(swaggerJson.paths);
    expect(paths.length).toEqual(3);

    const definitions = Object.keys(swaggerJson.definitions);
    expect(definitions.length).toEqual(4);
  });
});
