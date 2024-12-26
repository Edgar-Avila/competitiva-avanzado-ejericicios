import Papa from "papaparse";
import { Airport } from "../types/airport";
import { WeatherForecast } from "../types/weatherForecast";
import { FlightRoute } from "../types/flightRoutes";

class DataService {
  async getAirports() {
    const res = await fetch("/data/airports.csv");
    const data = await res.text();
    const result = Papa.parse<Airport>(data, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    return result;
  }

  async getRoutes() {
    const res = await fetch("/data/routes.csv");
    const data = await res.text();
    const result = Papa.parse<FlightRoute>(data, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    return result;
  }

  async getWeather(latitudes: number[], longitudes: number[]) {
    const params = new URLSearchParams({
      latitude: latitudes.join(","),
      longitude: longitudes.join(","),
      current: "precipitation,cloud_cover",
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    const data = await res.json();
    return data as WeatherForecast[];
  }
}

const dataService = new DataService();

export default dataService;
