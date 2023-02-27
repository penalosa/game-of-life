const games = new Map<string, Map<number, Map<number, boolean>>>();

function checkNeighbours(
  i: number,
  j: number,
  vertical: number,
  horizontal: number,
  filledCells: Map<number, Map<number, boolean>>
) {
  let live = 0;
  [-1, 0, 1].forEach((x) => {
    [-1, 0, 1].forEach((y) => {
      if (x == 0 && y == 0) return;
      let xc = j + x;
      let yc = i + y;
      if (yc === vertical) {
        yc = 0;
      } else if (yc === -1) {
        yc = vertical - 1;
      }
      if (xc === horizontal) {
        xc = 0;
      } else if (xc === -1) {
        xc = horizontal - 1;
      }
      if (filledCells.get(yc).get(xc)) live++;
    });
  });
  return live;
}
function constructGame(
  vertical: number,
  horizontal: number
): Map<number, Map<number, boolean>> {
  let filledCells = new Map();
  for (let i = 0; i < vertical; i++) {
    filledCells.set(i, new Map());
    for (let j = 0; j < horizontal; j++) {
      filledCells.get(i).set(j, false);
    }
  }
  return filledCells;
}
export function startGame(vertical: number, horizontal: number) {
  const gameId = crypto.randomUUID();
  const game = constructGame(vertical, horizontal);
  games.set(gameId, game);
  return { game, gameId };
}

export function tick(
  vertical: number,
  horizontal: number,
  gameId: string
): [number, number, boolean][] {
  if (!games.has(gameId)) {
    throw new Error("Game not found");
  }
  const gameCells = games.get(gameId);
  let listOfChanges = [];
  for (let i = 0; i < vertical; i++) {
    for (let j = 0; j < horizontal; j++) {
      let neighbours = checkNeighbours(i, j, vertical, horizontal, gameCells);

      if (gameCells.get(i).get(j) && (neighbours === 2 || neighbours === 3))
        continue;
      else if (!gameCells.get(i).get(j) && neighbours === 3)
        listOfChanges.push([i, j, true]);
      else if (gameCells.get(i).get(j)) {
        listOfChanges.push([i, j, false]);
      }
    }
  }
  listOfChanges.forEach((c) => gameCells.get(c[0]).set(c[1], c[2]));

  return listOfChanges;
}

export function click(x: number, y: number, gameId: string) {
  if (!games.has(gameId)) {
    throw new Error("Game not found");
  }

  const gameCells = games.get(gameId);

  let listOfChanges: [number, number, boolean][] = [
    [x, y, !gameCells.get(x).get(y)]
  ];
  listOfChanges.forEach((c) => gameCells.get(c[0]).set(c[1], c[2]));

  return listOfChanges;
}
