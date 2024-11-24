import { getDimensions, logoColors } from "./util.js";

export class MenuScene {
  constructor(menuItems = {}) {
    this.menuItems = menuItems;
    this.menuKeys = Object.keys(menuItems);
    this.menuCount = this.menuKeys.length;
    this.state = { chosen: 0 };
  }

  onKey(ch, key) {
    if (key) {
      if (key.name === "up") {
        this.state.chosen--;
        if (this.state.chosen < 0) this.state.chosen = this.menuCount - 1;
      }

      if (key.name === "down") {
        this.state.chosen++;
        if (this.state.chosen > this.menuCount - 1) this.state.chosen = 0;
      }

      if (key.name === "return") {
        this.scheduledChange = true;
      }
    }

    const index = this.menuKeys.findIndex(
      (k) => k[0].toLowerCase() == ch.toLowerCase(),
    );

    if (index >= 0) this.state.chosen = index;
    else if (!isNaN(+ch) && +ch < this.menuCount + 1 && +ch > 0)
      this.state.chosen = ch - 1;
  }

  render(canvas) {
    if (this.scheduledChange) {
      throw this.state.chosen + 1;
    }

    this.canvas = canvas;
    const { width, height } = getDimensions();

    const longest = Math.max(...this.menuKeys.map((item) => item.length));

    const cols = longest;
    const rows = this.menuKeys.length + 4;
    const xPad = ~~((width - cols) / 2);
    const yPad = ~~((height - rows) / 2);

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

    for (let i = 0; i < this.menuKeys.length; i++) {
      canvas
        .moveTo(xPad, yPad + 4 + i)
        .background("black")
        .foreground(i == this.state.chosen ? "white" : "grey")
        .write(this.menuKeys[i]);
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
