import { kebabCase } from 'lodash-es';
import { createConfigBuilder } from '../createConfigBuilder.ts';
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

// eslint-disable-next-line import/no-default-export
export default configBuilder;
