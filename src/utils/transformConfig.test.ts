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
          "pages": {
            "contactDetails": {
              "name": "contactDetails",
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
              "page": "personalDetails",
              "path": "personal-details",
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
          "pages": {
            "contactDetails": {
              "name": "contactDetails",
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
              "page": "personalDetails",
              "path": "personal-details",
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
