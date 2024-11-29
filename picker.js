import Color from "colorjs.io";
import Values from "values.js";
import { colornames } from "color-name-list";

import {
  chars,
  nearest,
  customRGB,
  getDimensions,
  nextFormat,
  themeColors,
  contrastWith,
} from "./util.js";

export class PickerScene {
  constructor() {
    this.color = "rgb(37, 99, 235)";
    this.colorName = "";
    this.autocomplete = "";
    this.swatch = new Values(this.color).all(10);
    this.swatchI = 10;
    this.format = (x) => x;
  }

  onKey(ch, key) {
    if (this.changing) {
      if (key) {
        if (key.name === "return") {
          this.color = this.fixColor(this.color);
          this.changing = false;
        }

        if (key.name === "backspace") this.color = this.color.slice(0, -1);
        if (key.name === "tab" && this.autocomplete)
          this.color = this.colorName = this.autocomplete;
      }

      if (ch && chars.includes(ch.toLowerCase())) {
        this.color += ch;
      }

      this.autocomplete =
        colornames.find((color) =>
          color.name.toLowerCase().startsWith(this.color.toLowerCase()),
        )?.name || "";
    } else if (ch) {
      if (ch.toLowerCase() === "j") {
        this.swatchI++;
        if (this.swatchI > 20) this.swatchI = 0;
        this.inSwatch = true;
        this.color = this.fixColor(this.swatch[this.swatchI].rgbString());
      }

      if (ch.toLowerCase() === "k") {
        this.swatchI--;
        if (this.swatchI < 0) this.swatchI = 20;
        this.inSwatch = true;
        this.color = this.fixColor(this.swatch[this.swatchI].rgbString());
      }

      if (ch.toLowerCase() === "c") {
        this.swatchI = 10;
        this.inSwatch = false;
        this.changing = true;
        this.colorName = this.color = "";
      }

      if (key.name === "return") {
        this.swatchI = 10;
        this.inSwatch = false;
        this.color = this.fixColor(this.color);
      }

      if (ch.toLowerCase() === "f") {
        this.format = nextFormat();
      }
    }
  }

  render(canvas) {
    const { width, height } = getDimensions();

    const cols = 100;
    const rows = 40;
    const xPad = ~~((width - cols) / 2);
    const yPad = ~~((height - rows) / 2);

    if (width < cols)
      canvas
        .background("black")
        .moveTo(0, 0)
        .write("Screen too small!")
        .flush();

    for (let i = 0; i < rows - 5; i++)
      canvas
        .moveTo(xPad, yPad + i)
        .background(this.fixColor(this.color))
        .write(" ".repeat(cols / 2));

    const opts = this.changing
      ? [
          ["return", "select"],
          ["tab", "autocomplete"],
          ["", ""],
          ["", ""],
          ["", ""],
        ]
      : [
          ["return", "select"],
          ["c", "change"],
          ["f", "switch format"],
          ["j", "go up the swatch"],
          ["k", "go down the swatch"],
        ];

    for (let i = 0; i < opts.length; i++)
      canvas
        .moveTo(xPad, yPad + (rows - 5) + 1 + i)
        .foreground(themeColors.info)
        .background("black")
        .write(opts[i][0])
        .moveTo(xPad + opts[i][0].length, yPad + (rows - 5) + 1 + i)
        .foreground(themeColors.dim)
        .write((opts[i][1] ? " - " : "") + opts[i][1].padEnd(30, " "));

    const outColor = this.format(this.color);

    canvas
      .moveTo(xPad + cols / 2 + 2, yPad)
      .background(this.changing ? themeColors.changing : "black")
      .foreground("white")
      .write(
        this.changing ? this.color.padEnd(20, " ") : outColor.padEnd(20, " "),
      );

    canvas
      .moveTo(xPad + cols / 2 + 2 + outColor.length, yPad)
      .background(this.changing ? themeColors.changing : "black")
      .foreground(themeColors.autocomplete)
      .write(this.autocomplete.slice(outColor.length).padEnd(20, " "));

    canvas
      .moveTo(xPad + cols / 2 + 2, yPad + 1)
      .background("black")
      .foreground("white")
      .write(this.colorName.padEnd(20, " "));

    try {
      if (this.changing) throw 1;
      for (let i = 0; i < this.swatch.length; i++) {
        const rgb = this.swatch[i].rgbString();

        canvas
          .moveTo(xPad + cols / 2 + 2, yPad + 3 + i)
          .background(rgb)
          .write("    ")
          .moveTo(xPad + cols / 2 + 7, yPad + 3 + i)
          .foreground(i === this.swatchI ? themeColors.autocomplete : "white")
          .background("black")
          .write(this.format(rgb).padEnd(20, " "));
      }
    } catch {
      this.swatch = [];
      for (let i = 0; i < 21; i++) {
        canvas.moveTo(xPad + cols / 2 + 2, yPad + 3 + i).write(" ".repeat(30));
      }
    }

    try {
      if (this.changing) throw 1;
      canvas
        .moveTo(xPad + cols / 2 + 2, yPad + 25)
        .background("white")
        .foreground(this.color)
        .write("               ")
        .moveBy(-15, 1)
        .write(" Contrast test ")
        .background("black")
        .foreground("white")
        .write(" " + contrastWith(this.color, "white"))
        .background("white")
        .moveTo(xPad + cols / 2 + 2, yPad + 27)
        .write("               ")
        .moveBy(-15, 1)
        .background("black")
        .foreground(this.color)
        .write("               ")
        .moveBy(-15, 1)
        .write(" Contrast test ")
        .foreground("white")
        .write(" " + contrastWith(this.color, "black"))
        .moveTo(xPad + cols / 2 + 2, yPad + 29);
    } catch {
      for (let i = 0; i < 6; i++)
        canvas
          .moveTo(xPad + cols / 2 + 2, yPad + 25 + i)
          .background("black")
          .write(" ".repeat(35));
    }

    canvas.flush();
  }

  fixColor(str) {
    str = str.trim();

    const named = colornames.find(
      (color) => color.name.toLowerCase() === str.toLowerCase(),
    );

    if (named) {
      this.colorName = named.name;
      if (!this.inSwatch) this.swatch = new Values(named.hex).all(10);
      return new Color(named.hex).toString(customRGB);
    }

    try {
      const rgb = new Color(str);
      const near = nearest(rgb.toString({ format: "hex" }));

      if (!this.inSwatch)
        this.swatch = new Values(rgb.toString(customRGB)).all(10);
      this.colorName = (near.distance === 0 ? "" : "~") + near.name;

      return rgb.toString(customRGB);
    } catch {}

    return this.changing ? "#1a1a1a" : "black";
  }

  assignColorName() {
    const rgb = new Color(str);
    const near = nearest(rgb.toString({ format: "hex" }));

    this.colorName = (near.distance === 0 ? "" : "~") + near.name;
  }
}
