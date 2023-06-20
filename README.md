# zcb

Build configs with type safety from zod schema.

[![npm version](https://badge.fury.io/js/zcb.svg)](https://badge.fury.io/js/zcb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Define a configuration schema with [`zod`](https://github.com/colinhacks/zod) and use the output of that in `zcb` to create a config builder with autocomplete and setter value autocomplete.

Use our cli module to build and/or watch a config builder file and transform it into a literally typed config object.

Import that literally typed config in your components along with `zcb` and create a config reader with scoping abilities, config path autocomplete and return value preview.

## Installation

```sh
npm install zcb
```

## Usage

* [Create schema](#create-schema)
* [Create config builder](#create-config-builder)
* [Transform config builder](#transform-config-builder)
* [Create config reader](#create-config-reader)

### Create schema

Create the schema for your configuration like in the example below.

```ts
// ./schema.ts
import { z } from 'zod';
import { countryCodes } from '../data/countryCodes.ts';
import { countryNames } from '../data/countryNames.ts';
import { distanceUnits } from '../data/distanceUnits.ts';
import { languageCodes } from '../data/languageCodes.ts';
import { timezones } from '../data/timezones.ts';

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

Then use the schema and its types to create a config builder and build out your configuration like in the example below. The config builder comes with method autocompletion and value type validation. It is important to default export the config builder.

```ts
// ./configBuilder.ts
import kebabCase from 'lodash/kebabCase.js';
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
const routeBuilder = createConfigBuilder<RouteType>(routeSchema, { path: ({ page }) => kebabCase(page) });
const pageBuilder = createConfigBuilder<PageType>(pageSchema);
const sectionBuilder = createConfigBuilder<SectionType>(sectionSchema);
const subsectionBuilder = sectionBuilder.fork();

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
        sectionBuilder.name('header').flush(),
        sectionBuilder
          .name('body')
          .sections([subsectionBuilder.name('main').flush(), subsectionBuilder.name('sidebar').flush()])
          .flush(),
        sectionBuilder.name('footer').flush(),
      ])
      .flush(),
    personalDetails: pageBuilder
      .name('personalDetails')
      .sections([
        sectionBuilder.name('header').flush(),
        sectionBuilder
          .name('body')
          .sections([subsectionBuilder.name('main').flush(), subsectionBuilder.name('sidebar').flush()])
          .flush(),
        sectionBuilder.name('footer').flush(),
      ])
      .flush(),
  })
  .routes([routeBuilder.page('personalDetails').flush(), routeBuilder.page('contactDetails').flush()])
  .timeouts({ apollo: 10_000 })
  .timezone('Europe/London');

export default configBuilder;
```

#### builder API

**disable: `() => ConfigBuilder`**

Use to disable a slice of config. Disabled slices are removed from the config when the config builder is transformed into a literally typed object in the cli build/watch step.

**errors: `() => ZodIssue[]`**

Use to validate the config against the schema and return any errors. The primary use for this is internal within the cli build/watch step.

**experiment: `() => ConfigBuilder`**

Use to assign an experiment ID to a slice of config. If an experiment callback file is provided to the cli build/watch step, this ID is used as a marker for where to inject experiment configuration.

**extend: `(value: ConfigBuilder) => void`**

Use to extend an existing config builder.

**flush: `() => JsonObject`**

Use to flush the values from a config builder so that it can be immediately reused.

**fork: `() => ConfigBuilder`**

Create a clone of a config builder. Useful if you need to use the same config builder within itself.

**toJson: `() => string`**

Returns the config values as a pretty-printed JSON string.

**validate: `() => boolean`**

Use to validate the config against the schema and return true/false. The primary use for this is internal within the cli build/watch step.

**values: `() => JsonObject`**

Use to return the config values as an object.

---

### Transform config builder

Use the script below or its `build` equivalent to transform a config builder file into a file that default exports a literally typed object like the one in the following example.

```sh
npx zcb watch ./configBuilder.ts ./builtConfig.ts
```

```ts
// ./builtConfig.ts
/* eslint-disable prettier/prettier, import/no-default-export, unicorn/numeric-separators-style */
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

### Create config reader

Then use the autogenerated config to create a config reader that you can access config values with. The config reader comes with config path autocomplete and return value preview. The autogenerated config will always be a default import.

```ts
import builtConfig from '.builtConfig.ts';
import { createConfigReader } from 'zcb';

const reader = createConfigReader(builtConfig);
// scope config path autocompletion and validation
const scopedReader = reader.scope('pages.contactDetails')
                      .scope('sections.1.sections')
                      .scope('0');
// reader config path autocompletion and validation
// value and type preview
const value = scopedReader('name');
```

#### reader API

**scope: `(value: string) => Get<Config, string>`**

Use to scope a reader to a slice of config, rather than having to pass in the full config path every time.

---

## Changelog

Check out the [features, fixes and more](CHANGELOG.md) that go into each major, minor and patch version.

## License

zcb is [MIT Licensed](LICENSE).
