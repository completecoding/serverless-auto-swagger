export interface Swagger {
  swagger: string
  info: Info
  host?: string
  basePath?: string
  tags?: Tag[]
  schemes: string[]
  paths: Paths
  securityDefinitions?: { [key: string]: SecurityDefinition }
  definitions?: { [key: string]: Definition }
  externalDocs?: ExternalDocs
}

// Info Section
export interface Info {
  title: string
  description?: string
  version: string
  termsOfService?: string
  contact?: Contact
  license?: License
}
export interface Contact {
  name?: string
  url?: string
  email?: string
}
export interface License {
  name: string
  url?: string
}

// Tag Section
export interface Tag {
  name: string
  description?: string
  externalDocs?: ExternalDocs
}

// Path Section
export interface Paths {
  [key: string]: PathMethods
}

type PathMethods = {
  [method: string]: MethodDetails
}
export interface MethodDetails {
  tags?: string[]
  summary?: string
  description?: string
  operationId: string
  consumes: string[]
  produces: string[]
  parameters: Parameter[]
  responses: { [key: string]: Response }
  security?: MethodSecurity[]
}
export interface Parameter {
  in: string
  name: string
  description?: string
  required?: boolean
  schema?: SchemaRef
}
export interface SchemaRef {
  $ref: string
}
export interface Response {
  description: string
  schema?: SchemaRef
}

export interface MethodSecurity {
  [securityType: string]: string[]
}

// Security Section
export interface SecurityDefinition {
  type: string
  name?: string
  in?: string
  authorizationUrl?: string
  flow?: string
  scopes?: { [key: string]: string }
}

// definition Section

export interface Definition {
  type?: string
  items?: { $ref: string }
  format?: Format
  default?: any
  description?: string
  required?: string[]
  additionalProperties?: boolean
  enum?: string[]
  properties?: { [key: string]: Definition }
  anyOf?: { const: string; type: string }[]
}
type Format = "date-time" | "int32" | "int64"

export interface ExternalDocs {
  description: string
  url: string
}
