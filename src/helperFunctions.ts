import * as fs from 'fs';
import type { Definition } from './types/swagger.types';

export const writeFile = (filepath: string, content: string) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, content, (err) => {
      if (err) {
        console.error(err);
        reject();
        return;
      }
      resolve(true);
    });
  });
};

export function removeStringFromArray(arr: string[], value: string): string[] {
  let i = 0;
  while (i < arr.length) {
    if (arr[i] === value) arr.splice(i, 1);
    else ++i;
  }
  return arr;
}

export const recursiveFixAnyOf = (definition: Definition) => {
  if (definition.type === 'object') {
    return Object.entries(definition.properties ?? {}).reduce(
      (acc, [propertyKey, def]) => {
        if (propertyKey === 'anyOf') {
          // fix it
          acc.enum = def.anyOf!.map((anyOfObj) => anyOfObj.const);
        }
        acc.properties![propertyKey] = recursiveFixAnyOf(def);
        return acc;
      },
      { ...definition, properties: {} } as Definition
    );
  }

  return definition;
};
