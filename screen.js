import { Canvas } from "terminal-canvas";

import { getDimensions } from "./util.js";

export class Screen {
  constructor(scenes = []) {
    this.canvas = new Canvas().saveScreen().eraseScreen().hideCursor();
    this.scenes = scenes;
    this.chosen = 0;
    this.listenToResize();
    this.eraseCanvas();
  }

  listenToResize() {
    process.stdout.on("resize", () => {
      this.render();
    });
  }

  onKey(ch, key) {
    this.scenes[this.chosen]?.onKey?.(ch, key);
    this.render();
  }

  render() {
    try {
      this.scenes[this.chosen]?.render(this.canvas);
    } catch (e) {
      this.chosen = e;
      this.transition();
      this.render();
    }
  }

  close() {
    this.canvas.restoreScreen().showCursor();
  }

  transition() {
    this.eraseCanvas("#1a1a1a");
    this.eraseCanvas();
  }

  eraseCanvas(color = "black") {
    const { width, height } = getDimensions();
    for (let x = 0; x < width; x++)
      for (let y = 0; y < height; y++)
        this.canvas.moveTo(x, y).background(color).write(" ");
    this.canvas.flush();
  }
}
