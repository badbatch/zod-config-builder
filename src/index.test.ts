import kebabCase from 'lodash/kebabCase.js';
import { type ConfigType, type RouteType, configSchema, routeSchema } from './__testUtils__/schema.ts';

describe('zod-config-builder', () => {
  describe('when a user adds a key that is a reserved keyword', () => {
    it.todo('should throw an error');
  });

  describe('when a user adds a value to the config', () => {
    describe('And that value is an enum', () => {
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

    describe('And that value is an array of enums', () => {
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

    describe('And that value is a record', () => {
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

    describe('And that value is an record of configs', () => {
      describe('And the configs are valid configs', () => {
        it.todo('should add the value to the config');
      });
    });

    describe('And that value is an array of configs', () => {
      describe('And the configs are valid configs', () => {
        it('should add the value to the config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const config = createConfigBuilder<ConfigType>(configSchema);
          const route = createConfigBuilder<RouteType>(routeSchema, { path: ({ name }) => kebabCase(name) });
          const subRoute = route.fork();

          config.routes([
            route.name('personalDetails').flush(),
            route
              .name('contactDetails')
              .routes([subRoute.name('deliveryAddress').flush(), subRoute.name('billingAddress').flush()])
              .flush(),
          ]);

          expect(config.values()).toEqual({
            routes: [
              { name: 'personalDetails', path: 'personal-details' },
              {
                name: 'contactDetails',
                path: 'contact-details',
                routes: [
                  { name: 'deliveryAddress', path: 'delivery-address' },
                  { name: 'billingAddress', path: 'billing-address' },
                ],
              },
            ],
          });
        });

        it('should be a valid config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const config = createConfigBuilder<ConfigType>(configSchema);
          const route = createConfigBuilder<RouteType>(routeSchema, { path: ({ name }) => kebabCase(name) });

          config.routes([
            route.name('personalDetails').flush(),
            route
              .name('contactDetails')
              .routes(() => {
                const subRoute = route.fork();
                return [subRoute.name('deliveryAddress').flush(), subRoute.name('billingAddress').flush()];
              })
              .flush(),
          ]);

          expect(config.validate()).toBe(true);
        });
      });

      describe('And the configs are not valid configs', () => {
        it('should throw an error', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const config = createConfigBuilder<ConfigType>(configSchema);
          expect(() => config.routes([{ name: 'personalDetails', path: 'personal-details' }])).toThrow();
        });

        it('should not add the value to the config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const config = createConfigBuilder<ConfigType>(configSchema);

          try {
            config.routes([{ name: 'personalDetails', path: 'personal-details' }]);
          } catch {
            // no catch
          }

          expect(config.values()).toEqual({});
        });
      });
    });

    describe('And that value is a derived value', () => {
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
          .languageCodes(['fr']);

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
