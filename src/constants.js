import { colornames } from "color-name-list";
import convert from "color-convert";

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

export const chars =
  ",# !$%&()-.0123456789?abcdefghijklmnopqrstuvwxyz²ßàáâäåçèéêëìíîïñòóöùúûüāēěğīıłńōőœšūżǎǐǔǜя’₂№ⅱ";

export const themeColors = {
  autocomplete: "#ffca00",
  info: "#ccfef2",
  dim: "grey",
  changing: "#1a1a1a",
};

export const colors = colornames.reduce(
  (o, { name, hex }) => Object.assign(o, { [name]: hex }),
  {},
);

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

export const customRGB = {
  format: {
    name: "rgb",
    coords: ["<number>[0, 255]", "<number>[0, 255]", "<number>[0, 255]"],
    commas: true,
  },
};

export const libraryMenu = [
  ["h/j/k/l", "navigate"],
  ["return", "select"],
  ["esc", "back to main menu"],
  ["h", "unfocus library"],
  ["backspace", "remove from library"],
  ["", ""],
  ["", ""],
]

export const selectMenu = [
  ["tab", "autocomplete"],
  ["return", "select"],
  ["esc", "cancel"],
  ["", ""],
  ["", ""],
  ["", ""],
  ["", ""],
]

export const mainMenu = [
  ["h/j/k/l", "navigate"],
  ["return", "select"],
  ["esc", "back to main menu"],
  ["space", "generate!"],
  ["c", "choose"],
  ["f", "switch format"],
  ["*", "add to/remove from library"],
]
