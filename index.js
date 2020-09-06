const canvas = document.getElementById("canvas");
const { height, width } = document.body.getBoundingClientRect();
console.log(height, width);
canvas.height = height;
canvas.width = width;
let ctx = canvas.getContext("2d");

const vertical = Math.floor(height / 24);
const horizontal = Math.floor(width / 24);

const topSpace = (height - vertical * 24) / 2 + 2;
const sideSpace = (width - horizontal * 24) / 2 + 2;
let filledCells = new Map();
for (let i = 0; i < vertical; i++) {
  filledCells.set(i, new Map());
  for (let j = 0; j < horizontal; j++) {
    filledCells.get(i).set(j, false);
  }
}
const checkNeighbours = (i, j) => {
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
};
const runGOF = () => {
  let listOfChanges = [];
  for (let i = 0; i < vertical; i++) {
    for (let j = 0; j < horizontal; j++) {
      let neighbours = checkNeighbours(i, j);

      if (filledCells.get(i).get(j) && (neighbours === 2 || neighbours === 3))
        continue;
      else if (!filledCells.get(i).get(j) && neighbours === 3)
        listOfChanges.push([i, j, true]);
      else listOfChanges.push([i, j, false]);
    }
  }
  listOfChanges.forEach((c) => filledCells.get(c[0]).set(c[1], c[2]));
};
let start = false;
const draw = () => {
  requestAnimationFrame(draw);
  start && runGOF();
  for (let i = 0; i < vertical; i++) {
    for (let j = 0; j < horizontal; j++) {
      if (filledCells.get(i).get(j)) {
        ctx.fillStyle = "#3182CE";
      } else {
        ctx.fillStyle = "#2D3748";
      }
      ctx.fillRect(sideSpace + j * 24, topSpace + i * 24, 20, 20);
    }
  }
};
requestAnimationFrame(draw);

document.addEventListener("mousedown", (e) => {
  filledCells
    .get(Math.floor((e.clientY - topSpace) / 24))
    .set(
      Math.floor((e.clientX - sideSpace) / 24),
      !filledCells
        .get(Math.floor((e.clientY - topSpace) / 24))
        .get(Math.floor((e.clientX - sideSpace) / 24))
    );
});
document.addEventListener("keydown", (e) => {
  if (e.key === " ") start = !start;
});
