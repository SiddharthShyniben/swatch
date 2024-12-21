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
  getColorName,
} from "./util.js";
import { getLibrary, setLibrary } from "./library.js";

export class PickerScene {
  constructor() {
    this.color = "rgb(17, 35, 88)";
    this.library = getLibrary();
    this.libraryI = 0;
    this.colorName = "";
    this.autocomplete = "";
    this.swatch = new Values(this.color).all(10);
    this.swatchI = 10;
    this.format = (x) => x;
  }

  onKey(ch, key) {
    if (this.focusLibrary) {
      if (ch) {
        if (ch.toLowerCase() === 'h') this.focusLibrary = false;

        if (ch.toLowerCase() === 'j') {
          this.libraryI++;
          if (this.libraryI >= this.library.length) this.libraryI = 0;
        }
        if (ch.toLowerCase() === 'k') {
          this.libraryI--;
          if (this.libraryI < 0) this.libraryI = this.library.length - 1;
        }
      }

      if (key) {
        if (key.name === "return" && this.library.length) {
          this.color = this.fixColor(this.library[this.libraryI]);
          this.focusLibrary = false;
          this.libraryI = 0;
        }

        if (key.name === "backspace" && this.library.length) {
          this.library.splice(this.libraryI, 1);
          setLibrary(this.library)
          if (!this.library[this.libraryI]) this.libraryI--;
        }
      }
    } else if (this.changing) {
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

        this.autocomplete =
          colornames.find((color) =>
            color.name.toLowerCase().startsWith(this.color.toLowerCase()),
          )?.name || "";
      }
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

      if (ch.toLowerCase() === "l") {
        this.focusLibrary = true;
      }

      if (ch.toLowerCase() === "c") {
        this.swatchI = 10;
        this.inSwatch = false;
        this.changing = true;
        this.colorName = this.color = "";
      }

      if (key && key.name === "return") {
        this.swatchI = 10;
        this.inSwatch = false;
        this.color = this.fixColor(this.color);
      }

      if (ch.toLowerCase() === "f") {
        this.format = nextFormat();
      }

      if (ch === "b") {
        this.menu = true;
      }

      if (ch === '*') {
        if (this.library.includes(this.color))
          this.library.splice(this.library.indexOf(this.color), 1)
        else
          this.library.push(this.color);

        setLibrary(this.library)
      }
    }
  }

  getSize() {
    const { width, height } = getDimensions();

    const cols = 103; // 33 + 2 + 33 + 2 + 33
    const rows = 40;
    const xPad = ~~((width - cols) / 2);
    const yPad = ~~((height - rows) / 2);

    const segmentWidth = 33;
    const maxOpts = 7;
    const firstSegment = xPad;
    const secondSegment = xPad + segmentWidth + 2;
    const thirdSegment = xPad + 2 * segmentWidth + 4;

    return {
      width,
      height,
      cols,
      rows,
      xPad,
      yPad,
      segmentWidth,
      firstSegment,
      secondSegment,
      thirdSegment,
      maxOpts,
    };
  }

  render(canvas) {
    if (this.menu) {
      this.menu = false;
      throw 0;
    }

    const { width, cols } = this.getSize();

    if (width < cols)
      canvas.background("none").moveTo(0, 0).write("Screen too small!").flush();

    this.drawColor(canvas);
    this.drawOpts(canvas);
    this.drawColorAndName(canvas);
    this.drawSwatch(canvas);
    this.drawContrast(canvas);
    this.drawLibrary(canvas);

    canvas.flush();
  }

  drawColor(canvas) {
    const { rows, yPad, firstSegment, segmentWidth, maxOpts } = this.getSize();

    for (let i = 0; i < rows - maxOpts; i++)
      canvas
        .moveTo(firstSegment, yPad + i)
        .background(this.fixColor(this.color))
        .write(" ".repeat(segmentWidth));
  }

  drawOpts(canvas) {
    const { rows, firstSegment, yPad, maxOpts } = this.getSize();
    const opts = this.getOpts();

    for (let i = 0; i < opts.length; i++)
      canvas
        .moveTo(firstSegment, yPad + (rows - maxOpts) + 1 + i)
        .foreground(themeColors.info)
        .background("none")
        .write(opts[i][0])
        .moveTo(
          firstSegment + opts[i][0].length,
          yPad + (rows - maxOpts) + 1 + i,
        )
        .foreground(themeColors.dim)
        .write((opts[i][1] ? " - " : "") + opts[i][1].padEnd(30, " "));
  }

  drawColorAndName(canvas) {
    const { yPad, secondSegment } = this.getSize();

    const outColor = this.format(this.color);

    canvas
      .moveTo(secondSegment, yPad)
      .background(this.changing ? themeColors.changing : "none")
      .foreground("white")
      .write(
        this.changing ? this.color.padEnd(20, " ") : outColor.padEnd(20, " "),
      );

    canvas
      .moveTo(secondSegment + outColor.length, yPad)
      .background(this.changing ? themeColors.changing : "none")
      .foreground(themeColors.autocomplete)
      .write(this.autocomplete.slice(outColor.length).padEnd(20, " "));

    canvas
      .moveTo(secondSegment, yPad + 1)
      .background("none")
      .foreground("white")
      .write(this.colorName.padEnd(20, " "));
  }

  drawSwatch(canvas) {
    const { yPad, secondSegment } = this.getSize();

    try {
      if (this.changing) throw 1;
      for (let i = 0; i < this.swatch.length; i++) {
        const rgb = this.swatch[i].rgbString();

        canvas
          .moveTo(secondSegment, yPad + 3 + i)
          .background(rgb)
          .write("    ")
          .moveTo(secondSegment + 5, yPad + 3 + i)
          .foreground(i === this.swatchI ? themeColors.autocomplete : "white")
          .background("none")
          .write(this.format(rgb).padEnd(20, " "));
      }
    } catch {
      this.swatch = [];
      for (let i = 0; i < 21; i++) {
        canvas.moveTo(secondSegment, yPad + 3 + i).write(" ".repeat(30));
      }
    }
  }

  drawContrast(canvas) {
    const { yPad, secondSegment } = this.getSize();

    try {
      if (this.changing) throw 1;
      canvas
        .moveTo(secondSegment, yPad + 25)
        .background("white")
        .foreground(this.color)
        .write("               ")
        .moveBy(-15, 1)
        .write(" Contrast test ")
        .background("none")
        .foreground("white")
        .write(" " + contrastWith(this.color, "white"))
        .background("white")
        .moveTo(secondSegment, yPad + 27)
        .write("               ")
        .moveBy(-15, 1)
        .background("black")
        .foreground(this.color)
        .write("               ")
        .moveBy(-15, 1)
        .write(" Contrast test ")
        .foreground("white")
        .background("none")
        .write(" " + contrastWith(this.color, "black"))
        .moveTo(secondSegment, yPad + 30)
        .background("black")
        .write("               ");
    } catch {
      for (let i = 0; i < 6; i++)
        canvas
          .moveTo(secondSegment, yPad + 25 + i)
          .background("none")
          .write(" ".repeat(35));
    }
  }

  drawLibrary(canvas) {
    const { yPad, thirdSegment, segmentWidth, rows } = this.getSize();

    for (let i = 0; i < rows; i++)
      canvas.moveTo(thirdSegment, yPad + i).background(this.focusLibrary ? themeColors.changing : "none").write(" ".repeat(segmentWidth))

    canvas
      .moveTo(thirdSegment, yPad)
      .foreground("white")
      .write("Library:")

    if (this.library.length === 0) {
      canvas.foreground(themeColors.dim).write(" Empty.")
    }


    for (const [i, color] of Object.entries(this.library)) {
      const name = getColorName(color);

      canvas
        .moveTo(thirdSegment, yPad + 2 + 3 * i)
        .background(color)
        .write(" ".repeat(segmentWidth));

      canvas
        .moveTo(thirdSegment, yPad + 2 + 3 * i + 1)
        .background("none")
        .foreground(this.focusLibrary && +i === this.libraryI ? themeColors.autocomplete : "none")
        .write(`${name}`.padEnd(segmentWidth, " "));
    }
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
    } catch { }

    return this.changing ? "#1a1a1a" : "none";
  }

  assignColorName() {
    const rgb = new Color(str);
    const near = nearest(rgb.toString({ format: "hex" }));

    this.colorName = (near.distance === 0 ? "" : "~") + near.name;
  }

  getOpts() {
    return this.focusLibrary
      ? [
        ["j/k", "go up/down"],
        ["return", "select"],
        ["h", "unfocus library"],
        ["backspace", "remove from library"],
        ["", ""],
        ["", ""],
        ["", ""],
      ]
      : this.changing
        ? [
          ["tab", "autocomplete"],
          ["return", "select"],
          ["", ""],
          ["", ""],
          ["", ""],
          ["", ""],
          ["", ""],
        ]
        : [
          ["j/k", "go up/down"],
          ["return", "select"],
          ["c", "change"],
          ["f", "switch format"],
          ["b", "back to menu"],
          ["*", "add to/remove from library"],
          ["l", "focus library"]
        ];
  }
}
