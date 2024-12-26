type ACOEdge = { distance: number; pheromones: number };

export class ACO {
  constructor(
    private readonly graph: ACOGraph,
    private readonly maxIterations: number = 100,
    private readonly maxAntSteps: number = 100,
    private readonly antCount: number = 100,
    private readonly alpha: number = 0.7,
    private readonly beta: number = 0.3,
    private searchAnts: ACOAnt[] = []
  ) {}

  private deploySearchAnts(source: number, target: number) {
    for (let i = 0; i < this.maxIterations; i++) {
      this.searchAnts = [];
      for (let j = 0; j < this.antCount; j++) {
        const ant = new ACOAnt(
          source,
          target,
          this.alpha,
          this.beta,
          this.graph
        );
        this.searchAnts.push(ant);
      }
      this.searchForwards();
      this.searchBackwards();
    }
  }

  private searchForwards() {
    for (let ant of this.searchAnts) {
      for (let i = 0; i < this.maxAntSteps; i++) {
        if (ant.reachedTarget()) {
          ant.isFit = true;
          break;
        }
        ant.takeStep();
      }
    }
  }

  private searchBackwards() {
    for (let ant of this.searchAnts) {
      for (let i = 0; i < this.maxAntSteps; i++) {
        if (ant.isFit) {
          ant.depositPheromonesOnPath();
        }
      }
    }
  }

  private deploySolutionAnt(source: number, target: number): ACOAnt {
    const ant = new ACOAnt(source, target, this.alpha, this.beta, this.graph);
    ant.isSolutionAnt = true;
    for (let i = 0; i < this.maxAntSteps * 10; i++) {
      if (ant.reachedTarget()) {
        break;
      }
      ant.takeStep();
    }
    return ant;
  }

  run(source: number, target: number): number[] {
    this.deploySearchAnts(source, target);
    const ant = this.deploySolutionAnt(source, target);
    return ant.path;
  }
}

export class ACOGraph {
  constructor(
    public graph: { [key: number]: { [key: number]: ACOEdge } } = {},
    public evaporation: number = 0.1,
    public initialPheromones: number = 1
  ) {
    this.initAllPheromones();
  }

  private initAllPheromones() {
    for (const from in this.graph) {
      for (const to in this.graph[from]) {
        this.graph[from][to].pheromones = this.initialPheromones;
      }
    }
  }

  depositPheromones(from: number, to: number, pheromones: number) {
    if (!this.graph[from] || !this.graph[from][to]) {
      throw new Error("Invalid edge");
    }
    this.graph[from][to].pheromones += (1 - this.evaporation) * pheromones;
  }

  setPheromones(from: number, to: number, pheromones: number) {
    if (!this.graph[from] || !this.graph[from][to]) {
      throw new Error("Invalid edge");
    }
    this.graph[from][to].pheromones = pheromones;
  }

  getDistance(from: number, to: number): number {
    if (!this.graph[from] || !this.graph[from][to]) {
      throw new Error("Invalid edge");
    }
    return this.graph[from][to].distance;
  }

  getPheromones(from: number, to: number): number {
    if (!this.graph[from] || !this.graph[from][to]) {
      throw new Error("Invalid edge");
    }
    return this.graph[from][to].pheromones;
  }

  getNeighbors(node: number): number[] {
    if (!this.graph[node]) {
      throw new Error("Invalid node");
    }
    return Object.keys(this.graph[node]).map((n) => parseInt(n));
  }

  getEdge(from: number, to: number): ACOEdge {
    if (!this.graph[from] || !this.graph[from][to]) {
      throw new Error("Invalid edge");
    }
    return this.graph[from][to];
  }
}

class ACOAnt {
  constructor(
    public source: number,
    public target: number,
    public alpha: number, // Weight of pheromones
    public beta: number, // Weight of distance
    public graph: ACOGraph,
    public visitedNodes: number[] = [],
    public pathCost: number = 0,
    public isFit: boolean = false,
    public isSolutionAnt: boolean = false,
    public current: number = source,
    public path: number[] = [source]
  ) {}

  public reachedTarget() {
    return this.current === this.target;
  }

  public takeStep() {
    this.visitedNodes.push(this.current);
    const next = this.chooseNextNode();
    if (!next) {
      return;
    }

    this.path.push(next);
    this.pathCost += this.graph.getDistance(this.current, next);
    this.current = next;
  }

  private chooseNextNode(): number | null {
    const neighbors = this.graph.getNeighbors(this.current);
    const possible = neighbors.filter((n) => !this.visitedNodes.includes(n));
    if (possible.length === 0) {
      return null;
    }

    let next = possible[0];
    if (this.isSolutionAnt) {
      next = this.chooseBestNode(possible);
    } else {
      next = this.chooseNodeByProbability(possible);
    }

    return next;
  }

  private chooseBestNode(possible: number[]): number {
    let best = possible[0];
    let bestValue = this.graph.getPheromones(this.current, best) ** this.alpha;
    for (let i = 1; i < possible.length; i++) {
      const node = possible[i];
      const value = this.graph.getPheromones(this.current, node) ** this.alpha;
      if (value > bestValue) {
        best = node;
        bestValue = value;
      }
    }
    return best;
  }

  private chooseNodeByProbability(possible: number[]): number {
    let sum = 0;
    for (let node of possible) {
      sum +=
        this.graph.getPheromones(this.current, node) ** this.alpha +
        (1 / this.graph.getDistance(this.current, node)) ** this.beta;
    }

    let r = Math.random();
    let total = 0;
    for (let node of possible) {
      total += this.graph.getPheromones(this.current, node) ** this.alpha
        + (1 / this.graph.getDistance(this.current, node)) ** this.beta;
      if (total / sum >= r) {
        return node;
      }
    }
    return possible[possible.length - 1];
  }

  public depositPheromonesOnPath() {
    for (let i = 0; i < this.path.length - 1; i++) {
      const from = this.path[i];
      const to = this.path[i + 1];
      const val = 1 / this.pathCost;
      this.graph.depositPheromones(from, to, val);
    }
  }
}
