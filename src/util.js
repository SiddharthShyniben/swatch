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

export const getAround = (arr, surround, index) => {
  if (index < Math.ceil(surround / 2)) return [0, arr.slice(0, surround)];
  if (index > arr.length - 1 - Math.floor(surround / 2)) return [arr.length - surround, arr.slice(-surround)];
  return [index - Math.ceil(surround / 2), arr.slice(index - Math.ceil(surround / 2), index + Math.floor(surround / 2))]
}

export const cloneColor = (color, obj) => {
  const c = new Color(color);
  for (const k in obj)
    c.lch[k] = obj[k]
  return c;
}

export const trunc = (text, length) => {
  if (text.length > length) return text.slice(0, length - 1) + "…";
  return text;
}
