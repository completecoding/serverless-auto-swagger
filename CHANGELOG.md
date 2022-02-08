# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.7.0](https://github.com/SamWSoftware/serverless-auto-swagger/compare/v1.6.0...v1.7.0) (2022-02-08)

### ⚠ BREAKING CHANGES

* `schemes` now defaults to the scheme used to serve the API specification if not provided (#32)

### Features

* add `basePath` and `schemes` to custom config ([#32](https://github.com/SamWSoftware/serverless-auto-swagger/issues/32)) ([52118a5](https://github.com/SamWSoftware/serverless-auto-swagger/commit/52118a58c50f58a4ecdeb597c5a470c3abd1af3a))


### Bug Fixes

* make operationId unique ([#31](https://github.com/SamWSoftware/serverless-auto-swagger/issues/31)) ([f514234](https://github.com/SamWSoftware/serverless-auto-swagger/commit/f51423475a186bcee9e072a223f02e31b3b4b54e)), closes [#30](https://github.com/SamWSoftware/serverless-auto-swagger/issues/30)

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
