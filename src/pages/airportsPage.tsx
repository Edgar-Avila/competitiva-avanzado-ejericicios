import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import dataService from "../services/dataService";
import { Airport } from "../types/airport";
import L, { LatLngExpression } from "leaflet";
import { haversineDistance } from "../utils/gis";
import { FlightRoute } from "../types/flightRoutes";
import { ACO, ACOGraph } from "../core/antColonyOptimization";

interface Props {}

const initialZoom = 3;

const intitialPosition = {
  lat: -15.800678,
  lng: -60.900665,
};

const AirportMarker = ({ airport }: { airport: Airport }) => {
  const scaleFactor = 1.25;
  const initialSize = 4 + initialZoom * scaleFactor;
  const [size, setSize] = useState(initialSize);
  const map = useMapEvents({
    zoomend: () => {
      const zoom = map.getZoom();
      setSize(initialSize + zoom * scaleFactor);
    },
  });

  return (
    <Marker
      position={{
        lat: airport.latitude,
        lng: airport.longitude,
      }}
      icon={L.icon({
        iconUrl:
          "https://api.iconify.design/fa/plane.svg?color=%234f72ffcc&height=16",
        iconAnchor: [size / 2, size / 2],
        iconSize: [size, size],
      })}
    >
      <Popup>
        <h4 className="text-lg font-bold">{airport.name}</h4>
      </Popup>
    </Marker>
  );
};

const AirportsPage: React.FC<Props> = () => {
  // ***************************************************************************
  // Hooks
  // **************************************************************************
  const [airports, setAirports] = useState<Airport[]>([]);
  const [routes, setRoutes] = useState<FlightRoute[]>([]);
  const [resultPolyline, setResultPolyline] = useState<LatLngExpression[]>([]);

  useEffect(() => {
    Promise.all([fetchAirports(), fetchRoutes()]);
  }, []);

  // ***************************************************************************
  // Functional core
  // ***************************************************************************
  const getAirportById = (airports: Airport[], id: number) => {
    return airports.find((airport) => airport.id === id);
  };

  const prepareAirports = (airports: Airport[]) => {
    return airports.sort((a, b) => a.name.localeCompare(b.name));
  };

  const airportDistance = (a: Airport, b: Airport) => {
    return haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude);
  };

  const routesToPolyline = (
    routes: FlightRoute[],
    airports: Airport[]
  ): LatLngExpression[][] => {
    const done = new Set<string>();
    return routes
      .map((route) => {
        const source = getAirportById(airports, route.source);
        const target = getAirportById(airports, route.target);

        const isDone = done.has(`${source?.id}-${target?.id}`);

        done.add(`${source?.id}-${target?.id}`);
        done.add(`${target?.id}-${source?.id}`);

        if (!source || !target || isDone) {
          return [];
        }

        return [
          [source.latitude, source.longitude],
          [target.latitude, target.longitude],
        ];
      })
      .filter((route) => route.length > 0) as LatLngExpression[][];
  };

  const resultPathToPolyline = (
    path: number[],
    airports: Airport[]
  ): LatLngExpression[] => {
    return path.map((id) => {
      const airport = getAirportById(airports, id);
      if (!airport) {
        throw new Error("Invalid airport");
      }
      return [airport.latitude, airport.longitude];
    }) as LatLngExpression[];
  }

  const makeGraph = (airports: Airport[], routes: FlightRoute[]) => {
    const graph: any  = {};

    airports.forEach((airport) => {
      graph[airport.id] = {};
    });

    routes.forEach((route) => {
      const source = getAirportById(airports, route.source);
      const target = getAirportById(airports, route.target);

      if (!source || !target) {
        return;
      }

      const distance = airportDistance(source, target);
      graph[source.id] = {
        ...graph[source.id],
        [target.id]: {
          distance,
          pheromones: 1,
        },
      }
    });

    return new ACOGraph(graph);
  };

  const antColonyOptimization = (
    airports: Airport[],
    routes: FlightRoute[],
    from: Airport,
    to: Airport,
  ) => {
    const graph = makeGraph(airports, routes);
    const aco = new ACO(graph)
    const path = aco.run(from.id, to.id);
    return path;
  };

  // ***************************************************************************
  // Imperative shell
  // **************************************************************************
  const fetchAirports = async () => {
    const result = await dataService.getAirports();
    const data = prepareAirports(result.data);
    setAirports(data);
  };

  const fetchRoutes = async () => {
    const result = await dataService.getRoutes();
    setRoutes(result.data);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const fromVal = formData.get("from");
    const toIdVal = formData.get("to");

    const fromId = Number(fromVal);
    const toId = Number(toIdVal);

    const from = getAirportById(airports, fromId);
    const to = getAirportById(airports, toId);

    if (!from || !to) {
      alert("Invalid airports");
      return;
    }

    const path = antColonyOptimization(airports, routes, from, to);
    const polyline = resultPathToPolyline(path, airports);
    setResultPolyline(polyline);
  };


  const polylines = routesToPolyline(routes, airports);

  return (
    <>
      <MapContainer
        center={intitialPosition}
        zoom={initialZoom}
        className="grow"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polylines.map((polyline, index) => (
          <Polyline
            key={index}
            pathOptions={{ color: "#4f72ff77", weight: 1 }}
            positions={polyline}
          />
        ))}
        {resultPolyline.length > 0 && (
          <Polyline
            pathOptions={{ color: "#ff4f4f", weight: 2 }}
            positions={resultPolyline}
          />
        )}
        {airports.map((airport) => (
          <AirportMarker key={airport.id} airport={airport} />
        ))}
      </MapContainer>
      <form className="flex flex-col space-y-4 p-4" onSubmit={onSubmit}>
        <label className="flex flex-col">
          <span className="label-text">From:</span>
          <select className="select select-bordered" name="from">
            {airports.map((airport) => (
              <option key={airport.id} value={airport.id}>
                {airport.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col">
          <span className="label-text">To:</span>
          <select className="select select-bordered" name="to">
            {airports.map((airport) => (
              <option key={airport.id} value={airport.id}>
                {airport.name}
              </option>
            ))}
          </select>
        </label>

        <button className="btn btn-primary">Search</button>
      </form>
    </>
  );
};

export default AirportsPage;
