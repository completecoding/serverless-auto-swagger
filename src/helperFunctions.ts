import * as fs from "fs"
import { Definition } from "./swagger"

export const writeFile = (filepath: string, content: string) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, content, (err) => {
      if (err) {
        console.error(err)
        reject()
        return
      }
      resolve(true)
    })
  })
}

export function removeStringFromArray(arr: string[], value: string) {
  let i = 0
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1)
    } else {
      ++i
    }
  }
  return arr
}

export const recursiveFixAnyOf = (definition: Definition) => {
  switch (definition.type) {
    case "object":
      let newDefinition: Definition = { ...definition, properties: {} }

      Object.entries(definition.properties!).map(
        ([propertyKey, definition]) => {
          if (propertyKey === "anyOf" && newDefinition.properties) {
            //fix it
            newDefinition.enum = (definition as Definition).anyOf!.map(
              (anyOfObj) => {
                return anyOfObj.const
              }
            )
          }
          newDefinition.properties![propertyKey] = recursiveFixAnyOf(definition)
        }
      )

      return newDefinition
  }

  return definition
}
