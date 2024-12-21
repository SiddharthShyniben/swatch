import Color from "colorjs.io";
import Values from "values.js";
import { colornames } from "color-name-list";
import convert from "color-convert";

import {
  chars,
  themeColors,
  customRGB,
  getDimensions,
  getAround,

  nearest,
  nextFormat,
  contrastWith,
  getColorName,

  libraryMenu,
  selectMenu,
  mainMenu
} from "./util.js";

import { getLibrary, setLibrary } from "./library.js";
import randomColor from "randomcolor";

export class PickerScene {
  constructor() {
    const initialColor = colornames[Math.floor(Math.random() * colornames.length)]
    this.color = "rgb(" + convert.hex.rgb(initialColor.hex.slice(1)).join(", ") + ")";
    this.colorName = initialColor.name;
    this.autocomplete = "";

    this.library = getLibrary();
    this.libraryI = 0;

    this.swatch = new Values(this.color).all(10);
    this.swatchI = 10;

    this.format = (x) => x;
  }

  render(canvas) {
    const { width, height, rows, cols } = this.getSize();

    if (width < cols || height < rows)
      canvas.background("none").moveTo(0, 0).write("Screen too small!").flush();

    canvas.eraseScreen();

    this.drawColor(canvas);
    this.drawOpts(canvas);
    this.drawColorAndName(canvas);
    this.drawSwatch(canvas);
    this.drawContrast(canvas);
    this.drawLibrary(canvas);

    canvas.flush();
  }

  onKey(ch, key) {
    ch ??= '';
    key ??= {};

    if (this.focusLibrary) {
      if (ch === 'h') this.focusLibrary = false;
      if (ch === 'j') {
        this.libraryI++;
        if (this.libraryI >= this.library.length) this.libraryI = 0;
      }
      if (ch === 'k') {
        this.libraryI--;
        if (this.libraryI < 0) this.libraryI = this.library.length - 1;
      }

      if (this.library.length) {
        if (key.name === "return") {
          this.color = this.fixColor(this.library[this.libraryI]);
          this.focusLibrary = false;
        }

        if (key.name === "backspace") {
          this.library.splice(this.libraryI, 1);
          setLibrary(this.library)
          if (!this.library[this.libraryI]) this.libraryI--;
        }
      }
    } else if (this.changing) {
      if (key.name === "return") {
        this.color = this.fixColor(this.color);
        this.changing = false;
        this.autocomplete = "";
      }

      if (key.name === "backspace") this.color = this.color.slice(0, -1);
      if (key.name === "tab" && this.autocomplete) {
        this.color = this.colorName = this.autocomplete;
        this.autocomplete = "";
      }

      if (chars.includes(ch.toLowerCase())) {
        this.color += ch;
        this.autocomplete = colornames.find((color) => color.name.toLowerCase().startsWith(this.color.toLowerCase()))?.name || "";
      }
    } else {
      if (ch === "j") {
        this.swatchI++;
        if (this.swatchI > 20) this.swatchI = 0;
        this.inSwatch = true;
        this.color = this.fixColor(this.swatch[this.swatchI].rgbString());
      }

      if (ch === "k") {
        this.swatchI--;
        if (this.swatchI < 0) this.swatchI = 20;
        this.inSwatch = true;
        this.color = this.fixColor(this.swatch[this.swatchI].rgbString());
      }

      if (ch === "c") {
        this.swatchI = 10;
        this.inSwatch = false;
        this.changing = true;
        this.colorName = this.color = "";
      }

      if (ch === "l") this.focusLibrary = true;
      if (ch === "f") this.format = nextFormat();

      if (ch === '*') {
        if (this.library.includes(this.color))
          this.library.splice(this.library.indexOf(this.color), 1)
        else
          this.library.push(this.color);

        setLibrary(this.library)
      }

      if (key.name === "space") {
        const color = randomColor({ format: "rgb" });
        this.swatchI = 10;
        this.inSwatch = false;
        this.color = this.fixColor(color);
      }

      if (key.name === "return") {
        this.swatchI = 10;
        this.inSwatch = false;
        this.color = this.fixColor(this.color);
      }
    }
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
        .write((opts[i][1] ? " - " : "") + opts[i][1]);
  }

  drawColorAndName(canvas) {
    const { yPad, secondSegment } = this.getSize();

    const outColor = this.format(this.color);

    canvas
      .moveTo(secondSegment, yPad)
      .background(this.changing ? themeColors.changing : "none")
      .foreground("white")
      .write(this.changing ? this.color : outColor);

    canvas
      .moveTo(secondSegment + outColor.length, yPad)
      .background(this.changing ? themeColors.changing : "none")
      .foreground(themeColors.autocomplete)
      .write(this.autocomplete.slice(outColor.length));

    canvas
      .moveTo(secondSegment, yPad + 1)
      .background("none")
      .foreground("white")
      .write(this.colorName);
  }

  drawSwatch(canvas) {
    const { yPad, secondSegment } = this.getSize();

    if (this.changing) return;

    for (let i = 0; i < this.swatch.length; i++) {
      const rgb = this.swatch[i].rgbString();

      canvas
        .moveTo(secondSegment, yPad + 3 + i)
        .background(rgb)
        .write("    ")
        .moveTo(secondSegment + 5, yPad + 3 + i)
        .foreground(i === this.swatchI ? themeColors.autocomplete : "white")
        .background("none")
        .write(this.format(rgb));
    }
  }

  drawContrast(canvas) {
    const { yPad, secondSegment } = this.getSize();

    if (this.changing) return;

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
  }

  drawLibrary(canvas) {
    const { yPad, thirdSegment, segmentWidth, rows } = this.getSize();

    for (let i = 0; i < rows; i++)
      canvas
        .moveTo(thirdSegment, yPad + i)
        .background(this.focusLibrary ? themeColors.changing : "none")
        .write(" ".repeat(segmentWidth))

    canvas
      .moveTo(thirdSegment, yPad)
      .foreground("white")
      .write("Library:")

    if (this.library.length === 0)
      canvas.foreground(themeColors.dim).write(" Empty.")

    const [offset, toDisplay] = getAround(this.library, 13, this.libraryI)
    for (const [i, color] of Object.entries(toDisplay)) {
      const name = getColorName(color);

      canvas
        .moveTo(thirdSegment, yPad + 2 + 3 * i)
        .background(color)
        .write(" ".repeat(segmentWidth));

      canvas
        .moveTo(thirdSegment, yPad + 2 + 3 * i + 1)
        .background("none")
        .foreground(this.focusLibrary && +i + offset === this.libraryI ? themeColors.autocomplete : "none")
        .write(`${name}`);
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

  getOpts() {
    return this.focusLibrary
      ? libraryMenu
      : this.changing
        ? selectMenu
        : mainMenu;
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

}
