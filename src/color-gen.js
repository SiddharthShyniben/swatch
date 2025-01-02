import { colornames } from "color-name-list";
import convert from "color-convert";

export const getNamedColor = () => `rgb(${convert.hex.rgb(colornames[Math.floor(Math.random() * colornames.length)].hex.slice(1)).join(", ")})`
