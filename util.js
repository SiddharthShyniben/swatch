import nearestColor from "nearest-color";
import convert from "color-convert";
import { colornames } from "color-name-list";
import Color from "colorjs.io";

export const getDimensions = () => ({
  width: process.stdout.columns,
  height: process.stdout.rows,
});

export const logoColors = [
  "#4CFAD0",
  "#59FBD5",
  "#66FBD8",
  "#72FBDB",
  "#7FFCDF",
  "#8CFCE2",
  "#99FCE5",
  "#A5FDE8",
  "#B2FDEC",
  "#BFFDEF",
  "#CCFEF2",
  "#D9FEF5",
  "#E5FEF9",
  "#F2FFFC",
  "#FFFFFF",
];

export const themeColors = {
  autocomplete: "yellow",
  info: "#ccfef2",
  dim: "grey",
  changing: "#1a1a1a",
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const chars =
  ",# !$%&()-.0123456789?abcdefghijklmnopqrstuvwxyz²ßàáâäåçèéêëìíîïñòóöùúûüāēěğīıłńōőœšūżǎǐǔǜя’₂№ⅱ";
export const colors = colornames.reduce(
  (o, { name, hex }) => Object.assign(o, { [name]: hex }),
  {},
);
export const nearest = nearestColor.from(colors);
export const customRGB = {
  format: {
    name: "rgb",
    coords: ["<number>[0, 255]", "<number>[0, 255]", "<number>[0, 255]"],
    commas: true,
  },
};

const makeFormat = (t) => (x) =>
  `${t}(${convert.rgb[t](x.slice(4, -1).split(", ").map(Number)).join(", ")})`;
export const formats = [
  (x) => x,
  (x) => "#" + convert.rgb.hex(x.slice(4, -1).split(", ").map(Number)),
  makeFormat("hsl"),
  makeFormat("hsv"),
  makeFormat("hwb"),
  makeFormat("cmyk"),
  (x) =>
    "ansi(" + convert.rgb.ansi16(x.slice(4, -1).split(", ").map(Number)) + ")",
  (x) =>
    "ansi256(" +
    convert.rgb.ansi256(x.slice(4, -1).split(", ").map(Number)) +
    ")",
];

let i = 0;
export const nextFormat = () => {
  return formats[++i] ?? formats[(i = 0)];
};

export const contrastWith = (a, b) =>
  Math.abs(Color.contrast(a, b, "apca").toFixed(2))
    .toString()
    .padEnd(10, " ");

export const getColorName = (color) => {
  try {
    const rgb = new Color(color);
    const near = nearest(rgb.toString({ format: "hex" }));
    return near.name;
  } catch { }
};
