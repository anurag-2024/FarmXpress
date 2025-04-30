// A* Pathfinding Algorithm Implementation
const graph = require('./locationGraph');

function heuristic(a, b) {
  return 1;
}

function astar(start, goal) {
  let openSet = new Set([start]);
  let cameFrom = {};

  let gScore = {};
  let fScore = {};

  Object.keys(graph).forEach(node => {
    gScore[node] = Infinity;
    fScore[node] = Infinity;
  });
  gScore[start] = 0;
  fScore[start] = heuristic(start, goal);

  while (openSet.size > 0) {
    let current = [...openSet].reduce((a, b) => fScore[a] < fScore[b] ? a : b);

    if (current === goal) {
      let path = [current];
      while (cameFrom[current]) {
        current = cameFrom[current];
        path.unshift(current);
      }
      return { path, cost: gScore[goal] };
    }

    openSet.delete(current);

    for (let neighbor in graph[current]) {
      let tentativeG = gScore[current] + graph[current][neighbor];

      if (tentativeG < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = tentativeG + heuristic(neighbor, goal);
        openSet.add(neighbor);
      }
    }
  }

  return { path: [], cost: Infinity };
}

module.exports = astar;