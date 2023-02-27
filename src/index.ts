import { WorkerClient } from "worker-functions";
const w = WorkerClient("http://localhost:8787");

function updateGameCells(
  changes: [number, number, boolean][],
  game: Map<number, Map<number, boolean>>
) {
  changes.forEach((c) => game.get(c[0])?.set(c[1], c[2]));
  return game;
}

async function main() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const { height, width } = document.body.getBoundingClientRect();
  canvas.height = height;
  canvas.width = width;
  let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const vertical = Math.floor(height / 24);
  const horizontal = Math.floor(width / 24);

  const topSpace = (height - vertical * 24) / 2 + 2;
  const sideSpace = (width - horizontal * 24) / 2 + 2;

  const { game, gameId } = await w.startGame(vertical, horizontal);
  let start = false;
  let currentFrame: number;
  const draw = async () => {
    try {
      if (start) {
        const changes = await w.tick(vertical, horizontal, gameId);
        updateGameCells(changes, game);
      }
      for (let i = 0; i < vertical; i++) {
        for (let j = 0; j < horizontal; j++) {
          if (game.get(i)?.get(j)) {
            ctx.fillStyle = "#3182CE";
          } else {
            ctx.fillStyle = "#2D3748";
          }
          ctx.fillRect(sideSpace + j * 24, topSpace + i * 24, 20, 20);
        }
      }
      currentFrame = requestAnimationFrame(draw);
    } catch (e) {
      requestAnimationFrame(main);
    }
  };
  currentFrame = requestAnimationFrame(draw);

  document.addEventListener("mousedown", async (e) => {
    try {
      const changes = await w.click(
        Math.floor((e.clientY - topSpace) / 24),
        Math.floor((e.clientX - sideSpace) / 24),
        gameId
      );
      updateGameCells(changes, game);
    } catch {
      cancelAnimationFrame(currentFrame);
      requestAnimationFrame(main);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === " ") start = !start;
  });
}
main();
