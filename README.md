# zcb

Build configs with type safety from zod schema.

[![Build and publish](https://github.com/badbatch/zod-config-builder/actions/workflows/build-and-publish.yml/badge.svg)](https://github.com/badbatch/zod-config-builder/actions/workflows/build-and-publish.yml)
[![npm version](https://badge.fury.io/js/zcb.svg)](https://badge.fury.io/js/zcb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Define a configuration schema with [`zod`](https://github.com/colinhacks/zod) and use the output of that in `zcb` to create a config builder with method autocomplete and value type validation.

Use our cli module to build and/or watch a config builder file and transform it into a literally typed config object.

Import that literally typed config in your components along with `zcb` and create a config reader with scoping abilities, config path autocomplete and return value preview.

These three features can be used together in the above workflow or separately. For example, you can just use the config builder to build a type-safe config for use in your application, or you could handcraft a locales file and use the config reader to read its values.

## Installation

```sh
npm add zcb
```

## Usage

* [Create schema](#create-schema)
* [Create config builder](#create-config-builder)
* [Transform config builder](#transform-config-builder)
* [Create config reader](#create-config-reader)
* [Use config reader](#use-config-reader)

### Create schema

Create the schema for your configuration like in the example below.

```ts
// ./schema.ts
import { z } from 'zod';
import {
  countryCodes,
  countryNames,
  distanceUnits,
  languageCodes,
  timezones,
} from 'zcb';

export const baseSectionSchema = z.object({
  name: z.string(),
});

export type SectionType = z.infer<typeof baseSectionSchema> & {
  sections?: SectionType[];
};

export const sectionSchema: z.ZodType<SectionType> = baseSectionSchema.extend({
  sections: z.lazy(() => sectionSchema.array()).optional(),
});

export const pageSchema = z.object({
  name: z.string(),
  path: z.string().optional(),
  queryParams: z.array(z.string()).optional(),
  sections: z.array(sectionSchema).optional(),
});

export type PageType = z.infer<typeof pageSchema>;

const baseRouteSchema = z.object({
  aliases: z.array(z.string()).optional(),
  page: z.string(),
  path: z.string(),
});

export type RouteType = z.infer<typeof baseRouteSchema> & {
  routes?: RouteType[];
};

export const routeSchema: z.ZodType<RouteType> = baseRouteSchema.extend({
  routes: z.lazy(() => routeSchema.array()).optional(),
});

export const configSchema = z.object({
  countryCode: z.enum(countryCodes).optional(),
  countryName: z.enum(countryNames).optional(),
  distanceUnit: z.enum(distanceUnits).optional(),
  languageCodes: z.array(z.enum(languageCodes)).optional(),
  locales: z.array(z.string().regex(/[a-z]{2}_[A-Z]{2}/)).optional(),
  name: z.string().optional(),
  pages: z.record(pageSchema).optional(),
  routes: z.array(routeSchema).optional(),
  timeouts: z.record(z.number()).optional(),
  timezone: z.enum(timezones).optional(),
});

export type ConfigType = z.infer<typeof configSchema>;
```

### Create config builder

Then use the schema and its types to create a config builder and build out your configuration like in the example below. The config builder comes with method autocompletion and value type validation. It is important to default export the config builder as this is what the cli build/watch scripts are expecting when they import the config builder.

```ts
// ./configBuilder.ts
import { kebabCase } from 'lodash-es';
import { createConfigBuilder } from 'zcb';
import {
  type ConfigType,
  type PageType,
  type RouteType,
  type SectionType,
  configSchema,
  pageSchema,
  routeSchema,
  sectionSchema,
} from './schema.ts';

const configBuilder = createConfigBuilder<ConfigType>(configSchema);
const routeBuilder = createConfigBuilder<RouteType>(routeSchema, undefined, { path: ({ page }) => kebabCase(page) });
const pageBuilder = createConfigBuilder<PageType>(pageSchema);
const sectionBuilder = createConfigBuilder<SectionType>(sectionSchema);
const subsectionBuilder = sectionBuilder.$fork();

configBuilder
  .countryCode('GB')
  .countryName('United Kingdom')
  .distanceUnit('km')
  .languageCodes(['en'])
  .locales(({ countryCode, languageCodes }) =>
    languageCodes?.length && countryCode ? languageCodes.map(code => `${code}_${countryCode}`) : []
  )
  .name('alpha')
  .pages({
    contactDetails: pageBuilder
      .name('contactDetails')
      .sections([
        sectionBuilder.name('header').$flush(),
        sectionBuilder
          .name('body')
          .sections([subsectionBuilder.name('main').$flush(), subsectionBuilder.name('sidebar').$flush()])
          .$flush(),
        sectionBuilder.name('footer').$flush(),
      ])
      .$flush(),
    personalDetails: pageBuilder
      .name('personalDetails')
      .sections([
        sectionBuilder.name('header').$flush(),
        sectionBuilder
          .name('body')
          .sections([subsectionBuilder.name('main').$flush(), subsectionBuilder.name('sidebar').$flush()])
          .$flush(),
        sectionBuilder.name('footer').$flush(),
      ])
      .$flush(),
  })
  .routes([routeBuilder.page('personalDetails').$flush(), routeBuilder.page('contactDetails').$flush()])
  .timeouts({ apollo: 10_000 })
  .timezone('Europe/London');

export default configBuilder;
```

#### builder API

**$disable: `() => ConfigBuilder`**

Use to disable a slice of config. Disabled slices are removed from the config when the config builder is transformed into a literally typed object in the cli build/watch step.

**$errors: `() => ZodIssue[]`**

Use to validate the config against the schema and return any errors. The primary use for this is internal within the cli build/watch step.

**$experiment: `() => ConfigBuilder`**

Use to assign an experiment ID to a slice of config. If an experiment callback file is provided to the cli build/watch step, this ID is used as a marker for where to inject experiment configuration.

**$extend: `(value: ConfigBuilder) => void`**

Use to extend an existing config builder.

**$flush: `() => JsonObject`**

Use to flush the values from a config builder so that it can be immediately reused.

**$fork: `() => ConfigBuilder`**

Create a clone of a config builder. Useful if you need to use the same config builder within itself.

**$toJson: `() => string`**

Returns the config values as a pretty-printed JSON string.

**$validate: `() => boolean`**

Use to validate the config against the schema and return true/false. The primary use for this is internal within the cli build/watch step.

**$values: `() => JsonObject`**

Use to return the config values as an object.

---

### Transform config builder

Use the script below or its `build` equivalent to transform a config builder file into a file that default exports a literally typed object like the one in the following example.

If you require native ESM support, use `NODE_OPTIONS="--loader ts-node/esm"`.

```sh
NODE_OPTIONS="--loader ts-node/register" npx zcb watch ./configBuilder.ts ./builtConfig.ts
```

```ts
// ./builtConfig.ts
/* eslint-disable */
/* This file is autogenerated, do not edit directly, your changes will not perist. */

export default {
  countryCode: "GB",
  countryName: "United Kingdom",
  distanceUnit: "km",
  languageCodes: [
    "en"
  ],
  locales: [
    "en_GB"
  ],
  name: "alpha",
  pages: {
    contactDetails: {
      name: "contactDetails",
      sections: [
        {
          name: "header"
        },
        {
          name: "body",
          sections: [
            {
              name: "main"
            },
            {
              name: "sidebar"
            }
          ]
        },
        {
          name: "footer"
        }
      ]
    },
    personalDetails: {
      name: "personalDetails",
      sections: [
        {
          name: "header"
        },
        {
          name: "body",
          sections: [
            {
              name: "main"
            },
            {
              name: "sidebar"
            }
          ]
        },
        {
          name: "footer"
        }
      ]
    }
  },
  routes: [
    {
      page: "personalDetails",
      path: "personal-details"
    },
    {
      page: "contactDetails",
      path: "contact-details"
    }
  ],
  timeouts: {
    apollo: 10000
  },
  timezone: "Europe/London"
} as const;
```

#### cli API

* `zcb build <input-file> <output-file>`

```sh
Write config from a config builder

Positionals:
  input-file   The relative path to the config builder root file
                                                             [string] [required]
  output-file  The relative path to the output config file   [string] [required]

Options:
  --version                    Show version number                     [boolean]
  --help                       Show help                               [boolean]
  --experiments-callback-file  The relative path to the experiment callback file
                                                                        [string]
```

* `zcb watch <input-file> <output-file>`

```sh
Watch a config builder and write config

Positionals:
  input-file   The relative path to the config builder root file
                                                             [string] [required]
  output-file  The relative path to the output config file   [string] [required]

Options:
  --version                    Show version number                     [boolean]
  --help                       Show help                               [boolean]
  --experiments-callback-file  The relative path to the experiment callback file
                                                                        [string]
```

### Create config reader

Then use the autogenerated config to create a config reader that you can access config values with. The autogenerated config will always be a default import.

```ts
// ./configReader.ts
import { createConfigParser, createConfigReader } from 'zcb';
import builtConfig from './builtConfig.ts';

export default createConfigReader(builtConfig);
```

### Use config reader

Then import the config reader into the file in which you want access to config values. The config reader comes with config path autocomplete and return value preview.

```ts
import configReader from './configReader.ts';

// scope config path autocompletion and validation
const scopedReader = configReader.scope('pages.contactDetails')
                       .scope('sections.1.sections')
                       .scope('0');
// reader config path autocompletion and validation
// value and type preview
const value = scopedReader.read('name');
```

#### reader API

**read: `(value: string, variables?: Record<string, string | number>) => Get<Config, string>`**

Use to read a value out of config. If the value resolves to a string, the reader also supports the string being a template that uses double bracket notation (`{{key}}`) and passing a `vars` object of key/value pairs as the second argument. The value of each matching key in the `vars` object will be replaced in the string template.

```ts
const vars = {
  name: 'Simon',
  profession: 'pieman',
};

const stringTemplate = 'Simple {{name}} met a {{profession}} going to the fair';
const reader = createConfigReader({ stringTemplate })
const value = reader.read('stringTemplate', vars);
console.log(value); // 'Simple Simon met a pieman going to the fair'
```

**scope: `(value: string) => Get<Config, string>`**

Use to scope a reader to a slice of config, rather than having to pass in the full config path every time.

---

## Changelog

Check out the [features, fixes and more](CHANGELOG.md) that go into each major, minor and patch version.

## License

zcb is [MIT Licensed](LICENSE).
