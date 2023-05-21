import kebabCase from 'lodash/kebabCase.js';
import { z } from 'zod';
import {
  type ConfigType,
  type PageType,
  type RouteType,
  configSchema,
  pageSchema,
  routeSchema,
} from './__testUtils__/schema.ts';

describe('createConfigBuilder', () => {
  describe('when a user passes in a schema with a root type other than "object"', () => {
    it('should throw an error', async () => {
      const { createConfigBuilder } = await import('./createConfigBuilder.ts');
      const invalidSchema = z.array(z.string());

      expect(() => createConfigBuilder<z.infer<typeof invalidSchema>>(invalidSchema)).toThrow(
        'The root type of a config schema must be "object", but received "array"'
      );
    });
  });

  describe('when a user uses a key in the schema that is a reserved keyword', () => {
    it('should throw an error', async () => {
      const { RESERVED_KEYWORDS, createConfigBuilder } = await import('./createConfigBuilder.ts');

      const invalidSchema = z.object({
        values: z.string(),
      });

      expect(() => createConfigBuilder<z.infer<typeof invalidSchema>>(invalidSchema)).toThrow(
        `"values" is a reserved keyword within the config builder. Please use a different property name. The full list of reserved keywords is: ${[
          ...RESERVED_KEYWORDS,
        ].join(', ')}`
      );
    });
  });

  describe('when a user disables the config', () => {
    it('should add the disabled flag to the config', async () => {
      const { createConfigBuilder } = await import('./createConfigBuilder.ts');
      const config = createConfigBuilder<ConfigType>(configSchema);
      config.disable().name('alpha');
      // @ts-expect-error private property
      expect(config.values().__disabled).toBe(true);
    });
  });

  describe('when a user adds a toggle to the config', () => {
    it('should add the toggle to the config', async () => {
      const { createConfigBuilder } = await import('./createConfigBuilder.ts');
      const config = createConfigBuilder<ConfigType>(configSchema);
      config.toggle('FEAT_ALPHA@0.0.1').name('alpha');
      // @ts-expect-error private property
      expect(config.values().__toggle).toBe('FEAT_ALPHA@0.0.1');
    });
  });

  describe('when a user extends from a config', () => {
    it('should copy over all values to the new config', async () => {
      const { createConfigBuilder } = await import('./createConfigBuilder.ts');
      const config = createConfigBuilder<ConfigType>(configSchema);
      config.toggle('FEAT_ALPHA@0.0.1').disable().name('alpha');
      const childConfig = createConfigBuilder<ConfigType>(configSchema);
      childConfig.extend(config);
      expect(childConfig.values()).toEqual({ name: 'alpha' });
    });

    it('should copy over all toggles to the new config', async () => {
      const { createConfigBuilder } = await import('./createConfigBuilder.ts');
      const config = createConfigBuilder<ConfigType>(configSchema);
      config.toggle('FEAT_ALPHA@0.0.1').name('alpha');
      const childConfig = createConfigBuilder<ConfigType>(configSchema);
      childConfig.extend(config);
      // @ts-expect-error private property
      expect(childConfig.values().__toggle).toBe('FEAT_ALPHA@0.0.1');
    });

    it('should copy over all disabled flags to the new config', async () => {
      const { createConfigBuilder } = await import('./createConfigBuilder.ts');
      const config = createConfigBuilder<ConfigType>(configSchema);
      config.disable().name('alpha');
      const childConfig = createConfigBuilder<ConfigType>(configSchema);
      childConfig.extend(config);
      // @ts-expect-error private property
      expect(childConfig.values().__disabled).toBe(true);
    });

    it('should copy over all derived value callbacks to the new config builder', async () => {
      const { createConfigBuilder } = await import('./createConfigBuilder.ts');
      const route = createConfigBuilder<RouteType>(routeSchema, { path: ({ page }) => kebabCase(page) });
      route.page('personalDetails');
      const childRoute = createConfigBuilder<RouteType>(routeSchema);
      childRoute.extend(route);
      childRoute.page('contactDetails', true);
      expect(childRoute.values()).toEqual({ page: 'contactDetails', path: 'contact-details' });
    });
  });

  describe('when a user adds a value to the config', () => {
    describe('and the property has a default value', () => {
      describe('and that value is a string', () => {
        it('should add the default value to the config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');

          const extendedSchema = configSchema.extend({
            description: z.string().optional().default('This is the description.'),
          });

          const config = createConfigBuilder<z.infer<typeof extendedSchema>>(extendedSchema);
          expect(config.values()).toEqual({ description: 'This is the description.' });
        });
      });

      describe('and that value is a record of booleans', () => {
        it('should add the default value to the config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');

          const extendedSchema = configSchema.extend({
            flags: z.record(z.boolean()).optional().default({ alpha: true, bravo: false, charlie: false }),
          });

          const config = createConfigBuilder<z.infer<typeof extendedSchema>>(extendedSchema);
          expect(config.values()).toEqual({ flags: { alpha: true, bravo: false, charlie: false } });
        });
      });

      describe('and that value is an array of strings', () => {
        it('should add the default value to the config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');

          const extendedSchema = configSchema.extend({
            colors: z.array(z.string()).optional().default(['red', 'yellow', 'pink', 'green']),
          });

          const config = createConfigBuilder<z.infer<typeof extendedSchema>>(extendedSchema);
          expect(config.values()).toEqual({ colors: ['red', 'yellow', 'pink', 'green'] });
        });
      });
    });

    describe('and the property already has a value', () => {
      it('should throw an error', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<ConfigType>(configSchema);
        config.name('alpha');

        expect(() => config.name('bravo')).toThrow(
          'A value already exists for "name". You may be trying to add a new values before flushing the old one. If you intended to override the existing value, pass in true as the second argument.'
        );
      });
    });

    describe('and that value is an enum', () => {
      it('should add the value to the config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<ConfigType>(configSchema);
        config.countryCode('GB');
        expect(config.values()).toEqual({ countryCode: 'GB' });
      });

      it('should be a valid config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<ConfigType>(configSchema);
        config.countryCode('GB');
        expect(config.validate()).toBe(true);
      });
    });

    describe('and that value is an array of enums', () => {
      it('should add the value to the config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<ConfigType>(configSchema);
        config.languageCodes(['en']);
        expect(config.values()).toEqual({ languageCodes: ['en'] });
      });

      it('should be a valid config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<ConfigType>(configSchema);
        config.languageCodes(['en']);
        expect(config.validate()).toBe(true);
      });
    });

    describe('and that value is a record', () => {
      it('should add the value to the config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<ConfigType>(configSchema);
        config.timeouts({ apollo: 120_000 });
        expect(config.values()).toEqual({ timeouts: { apollo: 120_000 } });
      });

      it('should be a valid config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<ConfigType>(configSchema);
        config.timeouts({ apollo: 120_000 });
        expect(config.validate()).toBe(true);
      });
    });

    describe('and that value is an record of configs', () => {
      describe('and the configs are valid configs', () => {
        it('should add the value to the config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const config = createConfigBuilder<ConfigType>(configSchema);
          const page = createConfigBuilder<PageType>(pageSchema);

          config.pages({
            contactDetails: page.name('contactDetails').flush(),
            personalDetails: page.name('personalDetails').flush(),
          });

          expect(config.values()).toEqual({
            pages: {
              contactDetails: {
                name: 'contactDetails',
              },
              personalDetails: {
                name: 'personalDetails',
              },
            },
          });
        });

        it('should be a valid config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const config = createConfigBuilder<ConfigType>(configSchema);
          const page = createConfigBuilder<PageType>(pageSchema);

          config.pages({
            contactDetails: page.name('contactDetails').flush(),
            personalDetails: page.name('personalDetails').flush(),
          });

          expect(config.validate()).toBe(true);
        });
      });

      describe('and the configs are not valid configs', () => {
        it('should throw an error', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const config = createConfigBuilder<ConfigType>(configSchema);

          expect(() =>
            config.pages({
              contactDetails: {
                name: 'contactDetails',
              },
              personalDetails: {
                name: 'personalDetails',
              },
            })
          ).toThrow(
            '"pages" value has a depth greater than 1. To pass in objects with a depth greater than 1, create a builder for that config slice.'
          );
        });

        it('should not add the value to the config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const config = createConfigBuilder<ConfigType>(configSchema);

          try {
            config.pages({
              contactDetails: {
                name: 'contactDetails',
              },
              personalDetails: {
                name: 'personalDetails',
              },
            });
          } catch {
            // no catch
          }

          expect(config.values()).toEqual({});
        });
      });
    });

    describe('and that value is an array of configs', () => {
      describe('and the configs are valid configs', () => {
        it('should add the value to the config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const config = createConfigBuilder<ConfigType>(configSchema);
          const route = createConfigBuilder<RouteType>(routeSchema, { path: ({ page }) => kebabCase(page) });
          const subRoute = route.fork();

          config.routes([
            route.page('personalDetails').flush(),
            route
              .page('contactDetails')
              .routes([subRoute.page('deliveryAddress').flush(), subRoute.page('billingAddress').flush()])
              .flush(),
          ]);

          expect(config.values()).toEqual({
            routes: [
              { page: 'personalDetails', path: 'personal-details' },
              {
                page: 'contactDetails',
                path: 'contact-details',
                routes: [
                  { page: 'deliveryAddress', path: 'delivery-address' },
                  { page: 'billingAddress', path: 'billing-address' },
                ],
              },
            ],
          });
        });

        it('should be a valid config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const config = createConfigBuilder<ConfigType>(configSchema);
          const route = createConfigBuilder<RouteType>(routeSchema, { path: ({ page }) => kebabCase(page) });

          config.routes([
            route.page('personalDetails').flush(),
            route
              .page('contactDetails')
              .routes(() => {
                const subRoute = route.fork();
                return [subRoute.page('deliveryAddress').flush(), subRoute.page('billingAddress').flush()];
              })
              .flush(),
          ]);

          expect(config.validate()).toBe(true);
        });
      });

      describe('and the configs are not valid configs', () => {
        it('should throw an error', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const config = createConfigBuilder<ConfigType>(configSchema);

          expect(() => config.routes([{ page: 'personalDetails', path: 'personal-details' }])).toThrow(
            '"routes" value has a depth greater than 1. To pass in objects with a depth greater than 1, create a builder for that config slice.'
          );
        });

        it('should not add the value to the config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const config = createConfigBuilder<ConfigType>(configSchema);

          try {
            config.routes([{ page: 'personalDetails', path: 'personal-details' }]);
          } catch {
            // no catch
          }

          expect(config.values()).toEqual({});
        });
      });
    });

    describe('and that value is a derived value', () => {
      it('should add the value to the config automatically', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<ConfigType>(configSchema);

        config
          .countryCode('GB')
          .languageCodes(['en'])
          .locales(({ countryCode, languageCodes }) =>
            // eslint-disable-next-line jest/no-conditional-in-test
            languageCodes?.length && countryCode ? languageCodes.map(code => `${code}_${countryCode}`) : []
          );

        expect(config.values()).toEqual({ countryCode: 'GB', languageCodes: ['en'], locales: ['en_GB'] });
      });

      it('should update the value to the config automatically', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<ConfigType>(configSchema);

        config
          .countryCode('GB')
          .languageCodes(['en'])
          .locales(({ countryCode, languageCodes }) =>
            // eslint-disable-next-line jest/no-conditional-in-test
            languageCodes?.length && countryCode ? languageCodes.map(code => `${code}_${countryCode}`) : []
          )
          .languageCodes(['fr'], true);

        expect(config.values()).toEqual({ countryCode: 'GB', languageCodes: ['fr'], locales: ['fr_GB'] });
      });

      it('should be a valid config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<ConfigType>(configSchema);

        config
          .countryCode('GB')
          .languageCodes(['en'])
          .locales(({ countryCode, languageCodes }) =>
            // eslint-disable-next-line jest/no-conditional-in-test
            languageCodes?.length && countryCode ? languageCodes.map(code => `${code}_${countryCode}`) : []
          );

        expect(config.validate()).toBe(true);
      });
    });
  });
});
