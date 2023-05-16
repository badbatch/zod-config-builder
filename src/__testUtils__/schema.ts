import { z } from 'zod';
import { countryCodes } from '../data/countryCodes.ts';
import { countryNames } from '../data/countryNames.ts';
import { distanceUnits } from '../data/distanceUnits.ts';
import { languageCodes } from '../data/languageCodes.ts';
import { timezones } from '../data/timezones.ts';

export const pageSchema = z.object({
  name: z.string(),
});

const baseRouteSchema = z.object({
  aliases: z.array(z.string()).optional(),
  name: z.string(),
  path: z.string(),
});

export type RouteType = z.infer<typeof baseRouteSchema> & {
  routes?: RouteType[];
};

export const routeSchema: z.ZodType<RouteType> = baseRouteSchema.extend({
  routes: z.lazy(() => routeSchema.array()).optional(),
});

export const configSchema = z.object({
  countryCode: z.enum(countryCodes).optional(),
  countryName: z.enum(countryNames).optional(),
  distanceUnit: z.enum(distanceUnits).optional(),
  languageCodes: z.array(z.enum(languageCodes)).optional(),
  locales: z.array(z.string().regex(/[a-z]{2}_[A-Z]{2}/)).optional(),
  routes: z.array(routeSchema).optional(),
  timeouts: z.record(z.number()).optional(),
  timezone: z.enum(timezones).optional(),
});

export type ConfigType = z.infer<typeof configSchema>;
