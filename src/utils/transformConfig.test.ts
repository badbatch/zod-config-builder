import configBuilder from '../__testUtils__/configBuilder.ts';

describe('transformConfig', () => {
  describe('when no handlers are passed in', () => {
    it('should return the correct config', async () => {
      const { transformConfig } = await import('./transformConfig.ts');

      await expect(transformConfig(configBuilder.$values())).resolves.toMatchInlineSnapshot(`
        {
          "countryCode": "GB",
          "countryName": null,
          "distanceUnit": "km",
          "enabled": true,
          "languageCodes": [
            "en",
          ],
          "locales": [
            "en_GB",
          ],
          "name": undefined,
          "pages": {
            "contactDetails": {
              "name": "contactDetails",
              "path": undefined,
              "queryParams": undefined,
              "sections": [
                {
                  "name": "header",
                  "sections": undefined,
                },
                {
                  "name": "body",
                  "sections": [
                    {
                      "name": "main",
                      "sections": undefined,
                    },
                    {
                      "name": "sidebar",
                    },
                  ],
                },
                {
                  "name": "footer",
                },
              ],
            },
            "personalDetails": {
              "name": "personalDetails",
              "sections": [
                {
                  "name": "header",
                },
                {
                  "name": "body",
                  "sections": [
                    {
                      "name": "main",
                    },
                    {
                      "name": "sidebar",
                    },
                  ],
                },
                {
                  "name": "footer",
                },
              ],
            },
          },
          "routes": [
            {
              "aliases": undefined,
              "page": "personalDetails",
              "path": "personal-details",
              "routes": undefined,
            },
            {
              "page": "contactDetails",
              "path": "contact-details",
            },
          ],
          "timeouts": {
            "apollo": 10000,
          },
          "timezone": "Europe/London",
        }
      `);
    });
  });
});

describe('transformConfigSync', () => {
  describe('when no handlers are passed in', () => {
    it('should return the correct config', async () => {
      const { transformConfigSync } = await import('./transformConfig.ts');

      expect(transformConfigSync(configBuilder.$values())).toMatchInlineSnapshot(`
        {
          "countryCode": "GB",
          "countryName": null,
          "distanceUnit": "km",
          "enabled": true,
          "languageCodes": [
            "en",
          ],
          "locales": [
            "en_GB",
          ],
          "name": undefined,
          "pages": {
            "contactDetails": {
              "name": "contactDetails",
              "path": undefined,
              "queryParams": undefined,
              "sections": [
                {
                  "name": "header",
                  "sections": undefined,
                },
                {
                  "name": "body",
                  "sections": [
                    {
                      "name": "main",
                      "sections": undefined,
                    },
                    {
                      "name": "sidebar",
                    },
                  ],
                },
                {
                  "name": "footer",
                },
              ],
            },
            "personalDetails": {
              "name": "personalDetails",
              "sections": [
                {
                  "name": "header",
                },
                {
                  "name": "body",
                  "sections": [
                    {
                      "name": "main",
                    },
                    {
                      "name": "sidebar",
                    },
                  ],
                },
                {
                  "name": "footer",
                },
              ],
            },
          },
          "routes": [
            {
              "aliases": undefined,
              "page": "personalDetails",
              "path": "personal-details",
              "routes": undefined,
            },
            {
              "page": "contactDetails",
              "path": "contact-details",
            },
          ],
          "timeouts": {
            "apollo": 10000,
          },
          "timezone": "Europe/London",
        }
      `);
    });
  });
});
