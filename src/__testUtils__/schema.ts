import { z } from 'zod';
import { countryCodes } from '../data/countryCodes.ts';
import { countryNames } from '../data/countryNames.ts';
import { distanceUnits } from '../data/distanceUnits.ts';
import { languageCodes } from '../data/languageCodes.ts';
import { timezones } from '../data/timezones.ts';

export const baseSectionSchema = z.object({
  name: z.string(),
});

export type SectionType = z.infer<typeof baseSectionSchema> & {
  sections?: SectionType[];
};

export const sectionSchema: z.ZodType<SectionType> = baseSectionSchema.extend({
  sections: z.lazy(() => sectionSchema.array()).optional(),
});

export const pageSchema = z.object({
  name: z.string(),
  path: z.string().optional(),
  queryParams: z.array(z.string()).optional(),
  sections: z.array(sectionSchema).optional(),
});

export type PageType = z.infer<typeof pageSchema>;

const baseRouteSchema = z.object({
  aliases: z.array(z.string()).optional(),
  page: z.string(),
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
  name: z.string().optional(),
  pages: z.record(pageSchema).optional(),
  routes: z.array(routeSchema).optional(),
  timeouts: z.record(z.number()).optional(),
  timezone: z.enum(timezones).optional(),
});

export type ConfigType = z.infer<typeof configSchema>;
