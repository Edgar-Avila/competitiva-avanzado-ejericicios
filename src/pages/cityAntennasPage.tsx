import { MapContainer, TileLayer, GeoJSON, CircleMarker, Marker, Popup } from "react-leaflet";
import PunoGeoJson from "../assets/puno.json";
import { OptimizationConfig, optimizeAntennaPlacement } from "../core/beeColonyOptimization";
import PunoJson from "../assets/puno.json";

interface Props {}

const initialZoom = 5.5;
const initialPosition = {
  lat: -9.800678,
  lng: -74.900665,
};

const CityAntennasPage: React.FC<Props> = () => {
  // const polygon: any = {
  //   coordinates: [
  //     { lat: 40.712, lng: -74.227 },
  //     { lat: 40.774, lng: -74.125 },
  //     { lat: 40.712, lng: -74.025 },
  //   ],
  // };

  const polygon = {
    coordinates: PunoJson.geometry.coordinates[0].map((coord: number[]) => {
      return { lat: coord[1], lng: coord[0] };
    })
  } as any;

  const config: OptimizationConfig = {
    polygon,
    maxAntennas: 10,
    maxIterations: 100,
    initialPopulation: 50,
  };

  const result = optimizeAntennaPlacement(config);
  console.log(result);

  return (
    <MapContainer center={initialPosition} zoom={initialZoom} className="grow">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON data={PunoGeoJson as any} />
      {result.antennas.map((antenna, index) => (
        <Marker
          key={index}
          position={antenna.location}
        >
          <Popup>
            <p>Costo: {antenna.cost}</p>
            <p>Cobertura: {antenna.range}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default CityAntennasPage;
