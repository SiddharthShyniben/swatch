import Color from "colorjs.io";

import { getNamedColor } from "./color-gen.js";
import {
  getDimensions,
  nearest,
  contrastWith,
  nextFormat
} from "./util.js";

import { chars, customRGB, themeColors } from "./constants.js"
import { colornames } from "color-name-list";

export class GeneratorScene {
  constructor() {
    this.colors = [
      getNamedColor(),
      getNamedColor(),
      getNamedColor(),
      getNamedColor(),
      getNamedColor(),
    ];

    this.colorNames = [];
    this.populateColorNames()

    this.locks = [false, false, false, false, false];
    this.focusedColor = 0;

    this.format = s => s;
  }

  render(canvas) {
    if (this.gotoMenu) {
      this.gotoMenu = false;
      throw 0;
    }

    const { xPad, yPad, segmentHeight, segmentWidth } = this.getSize();

    for (let i = 0; i < this.colors.length; i++) {
      const color = this.colors[i];
      const name = this.colorNames[i];

      const currentChanging = this.changing && i == this.focusedColor;
      const background = currentChanging ? (this.fixColor(color) || themeColors.changing) : color;
      canvas.background(background)

      for (let y = yPad + 1; y < yPad + segmentHeight; y++) {
        canvas
          .moveTo(xPad + i * segmentWidth, y)
          .write(" ".repeat(segmentWidth))
      }

      let off = 0;
      for (const text of [name, currentChanging ? color : this.format(color), this.locks[i] ? "✓" : 0].filter(x => x !== 0)) {
        const blackContrast = contrastWith(background, "black");
        const whiteContrast = contrastWith(background, "white");
        const fg = blackContrast > whiteContrast ? "black" : "white";

        const textPad = ~~((segmentWidth - text.length) / 2);
        canvas
          .moveTo(xPad + i * segmentWidth + textPad, yPad + segmentHeight - 2 - off)
          .foreground(fg)
          .write(text)
        off++;
      }

      if (i === this.focusedColor)
        canvas.background(themeColors.autocomplete)
      else
        canvas.background(themeColors.changing)

      canvas
        .moveTo(xPad + i * segmentWidth, yPad)
        .write(" ".repeat(segmentWidth))
    }

    canvas.flush();
  }

  onKey(ch, key) {
    key ??= {}
    ch ??= '';

    if (this.changing) {
      if (key.name === "escape") {
        this.colors[this.focusedColor] = this.lastColor;
        this.changing = false;
      }

      if (key.name === "return") {
        this.colors[this.focusedColor] = this.fixColor(this.colors[this.focusedColor]);
        this.populateColorNames();
        this.changing = false;
      }

      if (key.name === "backspace") this.colors[this.focusedColor] = this.colors[this.focusedColor].slice(0, -1);
      if (chars.includes(ch.toLowerCase())) this.colors[this.focusedColor] += ch;
    } else {
      if (key.name === "escape")
        this.gotoMenu = true;

      if (ch === "f") this.format = nextFormat();
      if (ch === "h") {
        this.focusedColor--;
        if (this.focusedColor < 0) this.focusedColor = this.colors.length - 1;
      }
      if (ch === "l") {
        this.focusedColor++;
        if (this.focusedColor > this.colors.length - 1) this.focusedColor = 0;
      }

      if (ch === ".") this.locks[this.focusedColor] = !this.locks[this.focusedColor];

      if (ch === "c") {
        this.lastColor = this.colors[this.focusedColor];
        this.colors[this.focusedColor] = "";
        this.colorNames[this.focusedColor] = "";
        this.changing = true;
      }

      if (key.name === "space") {
        this.regenerateColors();
        this.populateColorNames()
      }
    }
  }

  regenerateColors() {
    for (let i = 0; i < this.colors.length; i++) {
      if (!this.locks[i])
        this.colors[i] = getNamedColor();
    }
  }

  populateColorNames() {
    try {
      this.colorNames = this.colors.map(str => {
        const rgb = new Color(str);
        const near = nearest(rgb.toString({ format: "hex" }));

        return (near.distance === 0 ? "" : "~") + near.name;
      })
    } catch { }
    return ""
  }

  getSize() {
    const { width, height } = getDimensions();

    const xPad = 5;
    const yPad = 5;

    const cols = width - 2 * xPad;
    const rows = height - 2 * yPad;

    const segmentWidth = Math.floor(cols / this.colors.length)

    const infoHeight = 3;
    const segmentHeight = rows - infoHeight;

    return { xPad, yPad, cols, rows, segmentWidth, segmentHeight }
  }

  fixColor(str) {
    str = str.trim();

    const named = colornames.find(
      (color) => color.name.toLowerCase() === str.toLowerCase(),
    );

    if (named)
      return new Color(named.hex).toString(customRGB);

    try {
      const rgb = new Color(str);
      if (rgb.alpha != 1) return;
      return rgb.toString(customRGB);
    } catch { }
  }
}
