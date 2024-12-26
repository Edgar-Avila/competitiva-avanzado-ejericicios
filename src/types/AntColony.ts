export type ACOEdgeInfo = { to: number; distance: number; pheromones: number };
export type ACOGraph = { [key: number]: ACOEdgeInfo[] };
export type ACOAnt = { current: number; path: number[] };
