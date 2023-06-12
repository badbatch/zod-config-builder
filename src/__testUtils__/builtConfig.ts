/* eslint-disable prettier/prettier, import/no-default-export, unicorn/numeric-separators-style */

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
