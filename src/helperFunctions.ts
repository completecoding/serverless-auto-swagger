import * as fs from 'fs';
import { Definition } from './swagger';

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
  switch (definition.type) {
    case 'object':
      return Object.entries(definition.properties ?? {}).reduce(
        (acc, [propertyKey, definition]) => {
          if (propertyKey === 'anyOf') {
            // fix it
            acc.enum = definition.anyOf!.map((anyOfObj) => anyOfObj.const);
          }
          acc.properties![propertyKey] = recursiveFixAnyOf(definition);
          return acc;
        },
        { ...definition, properties: {} } as Definition
      );
  }

  return definition;
};
