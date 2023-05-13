import { type Type, schema } from './__testUtils__/schema.ts';

describe('createConfigBuilder', () => {
  describe('when a user adds a value to the config', () => {
    describe('And that value is an enum', () => {
      it('should add the value to the config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<Type>(schema);
        config.countryCode = 'GB';
        expect(config.toJs()).toEqual({ countryCode: 'GB' });
      });

      it('should be a valid config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<Type>(schema);
        config.countryCode = 'GB';
        expect(config.validate('countryCode')).toBe(true);
      });
    });

    describe('And that value is an array of enums', () => {
      it('should add the value to the config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<Type>(schema);
        config.languageCodes = ['en'];
        expect(config.toJs()).toEqual({ languageCodes: ['en'] });
      });

      it('should be a valid config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<Type>(schema);
        config.languageCodes = ['en'];
        expect(config.validate()).toBe(true);
      });
    });

    describe('And that value is a record', () => {
      it('should add the value to the config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<Type>(schema);
        config.timeouts = { apollo: 120_000 };
        expect(config.toJs()).toEqual({ timeouts: { apollo: 120_000 } });
      });

      it('should be a valid config', async () => {
        const { createConfigBuilder } = await import('./createConfigBuilder.ts');
        const config = createConfigBuilder<Type>(schema);
        config.timeouts = { apollo: 120_000 };
        expect(config.validate()).toBe(true);
      });
    });

    // describe('And that value is a derived value', () => {
    //   it('should add the value to the config automatically', async () => {
    //     const { createConfigBuilder } = await import('./createConfigBuilder.ts');
    //     const config = createConfigBuilder<Type>(schema);
    //     config.countryCode?.('GB');
    //     config.languageCodes?.(['en']);
    //     config.locales?.(1);
    //     expect(config.toJs()).toEqual({ timeouts: { apollo: 120_000 } });
    //   });

    //   it('should be a valid config', async () => {
    //     const { createConfigBuilder } = await import('./createConfigBuilder.ts');
    //     const config = createConfigBuilder<Type>(schema);
    //     config.timeouts?.({ apollo: 120_000 });
    //     expect(config.validate()).toBe(true);
    //   });
    // });
  });
});
