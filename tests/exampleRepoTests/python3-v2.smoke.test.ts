import * as fs from 'fs-extra';

describe('nodeJS-v2', () => {
  let swaggerJson: any = {};

  beforeAll(async () => {
    const fileText = await fs.readFile('./test-repos/python3-v2/swagger/swagger.py', 'utf8');
    swaggerJson = JSON.parse(fileText.slice(60));
    // change the 60 char if the comment at the start of the swagger.py file changes
  });

  it('general Info', async () => {
    expect(swaggerJson.info.title).toEqual('python3-v2');
    const paths = Object.keys(swaggerJson.paths);
    expect(paths.length).toEqual(2);

    const definitions = Object.keys(swaggerJson.definitions);
    expect(definitions.length).toEqual(0);
  });
});
