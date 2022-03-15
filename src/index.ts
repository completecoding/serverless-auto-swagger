'use strict';

import ServerlessAutoSwagger from './ServerlessAutoSwagger';

module.exports = ServerlessAutoSwagger;

import type {
  CustomWithAutoSwagger,
  ServerlessFunction as FunctionWithAutoSwagger,
  ServerlessConfig as ServerlessWithAutoSwagger,
} from './types/serverless-plugin.types';

export type { FunctionWithAutoSwagger, CustomWithAutoSwagger, ServerlessWithAutoSwagger };
