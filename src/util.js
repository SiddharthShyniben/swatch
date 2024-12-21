import nearestColor from "nearest-color";
import Color from "colorjs.io";

import { colors, formats } from "./constants.js";

export * from "./constants.js";

export const getDimensions = () => ({
  width: process.stdout.columns,
  height: process.stdout.rows,
});
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const nearest = nearestColor.from(colors);

let i = 0;
export const nextFormat = () => formats[++i] ?? formats[(i = 0)];

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
