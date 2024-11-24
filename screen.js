import { Canvas } from "terminal-canvas";

export class Screen {
  constructor(scenes = []) {
    this.canvas = new Canvas().saveScreen().erase();
    this.scenes = scenes;
    this.chosen = 0;
  }

  render() {
    this.scenes[this.chosen]?.render(this.canvas);
  }

  close() {
    this.canvas.restoreScreen();
  }
}

export class MenuScene {
  constructor() {}
  render(canvas) {
    canvas.erase().moveTo(0, 0).write("Hello, world!").flush();
  }
}
