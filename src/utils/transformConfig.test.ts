import configBuilder from '../__testUtils__/configBuilder.ts';

describe('transformConfig', () => {
  describe('when no handlers are passed in', () => {
    it('should return the correct config', async () => {
      const { transformConfig } = await import('./transformConfig.ts');
      await expect(transformConfig(configBuilder.$values())).resolves.toMatchSnapshot();
    });
  });
});

describe('transformConfigSync', () => {
  describe('when no handlers are passed in', () => {
    it('should return the correct config', async () => {
      const { transformConfigSync } = await import('./transformConfig.ts');
      expect(transformConfigSync(configBuilder.$values())).toMatchSnapshot();
    });
  });
});
