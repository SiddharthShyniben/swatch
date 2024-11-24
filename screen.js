import { Canvas } from "terminal-canvas";

import { getDimensions, logoColors } from "./util.js";

export class Screen {
  constructor(scenes = []) {
    this.canvas = new Canvas().saveScreen().eraseScreen().hideCursor();
    this.scenes = scenes;
    this.chosen = 0;
    this.listenToResize();
  }

  listenToResize() {
    process.stdout.on("resize", () => {
      this.render();
    });
  }

  render() {
    this.scenes[this.chosen]?.render(this.canvas);
  }

  close() {
    this.canvas.restoreScreen().showCursor();
  }
}

export class MenuScene {
  constructor(menuItems = {}) {
    this.menuItems = menuItems;
    this.state = { chosen: 0 };
  }

  render(canvas) {
    this.canvas = canvas;
    const { width, height } = getDimensions();

    const items = Object.keys(this.menuItems);
    const longest = Math.max(...items.map((item) => item.length));

    const cols = longest;
    const rows = items.length + 4;
    const xPad = ~~((width - cols) / 2);
    const yPad = ~~((height - rows) / 2);

    this.eraseCanvas();
    if (longest > width)
      canvas
        .background("black")
        .moveTo(0, 0)
        .write("Screen too small!")
        .flush();

    const padding = Math.max(~~((longest - logoColors.length) / 2), 0);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < logoColors.length; j++)
        canvas
          .moveTo(xPad + padding + j, yPad + i)
          .background(logoColors[j])
          .write(" ");

    for (let i = 0; i < items.length; i++) {
      canvas
        .moveTo(xPad, yPad + 4 + i)
        .background("black")
        .foreground(i == this.state.chosen ? "white" : "grey")
        .write(items[i]);
    }

    canvas.flush();
  }

  eraseCanvas() {
    const { width, height } = getDimensions();
    for (let x = 0; x < width; x++)
      for (let y = 0; y < height; y++)
        this.canvas.moveTo(x, y).background("black").write(" ");
    this.canvas.flush();
  }
}
