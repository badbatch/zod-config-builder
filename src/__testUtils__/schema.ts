import { z } from 'zod';
import { countryCodes } from '../data/countryCodes.ts';
import { countryNames } from '../data/countryNames.ts';
import { distanceUnits } from '../data/distanceUnits.ts';
import { languageCodes } from '../data/languageCodes.ts';
import { timezones } from '../data/timezones.ts';

export const schema = z.object({
  countryCode: z.enum(countryCodes).optional(),
  countryName: z.enum(countryNames).optional(),
  distanceUnit: z.enum(distanceUnits).optional(),
  languageCodes: z.array(z.enum(languageCodes)).optional(),
  locales: z
    .string()
    .regex(/[a-z]{2}_[a-z]{2}/)
    .optional(),
  timeouts: z.record(z.number()).optional(),
  timezone: z.enum(timezones).optional(),
});

export type Type = z.infer<typeof schema>;
