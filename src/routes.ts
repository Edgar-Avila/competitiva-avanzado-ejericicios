export const routes = {
  home: () => "/" as const,
  airports: () => "/aeropuertos" as const,
  cityAntennas: () => "/antenas-ciudad" as const,
  campusAntennas: () => "/antenas-campus" as const,
} as const;

export type Route = ReturnType<(typeof routes)[keyof typeof routes]>;
export type Routes = typeof routes;
