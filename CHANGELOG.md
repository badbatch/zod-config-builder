# Changelog

## 0.2.6 (2024-04-10)

### New Features

* add support for string template variables in config values (d94ee350)

## 0.2.5 (2024-03-19)

### Bug Fixes

* typo in readme (788f656d)

### Refactors

* update deps and change build tool to swc (97056a84)

## 0.2.4 (2024-02-01)

### Documentation Changes

* update readme (87705305)

### Bug Fixes

* update generic type for clone non enumerable values (d88d412a)

## 0.2.3 (2024-01-29)

### New Features

* enable overriding of uuid function (8634db11)

## 0.2.2 (2024-01-27)

### New Features

* expose non enumerable prop cloner (e0648102)

## 0.2.1 (2024-01-27)

### New Features

* add id to each schema node (d846b33c)

## 0.2.0 (2024-01-26)

### Refactors

* change order of arguments passed into config builder (100182c1)

## 0.1.3 (2024-01-26)

### New Features

* add ability to pass type into config builder (65577014)

## 0.1.2 (2024-01-14)

### Bug Fixes

* stop default values being reset by flush (edc08202)

## 0.1.1 (2024-01-14)

### New Features

* enable setting defaults of known object properties (695359e7)

## 0.1.0 (2024-01-14)

### Chores

* bump deps (b2fb40df)

### New Features

* support value being zod schema in stringify (d0f1b47e)

### Refactors

* prefix inbuilt methods with dollar (bbd2ff08)

## 0.0.27 (2024-01-03)

### Bug Fixes

* add missed type def to deps (5c3eb28a)

## 0.0.26 (2024-01-03)

### Bug Fixes

* move type defs into deps (941c6914)

## 0.0.25 (2023-12-16)

### New Features

* better support esm and cjs (0d2cf3bc)

### Bug Fixes

* alias change in readme example (34656eb6)
* bump node and pnpm version (c808a282)
* typo in package json (98cd5cc1)
* remove redundant deps (a9cdecce)

## 0.0.24 (2023-11-22)

### New Features

* upgrade syncpack (e7e1fddf)

## 0.0.23 (2023-11-22)

### Bug Fixes

* correct bin path and exports require ext (539e91ac)

## 0.0.22 (2023-11-22)

### New Features

* move to exports in package json (64cf205f)

## 0.0.21 (2023-10-12)

### Chores

* update deps (8e13fe52)

## 0.0.20 (2023-10-11)

### Refactors

* use lodash-es (bf93fd08)

## 0.0.19 (2023-08-15)

### Bug Fixes

* status badge (023d2055)
* add badge to readme (218aa094)

## 0.0.18 (2023-08-15)

### Bug Fixes

* update repository link in package json (928a6680)

## 0.0.17 (2023-08-14)

### Bug Fixes

* update repodog deps (fd2e2d7a)

## 0.0.16 (2023-07-07)

### Documentation Changes

* fix wording issue in readme (eca32bca)

## 0.0.15 (2023-07-06)

### Documentation Changes

* correct config reader export example (985b033a)

## 0.0.14 (2023-07-06)

### Refactors

* move config reading to read method on reader (5fc6a133)

## 0.0.13 (2023-07-06)

### Bug Fixes

* update lock file (e38f5e0e)

## 0.0.12 (2023-07-06)

### Bug Fixes

* document ts node usage (e62a6524)

## 0.0.11 (2023-07-06)

### Bug Fixes

* create config builder type and export (2c970534)

## 0.0.10 (2023-07-06)

### Bug Fixes

* use correct tsconfig and exclude test utils folder (f6d89f52)

## 0.0.9 (2023-07-06)

### Bug Fixes

* stop npm ignore dist folder (9e44699e)

## 0.0.8 (2023-07-01)

### Documentation Changes

* refactor way config reader is recommended to be used (1e3ffae3)

### Refactors

* change experiments interfaces and add config parser (10764e42)

## 0.0.7 (2023-06-23)

### Chores

* update deps (f4e4709e)
* upgrade deps (5d340107)
* update badge link (54264b99)
* update badge link (4ecd3233)

### Documentation Changes

* update readme (c8098f18)

### New Features

* add build command to cli (d7d34b50)

### Bug Fixes

* resolve circular deps (d994f0a9)
* add types export (ef9c6a34)

## 0.0.6 (2023-06-12)

### Bug Fixes

* lock file (47de9f76)

## 0.0.5 (2023-06-12)

### New Features

* create cli module for watching changes to config builder (63469791)
* add extend (16e7c83c)
* add override second arg to setters (0b3d0bee)
* add toggle (4a819329)
* add fork, flush and values methods (4f2266f5)

### Bug Fixes

* enable nested scopes (ac4223ea)
* clone config when extending (4dc582e4)

### Refactors

* move conditions into helpers (75c572e6)
* change toggle to experiment (dc24ef9c)

### Tests

* beef up extend unit tests (8c22ce20)
* add default unit tests (541894d7)

## 0.0.4 (2023-05-16)

### Bug Fixes

* add repodog cli as project dev dependency (3a61ad46)

## 0.0.3 (2023-05-16)

### Bug Fixes

* add branch to reusable github action ref (5e3f8dbf)

## 0.0.2 (2023-05-15)

### Chores

* add base files (3871f864)

### Refactors

* update core code and add unit tests (9a950e9b)
