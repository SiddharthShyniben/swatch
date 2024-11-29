import Color from "colorjs.io";
import Values from "values.js";
import { colornames } from "color-name-list";
import nearestColor from "nearest-color";
import convert from "color-convert";

import { getDimensions } from "./util.js";

const chars =
  ",# !$%&()-.0123456789?abcdefghijklmnopqrstuvwxyz²ßàáâäåçèéêëìíîïñòóöùúûüāēěğīıłńōőœšūżǎǐǔǜя’₂№ⅱ";
const colors = colornames.reduce(
  (o, { name, hex }) => Object.assign(o, { [name]: hex }),
  {},
);
const nearest = nearestColor.from(colors);
const customRGB = {
  format: {
    name: "rgb",
    coords: ["<number>[0, 255]", "<number>[0, 255]", "<number>[0, 255]"],
    commas: true,
  },
};

const formats = [
  (x) => x,
  (x) => "#" + convert.rgb.hex(x.slice(4, -1).split(", ").map(Number)),
  (x) =>
    "hsl(" +
    convert.rgb.hsl(x.slice(4, -1).split(", ").map(Number)).join(", ") +
    ")",
  (x) =>
    "hsv(" +
    convert.rgb.hsv(x.slice(4, -1).split(", ").map(Number)).join(", ") +
    ")",
  (x) =>
    "hwb(" +
    convert.rgb.hwb(x.slice(4, -1).split(", ").map(Number)).join(", ") +
    ")",
  (x) =>
    "cmyk(" +
    convert.rgb.cmyk(x.slice(4, -1).split(", ").map(Number)).join(", ") +
    ")",
  (x) =>
    "ansi(" + convert.rgb.ansi16(x.slice(4, -1).split(", ").map(Number)) + ")",
  (x) =>
    "ansi256(" +
    convert.rgb.ansi256(x.slice(4, -1).split(", ").map(Number)) +
    ")",
];

let i = 0;

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
        this.inSwatch = true;
        this.changing = true;
        this.colorName = this.color = "";
      }

      if (ch.toLowerCase() === "f") {
        this.format = formats[++i] ?? formats[(i = 0)];
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
        ]
      : [
          ["c", "change"],
          ["f", "switch format"],
          ["j", "go up the swatch"],
          ["k", "go down the swatch"],
        ];

    for (let i = 0; i < opts.length; i++)
      canvas
        .moveTo(xPad, yPad + (rows - 5) + 1 + i)
        .foreground("#ccfef2")
        .background("#000000")
        .write(opts[i][0])
        .moveTo(xPad + opts[i][0].length, yPad + (rows - 5) + 1 + i)
        .foreground("grey")
        .background("#000000")
        .write((opts[i][1] ? " - " : "") + opts[i][1].padEnd(30, " "));

    const outColor = this.format(this.color);

    canvas
      .moveTo(xPad + cols / 2 + 2, yPad)
      .background(this.changing ? "#1a1a1a" : "#000000")
      .foreground("white")
      .write(
        this.changing ? this.color.padEnd(20, " ") : outColor.padEnd(20, " "),
      );

    canvas
      .moveTo(xPad + cols / 2 + 2 + outColor.length, yPad)
      .background(this.changing ? "#1a1a1a" : "#000000")
      .foreground("yellow")
      .write(this.autocomplete.slice(outColor.length).padEnd(10, " "));

    canvas
      .moveTo(xPad + cols / 2 + 2, yPad + 1)
      .background("#000000")
      .foreground("white")
      .write(this.colorName.padEnd(20, " "));

    try {
      for (let i = 0; i < this.swatch.length; i++) {
        const rgb = this.swatch[i].rgbString();

        canvas
          .moveTo(xPad + cols / 2 + 2, yPad + 3 + i)
          .background(rgb)
          .write("    ")
          .moveTo(xPad + cols / 2 + 7, yPad + 3 + i)
          .foreground(i === this.swatchI ? "yellow" : "white")
          .background("#000000")
          .write(this.format(rgb).padEnd(20, " "));
      }
    } catch {
      this.swatch = [];
      for (let i = 0; i < 21; i++) {
        canvas.moveTo(xPad + cols / 2 + 2, yPad + 3 + i).write(" ".repeat(30));
      }
    }

    canvas
      .moveTo(xPad + cols / 2 + 2, yPad + 25)
      .background("white")
      .foreground(this.color)
      .write("               ")
      .moveBy(-15, 1)
      .write(" Contrast Test ")
      .background("black")
      .foreground("white")
      .write(
        " " +
          Math.abs(Color.contrast(this.color, "white", "apca").toFixed(2))
            .toString()
            .padEnd(10, " "),
      )
      .background("white")
      .moveTo(xPad + cols / 2 + 2, yPad + 27)
      .write("               ")
      .moveBy(-15, 1)
      .background("black")
      .foreground(this.color)
      .write("               ")
      .moveBy(-15, 1)
      .write(" Contrast Test ")
      .foreground("white")
      .write(
        " " +
          Math.abs(Color.contrast(this.color, "black", "apca").toFixed(2))
            .toString()
            .padEnd(10, " "),
      )
      .moveTo(xPad + cols / 2 + 2, yPad + 29);

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

    return this.changing ? "#1a1a1a" : "#000000";
  }

  assignColorName() {
    const rgb = new Color(str);
    const near = nearest(rgb.toString({ format: "hex" }));

    this.colorName = (near.distance === 0 ? "" : "~") + near.name;
  }
}
