import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import { OptimizationConfig, optimizeAntennaPlacement } from "../core/beeColonyOptimization";
import UnapJson from "../assets/unap.json";

interface Props {}

const initialZoom = 5.5;
const initialPosition = {
  lat: -9.800678,
  lng: -74.900665,
};

const CampusAntennasPage: React.FC<Props> = () => {
  const polygon = {
    coordinates: UnapJson.features[0].geometry.coordinates[0].map((coord: number[]) => {
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

  return (
    <MapContainer center={initialPosition} zoom={initialZoom} className="grow">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON data={UnapJson as any} />
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

export default CampusAntennasPage;
