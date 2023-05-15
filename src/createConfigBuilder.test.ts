import { type RouteType, type SchemaType, route, schema } from './__testUtils__/schema.ts';

describe('createConfigBuilder', () => {
  describe('when a user adds a value to the config', () => {
    describe('And that value is an enum', () => {
      it('should add the value to the config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const configBuilder = createConfigBuilder<SchemaType>(schema);
        configBuilder.countryCode('GB');
        expect(configBuilder.config()).toEqual({ countryCode: 'GB' });
      });

      it('should be a valid config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const configBuilder = createConfigBuilder<SchemaType>(schema);
        configBuilder.countryCode('GB');
        expect(configBuilder.validate()).toBe(true);
      });
    });

    describe('And that value is an array of enums', () => {
      it('should add the value to the config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const configBuilder = createConfigBuilder<SchemaType>(schema);
        configBuilder.languageCodes(['en']);
        expect(configBuilder.config()).toEqual({ languageCodes: ['en'] });
      });

      it('should be a valid config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const configBuilder = createConfigBuilder<SchemaType>(schema);
        configBuilder.languageCodes(['en']);
        expect(configBuilder.validate()).toBe(true);
      });
    });

    describe('And that value is a record', () => {
      it('should add the value to the config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const configBuilder = createConfigBuilder<SchemaType>(schema);
        configBuilder.timeouts({ apollo: 120_000 });
        expect(configBuilder.config()).toEqual({ timeouts: { apollo: 120_000 } });
      });

      it('should be a valid config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const configBuilder = createConfigBuilder<SchemaType>(schema);
        configBuilder.timeouts({ apollo: 120_000 });
        expect(configBuilder.validate()).toBe(true);
      });
    });

    describe('And that value is a record of configs', () => {
      describe('And the configs are valid configs', () => {
        it('should add the value to the config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const configBuilder = createConfigBuilder<SchemaType>(schema);
          const routeBuilder = createConfigBuilder<RouteType>(route);
          configBuilder.routes({ homepage: routeBuilder.passThrough({ name: 'homepage' }) });
          expect(configBuilder.config()).toEqual({ routes: { homepage: { name: 'homepage' } } });
        });

        it('should be a valid config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const configBuilder = createConfigBuilder<SchemaType>(schema);
          const routeBuilder = createConfigBuilder<RouteType>(route);
          configBuilder.routes({ homepage: routeBuilder.passThrough({ name: 'homepage' }) });
          expect(configBuilder.validate()).toBe(true);
        });
      });

      describe('And the configs are not valid configs', () => {
        it('should throw an error', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const configBuilder = createConfigBuilder<SchemaType>(schema);
          expect(() => configBuilder.routes({ homepage: { name: 'homepage' } })).toThrow();
        });

        it('should not add the value to the config', async () => {
          const { createConfigBuilder } = await import('./createConfigBuilder.ts');
          const configBuilder = createConfigBuilder<SchemaType>(schema);

          try {
            configBuilder.routes({ homepage: { name: 'homepage' } });
          } catch {
            // no catch
          }

          expect(configBuilder.config()).toEqual({});
        });
      });
    });

    describe('And that value is a derived value', () => {
      it('should add the value to the config automatically', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const configBuilder = createConfigBuilder<SchemaType>(schema);

        configBuilder
          .countryCode('GB')
          .languageCodes(['en'])
          .locales(({ countryCode, languageCodes }) =>
            // eslint-disable-next-line jest/no-conditional-in-test
            languageCodes?.length && countryCode ? languageCodes.map(code => `${code}_${countryCode}`) : []
          );

        expect(configBuilder.config()).toEqual({ countryCode: 'GB', languageCodes: ['en'], locales: ['en_GB'] });
      });

      it('should update the value to the config automatically', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const configBuilder = createConfigBuilder<SchemaType>(schema);

        configBuilder
          .countryCode('GB')
          .languageCodes(['en'])
          .locales(({ countryCode, languageCodes }) =>
            // eslint-disable-next-line jest/no-conditional-in-test
            languageCodes?.length && countryCode ? languageCodes.map(code => `${code}_${countryCode}`) : []
          )
          .languageCodes(['fr']);

        expect(configBuilder.config()).toEqual({ countryCode: 'GB', languageCodes: ['fr'], locales: ['fr_GB'] });
      });

      it('should be a valid config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const configBuilder = createConfigBuilder<SchemaType>(schema);

        configBuilder
          .countryCode('GB')
          .languageCodes(['en'])
          .locales(({ countryCode, languageCodes }) =>
            // eslint-disable-next-line jest/no-conditional-in-test
            languageCodes?.length && countryCode ? languageCodes.map(code => `${code}_${countryCode}`) : []
          );

        expect(configBuilder.validate()).toBe(true);
      });
    });
  });
});
