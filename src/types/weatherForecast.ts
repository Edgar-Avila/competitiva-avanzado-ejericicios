export type WeatherForecast = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: Timezone;
  timezone_abbreviation: Timezone;
  elevation: number;
  current_units: CurrentUnits;
  current: Current;
  location_id?: number;
};

export type Current = {
  time: CurrentTime;
  interval: number;
  precipitation: number;
  cloud_cover: number;
};

export enum CurrentTime {
  The20241219T0230 = "2024-12-19T02:30",
}

export type CurrentUnits = {
  time: CurrentUnitsTime;
  interval: Interval;
  precipitation: Precipitation;
  cloud_cover: CloudCover;
};

export enum CloudCover {
  Empty = "%",
}

export enum Interval {
  Seconds = "seconds",
}

export enum Precipitation {
  Mm = "mm",
}

export enum CurrentUnitsTime {
  Iso8601 = "iso8601",
}

export enum Timezone {
  Gmt = "GMT",
}
