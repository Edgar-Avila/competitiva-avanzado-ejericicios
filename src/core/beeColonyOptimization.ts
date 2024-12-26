import { LatLng, LatLngBounds } from "leaflet";

// Tipos para antenas y configuraciones
export interface Antenna {
  location: LatLng; // Coordenadas de la antena
  range: number; // Rango en metros
  cost: number; // Costo de la antena
  intensity: number; // Intensidad de señal (0 a 1)
}

export interface Polygon {
  coordinates: LatLng[]; // Array de puntos que forman el polígono
}

export interface OptimizationResult {
  antennas: Antenna[]; // Lista de antenas optimizadas
  coverage: number; // Cobertura total (%)
  cost: number; // Costo total
}

export interface OptimizationConfig {
  polygon: Polygon;
  maxAntennas: number; // Número máximo de antenas
  maxIterations: number; // Iteraciones del algoritmo
  initialPopulation: number; // Tamaño inicial de la población
}

// Utilidad para verificar si un punto está dentro de un polígono
export const isPointInPolygon = (point: LatLng, polygon: Polygon): boolean => {
  const { coordinates } = polygon;
  let inside = false;
  for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
    const xi = coordinates[i].lat,
      yi = coordinates[i].lng;
    const xj = coordinates[j].lat,
      yj = coordinates[j].lng;
    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Generar población inicial de antenas aleatorias dentro del polígono
const generateInitialPopulation = (
  polygon: Polygon,
  populationSize: number,
  maxRange: number,
  maxCost: number
): Antenna[] => {
  const bounds = new LatLngBounds(polygon.coordinates);
  const antennas: Antenna[] = [];
  for (let i = 0; i < populationSize; i++) {
    const lat = Math.random() * (bounds.getNorth() - bounds.getSouth()) + bounds.getSouth();
    const lng = Math.random() * (bounds.getEast() - bounds.getWest()) + bounds.getWest();
    const location = new LatLng(lat, lng);
    if (isPointInPolygon(location, polygon)) {
      antennas.push({
        location,
        range: Math.random() * maxRange,
        cost: Math.random() * maxCost,
        intensity: Math.random(),
      });
    }
  }
  return antennas;
};

// Evaluar solución: Cobertura total y costo
const evaluateSolution = (antennas: Antenna[], polygon: Polygon): { coverage: number; cost: number } => {
  let coverage = 0;
  let cost = 0;

  // Crear una malla de puntos para medir cobertura
  const bounds = new LatLngBounds(polygon.coordinates);
  const step = 0.001; // Paso en grados para la malla
  const gridPoints: LatLng[] = [];
  for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += step) {
    for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += step) {
      const point = new LatLng(lat, lng);
      if (isPointInPolygon(point, polygon)) gridPoints.push(point);
    }
  }

  gridPoints.forEach((point) => {
    if (
      antennas.some(
        (antenna) => point.distanceTo(antenna.location) <= antenna.range
      )
    ) {
      coverage++;
    }
  });

  antennas.forEach((antenna) => (cost += antenna.cost));

  return { coverage: (coverage / gridPoints.length) * 100, cost };
};

// Implementación del algoritmo de la Colonia Artificial de Abejas
export const optimizeAntennaPlacement = (
  config: OptimizationConfig
): OptimizationResult => {
  const { polygon, maxAntennas, maxIterations, initialPopulation } = config;

  let population = generateInitialPopulation(polygon, initialPopulation, 500, 1000);
  let bestSolution = population.slice(0, maxAntennas);
  let bestFitness = evaluateSolution(bestSolution, polygon);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Movimiento exploratorio
    population = population.map((antenna) => {
      const perturbation = 0.01; // Variación
      const newLocation = new LatLng(
        antenna.location.lat + (Math.random() - 0.5) * perturbation,
        antenna.location.lng + (Math.random() - 0.5) * perturbation
      );
      return isPointInPolygon(newLocation, polygon)
        ? { ...antenna, location: newLocation }
        : antenna;
    });

    // Evaluar nuevas soluciones
    const newSolution = population.slice(0, maxAntennas);
    const newFitness = evaluateSolution(newSolution, polygon);

    // Actualizar mejor solución
    if (newFitness.coverage > bestFitness.coverage || newFitness.cost < bestFitness.cost) {
      bestSolution = newSolution;
      bestFitness = newFitness;
    }
  }

  return { antennas: bestSolution, ...bestFitness };
};
