import swaggerFunctions from '../src/resources/functions';
import { AutoSwaggerCustomConfig, CustomServerless } from '../src/types/serverless-plugin.types';

const defaultServiceDetails: CustomServerless = {
  configSchemaHandler: {
    defineCustomProperties: () => undefined,
    defineFunctionEvent: () => undefined,
    defineFunctionEventProperties: () => undefined,
    defineFunctionProperties: () => undefined,
    defineProvider: () => undefined,
    defineTopLevelProperty: () => undefined,
  },
  configurationInput: {},
  service: {
    service: '',
    provider: {
      name: 'aws',
      runtime: undefined,
      stage: '',
      region: undefined,
      profile: '',
      environment: {},
    },
    plugins: [],
    functions: {
      mocked: {
        handler: 'mocked.handler',
      },
    },
    custom: {
      autoswagger: {},
    },
  },
};

type GetCustomServerlessConfigParams = {
  autoswaggerOptions?: AutoSwaggerCustomConfig;
};

const getCustomServerlessConfig = ({ autoswaggerOptions }: GetCustomServerlessConfigParams = {}): CustomServerless => ({
  ...defaultServiceDetails,
  service: {
    ...defaultServiceDetails.service,
    custom: {
      ...defaultServiceDetails.service.custom,
      autoswagger: {
        ...defaultServiceDetails.service.custom?.autoswagger,
        ...autoswaggerOptions,
      },
    },
  },
});

describe('swaggerFunctions tests', () => {
  it('includes swaggerRedirectURI if useRedirectUI is set to true', () => {
    const serviceDetails = getCustomServerlessConfig({
      autoswaggerOptions: {
        useRedirectUI: true,
      },
    });
    const result = swaggerFunctions(serviceDetails);
    expect(Object.keys(result)).toContain('swaggerRedirectURI');
  });

  it('does not includes swaggerRedirectURI if useRedirectUI is set to false', () => {
    const serviceDetails = getCustomServerlessConfig({
      autoswaggerOptions: {
        useRedirectUI: false,
      },
    });
    const result = swaggerFunctions(serviceDetails);
    expect(Object.keys(result)).not.toContain('swaggerRedirectURI');
  });

  it('does not includes swaggerRedirectURI if useRedirectUI is not set', () => {
    const serviceDetails = getCustomServerlessConfig();
    const result = swaggerFunctions(serviceDetails);
    expect(Object.keys(result)).not.toContain('swaggerRedirectURI');
  });
});
