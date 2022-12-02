# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.12.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.11.0...v2.12.0) (2022-12-02)

### Features

- add oauth authentication using `useRedirectUI` custom configuration ([#105](https://github.com/SamWSoftware/serverless-auto-swagger/issues/105)) ([0bb8432](https://github.com/SamWSoftware/serverless-auto-swagger/commit/0bb8432fa68e3c192f8b274bdd306bfbbc060a40))

### Changes

- Updated dependencies

## [2.11.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.10.0...v2.11.0) (2022-11-09)

### Features

- add optional operationId to http events ([#100](https://github.com/SamWSoftware/serverless-auto-swagger/issues/100)) ([2262dfe](https://github.com/completecoding/serverless-auto-swagger/commit/2262dfe8c59e9b869e0c63fc49619e4f79c12e11))
  - overrides the auto-generated operationId if specified

### Changes

- Updated dependencies

## [2.10.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.9.2...v2.10.0) (2022-10-21)

### Features

- add option to change api description and version ([#99](https://github.com/SamWSoftware/serverless-auto-swagger/issues/99)) ([4aeba34](https://github.com/completecoding/serverless-auto-swagger/commit/4aeba34054ff72bfd1ad31850277a0221f32d04c))

### [2.9.2](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.9.1...v2.9.2) (2022-09-30)

### Bug Fixes

- remove log ([2ff5bf2](https://github.com/SamWSoftware/serverless-auto-swagger/commit/2ff5bf25554785f53566a61a0a7f5b22d42c6f01))

### [2.9.1](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.9.0...v2.9.1) (2022-09-30)

### Bug Fixes

- update json schema ([5eff490](https://github.com/SamWSoftware/serverless-auto-swagger/commit/5eff49004ae890eaec1a21dad037c27f43106108))

## [2.9.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.8.2...v2.9.0) (2022-09-30)

### Features

- add lambda authorizer ([68f8c98](https://github.com/SamWSoftware/serverless-auto-swagger/commit/68f8c988de6824d56ca553d95b15bc948a1c8a50))

### [2.8.2](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.8.1...v2.8.2) (2022-07-14)

### Bug Fixes

- add missing schema attributes ([44512ad](https://github.com/SamWSoftware/serverless-auto-swagger/commit/44512ad2d65d72709e309689b966e663700d2326))

### [2.8.1](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.8.0...v2.8.1) (2022-07-14)

### Bug Fixes

- add custom schema to httpApi also ([4f25ce6](https://github.com/SamWSoftware/serverless-auto-swagger/commit/4f25ce67d48a36638e8841b1f24820923980541c))

## [2.8.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.7.0...v2.8.0) (2022-07-05)

### Features

- add option to change project title ([#80](https://github.com/SamWSoftware/serverless-auto-swagger/issues/80)) ([9dea3b6](https://github.com/SamWSoftware/serverless-auto-swagger/commit/9dea3b663e2145e3d349873ccc5e33f05d820e14))

## [2.7.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.6.0...v2.7.0) (2022-06-23)

### Features

- add custom host option ([#79](https://github.com/SamWSoftware/serverless-auto-swagger/issues/79)) ([ffa9d1c](https://github.com/SamWSoftware/serverless-auto-swagger/commit/ffa9d1cdcfd6580b3d05d296313154a8e64fd316))

### Bug Fixes

- check for log function before assigning ([3ccd039](https://github.com/SamWSoftware/serverless-auto-swagger/commit/3ccd0394bca8f7e89dbcdc86db1241c7c3f529e3))

## [2.6.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.5.1...v2.6.0) (2022-06-13)

### Features

- add consumes and produces ([#76](https://github.com/SamWSoftware/serverless-auto-swagger/issues/76)) ([ff8740a](https://github.com/SamWSoftware/serverless-auto-swagger/commit/ff8740a30291a73a82abf1cb65af1975ce1917cf))

### [2.5.1](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.5.0...v2.5.1) (2022-05-23)

## [2.5.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.4.2...v2.5.0) (2022-05-13)

### Features

- use builtin params if none are provided ([#71](https://github.com/SamWSoftware/serverless-auto-swagger/issues/71)) ([e1b31fe](https://github.com/SamWSoftware/serverless-auto-swagger/commit/e1b31fe9519b6b669437707ecfafcf0260beacf8))

## [2.4.2](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.4.1...v2.4.2) (2022-05-12)

### Features

- Allow plugin to work when node_modules are in a different directory than serverless.yml ([#70](https://github.com/SamWSoftware/serverless-auto-swagger/pull/70))

### Changes

- Update documentation to correctly specify usage requirements ([#70](https://github.com/SamWSoftware/serverless-auto-swagger/pull/70))

## [2.4.1](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.4.0...v2.4.1) (2022-03-17)

### Features

- a `description` can now be added to path params. ([#62](https://github.com/SamWSoftware/serverless-auto-swagger/issues/62)) ([5b552f4](https://github.com/SamWSoftware/serverless-auto-swagger/commit/5b552f4518d632c627fed53390501b9cb0503b4e))
  ```yaml
  http:
    path: /hello/{name}/{simpleParam}
    method: get
    parameters:
      name:
        description: the name to say hello to
        required: true
      simpleParam: true
  ```

### Bug Fixes

- backwards compatibility and path parameters ([#62](https://github.com/SamWSoftware/serverless-auto-swagger/issues/62)) ([5b552f4](https://github.com/SamWSoftware/serverless-auto-swagger/commit/5b552f4518d632c627fed53390501b9cb0503b4e))
  - `v2.4.0` implemented Serverless v3 logging without regard to those using Serverless v2 still. Added support for v2 again.
  - `v2.3.0` broke path parameters. This has been addressed.

## [2.4.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.3.0...v2.4.0) (2022-03-15)

### Features

- add/update schema validation ([#58](https://github.com/SamWSoftware/serverless-auto-swagger/issues/58)) ([7b60108](https://github.com/SamWSoftware/serverless-auto-swagger/commit/7b601089f85bd13868da7e72cb8bfa777fc7d2d8))

## [2.3.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.2.0...v2.3.0) (2022-03-10)

### Features

- use lowercase http method ([#53](https://github.com/SamWSoftware/serverless-auto-swagger/issues/53)) ([3c67fc1](https://github.com/SamWSoftware/serverless-auto-swagger/commit/3c67fc15e22fd5c4a0dd574b0596dae9ade5f94b))

### Bug Fixes

- change `null` to `None` for Python ([#54](https://github.com/SamWSoftware/serverless-auto-swagger/issues/54)) ([447044d](https://github.com/SamWSoftware/serverless-auto-swagger/commit/447044deb57da1477c22a84e968e27e145711816))

## [2.2.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.1.0...v2.2.0) (2022-02-23)

### Features

- add option to exclude specific stages ([#46](https://github.com/SamWSoftware/serverless-auto-swagger/issues/46)) ([#47](https://github.com/SamWSoftware/serverless-auto-swagger/issues/47)) ([89335dd](https://github.com/SamWSoftware/serverless-auto-swagger/commit/89335ddde741bf4b9f244d6f2c03d47f7a065800))
  - Example of new option: `excludeStages: ['prod']` (skip deployment of swagger.json and Swagger UI in `prod` stage)

## [2.1.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v2.0.0...v2.1.0) (2022-02-21)

### Features

- add option to use REST API for swagger lambdas ([#44](https://github.com/SamWSoftware/serverless-auto-swagger/issues/44)) ([e034ab3](https://github.com/SamWSoftware/serverless-auto-swagger/commit/e034ab39dc973bed8a47731dcb58e560dc9fe404))
  - `apiType: 'http' | 'httpApi'` – defaults to `httpApi` if not specified

### Bug Fixes

- use unique operationId per function path ([#43](https://github.com/SamWSoftware/serverless-auto-swagger/issues/43)) ([d28e6af](https://github.com/SamWSoftware/serverless-auto-swagger/commit/d28e6afc4cf16048c4ba91939ce300e6d89dbff5))

## [2.0.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v1.8.0...v2.0.0) (2022-02-21)

### ⚠ BREAKING CHANGES

- `apiKeyName` no longer exists in custom configuration. Use `apiKeyHeaders: ['x-api-key']` in place of `apiKeyName: 'x-api-key'`

### Features

- add apiKeyHeaders array for multiple security headers ([#35](https://github.com/SamWSoftware/serverless-auto-swagger/issues/35)) ([7b43838](https://github.com/SamWSoftware/serverless-auto-swagger/commit/7b438388a72f6352ebbc0472f23f2d73c4452229))

### Changes

- Remove apiKeyName in favor of apiKeyHeaders ([87cf65a](https://github.com/SamWSoftware/serverless-auto-swagger/commit/87cf65a96a854f289c1d6ef0725a98d7be8333cf))

## [1.8.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v1.7.0...v1.8.0) (2022-02-17)

### Features

- Update Swagger-UI to 4.5.0, Add missing icons ([#32](https://github.com/SamWSoftware/serverless-auto-swagger/issues/34)) ([52118a5](https://github.com/SamWSoftware/serverless-auto-swagger/commit/2f808c7926fcbf36c5d4e290a085a2c259c1716b))

## [1.7.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v1.6.0...v1.7.0) (2022-02-08)

### ⚠ BREAKING CHANGES

- `schemes` now defaults to the scheme used to serve the API specification if not provided (#32)

### Features

- add basePath and schemes to custom config ([#32](https://github.com/SamWSoftware/serverless-auto-swagger/issues/32)) ([52118a5](https://github.com/SamWSoftware/serverless-auto-swagger/commit/52118a58c50f58a4ecdeb597c5a470c3abd1af3a))

### Bug Fixes

- make operationId unique ([#31](https://github.com/SamWSoftware/serverless-auto-swagger/issues/31)) ([f514234](https://github.com/SamWSoftware/serverless-auto-swagger/commit/f51423475a186bcee9e072a223f02e31b3b4b54e)), closes [#30](https://github.com/SamWSoftware/serverless-auto-swagger/issues/30)

## [1.6.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v1.5.0...v1.6.0) (2022-02-08)

### [1.5.1](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v1.5.0...v1.5.1) (2022-02-05)

## [1.5.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v1.2.1...v1.5.0) (2022-02-02)

(Contains undocumented updates from 1.4.0)

### Features

- **config:** allow user to choose swagger path ([5ceeb9c](https://github.com/SamWSoftware/serverless-auto-swagger/commit/5ceeb9ced707a7c807fd3728e3e7295602e80381))
- **exclude:** allow user to exclude events ([c0bbe15](https://github.com/SamWSoftware/serverless-auto-swagger/commit/c0bbe15ab6dd962fe2851bf27d2fe33a1899a182))
- **queryStringParameters:** allow user to define query string params ([294926e](https://github.com/SamWSoftware/serverless-auto-swagger/commit/294926ec5d18b253ff42ae47a1b1ab229d738d9e))
- **script:** adding publish script to call np ([4932248](https://github.com/SamWSoftware/serverless-auto-swagger/commit/49322489d27d1db0cc1dd53a34824d2c59112620))
- **swaggerFiles:** allow user to add json openAPI 2.0 files ([ba130a2](https://github.com/SamWSoftware/serverless-auto-swagger/commit/ba130a2d733a97d8069761ae36db455c172817ce))

### Bug Fixes

- Add required parameter to Swagger for queryStringParameters ([#20](https://github.com/SamWSoftware/serverless-auto-swagger/issues/20)) ([6a6c89d](https://github.com/SamWSoftware/serverless-auto-swagger/commit/6a6c89dfe2fceafb271cd0423fd29a8877b85e5a)), closes [#11](https://github.com/SamWSoftware/serverless-auto-swagger/issues/11)
- **types:** fixing responses on http, and conflicting types in tests ([138626f](https://github.com/SamWSoftware/serverless-auto-swagger/commit/138626fa2c6c320d30fd1064790ff981417b4ede))

## [1.3.1](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v1.3.0...v1.3.1) (2021-11-23)

## 1.2.0 (2021-09-29)

### Features

- **deployment:** auto swagger works with sls deploy ([8f0350b](https://github.com/SamWSoftware/serverless-auto-swagger/commit/8f0350b69ec3bb77be4a1c609bf5a71f8281a866))
- **initial commit:** the initial commit ([624e4b4](https://github.com/SamWSoftware/serverless-auto-swagger/commit/624e4b4cf1dbb9768ed720dcbc04040e0b93a97c))
