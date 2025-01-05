import { colornames } from "color-name-list";
import convert from "color-convert";
import Color from "colorjs.io";
import randomColor from "randomcolor";
import {
  generateComplementaryPalette,
  generateSplitComplementaryPalette,
  generateTriadicPalette,
  generateTetradicPalette,
  generateAnalogousPalette,
  generateShadesPalette,
  generateTintsPalette
} from "color-palette-creator"

import { customRGB } from "./constants.js";

export const getNamedColor = () => `rgb(${convert.hex.rgb(colornames[Math.floor(Math.random() * colornames.length)].hex.slice(1)).join(", ")})`

export function generateInterpolatedColors(baseColors, m, randomness = 0.2) {
  m -= 1; // ??

  if (baseColors.length < 2) {
    baseColors.push(Math.random() > 0.5 ? "black" : "white")
  }

  const colors = baseColors.map(color => new Color(color));

  const interpolatedColors = [];
  const stepsBetweenBase = m / (baseColors.length - 1);

  for (let i = 0; i < colors.length - 1; i++) {
    const startColor = colors[i];
    const endColor = colors[i + 1];

    for (let step = 0; step <= stepsBetweenBase; step++) {
      let t = step / stepsBetweenBase;

      t += (Math.random() - 0.5) * randomness;
      t = Math.max(0, Math.min(1, t));

      const interpolatedColor = startColor.range(endColor, { space: "lab", outputSpace: "srgb" })(t);
      interpolatedColors.push(interpolatedColor.toString(customRGB));
    }
  }

  return Array.from(new Set(interpolatedColors)).filter(c => !baseColors.includes(c));
}

export function generateHarmonicColors(baseColors, m, harmony = "triadic", randomness = 10) {
  if (baseColors.length === 0) {
    throw new Error("At least one base color is required.");
  }

  if (!["complementary", "triadic", "analogous", "tetradic", "split-complementary", "square"].includes(harmony)) {
    throw new Error(
      "Invalid harmony type. Use 'complementary', 'triadic', 'analogous', 'tetradic', 'split-complementary', or 'square'."
    );
  }

  if (randomness < 0 || randomness > 30) {
    throw new Error("Randomness must be a value between 0 and 30.");
  }

  const resultColors = [];

  const harmonicSteps = {
    complementary: [180],
    triadic: [120, 240],
    analogous: [30, -30],
    tetradic: [90, 180, 270],
    "split-complementary": [150, 210],
    square: [90, 180, 270],
  };

  const steps = harmonicSteps[harmony];
  const stepCount = steps.length;

  for (let i = baseColors.length; i < m; i++) {
    const baseColor = new Color(baseColors[i % baseColors.length]);
    const baseHue = baseColor.hsl.h;
    const step = steps[i % stepCount];

    const randomShift = (Math.random() - 0.5) * 2 * randomness;
    const newHue = (baseHue + step + randomShift + 360) % 360;

    const newColor = baseColor.clone();
    newColor.hsl.h = newHue;
    resultColors.push(newColor.toString(customRGB));
  }

  return resultColors;
}

export function generateRandomColors(baseColors, m) {
  let colors = [];

  for (let i = baseColors.length; i < m; i++)
    colors.push(new Color(randomColor()).toString(customRGB))

  return colors;
}

export function generateNamedColors(baseColors, m) {
  let colors = [];

  for (let i = baseColors.length; i < m; i++)
    colors.push(getNamedColor())

  return colors;
}

export function generateRandomPalette(baseColors, m) {
  const count = m - baseColors.length;
  const fns = [
    // broken for some reason
    // generateMonochromaticPalette, 
    generateShadesPalette,
    generateTintsPalette
  ];

  if (count === 2) fns.push(generateComplementaryPalette)
  if (count === 3) fns.push(generateTriadicPalette, generateAnalogousPalette, generateSplitComplementaryPalette)
  if (count === 4) fns.push(generateTetradicPalette)

  return fns[Math.floor(Math.random() * fns.length)]({ format: 'hex', count })
}

export function generateTheme(baseColors, m) {
  const functions = [
    () => generateHarmonicColors(baseColors, m, "complementary"),
    () => generateHarmonicColors(baseColors, m, "triadic"),
    () => generateHarmonicColors(baseColors, m, "analogous"),
    () => generateHarmonicColors(baseColors, m, "tetradic"),
    () => generateHarmonicColors(baseColors, m, "split-complementary"),
    () => generateHarmonicColors(baseColors, m, "square"),
    () => generateInterpolatedColors(baseColors, m),
    () => generateRandomColors(baseColors, m),
    () => generateNamedColors(baseColors, m),
    () => generateRandomPalette(baseColors, m)
  ]

  return functions[Math.floor(Math.random() * functions.length)]()
}

export function generateInitialTheme(count) {
  const functions = [
    () => generateRandomColors([], count),
    () => generateRandomPalette([], count),
    () => generateNamedColors([], count)
  ];

  return functions[Math.floor(Math.random() * functions.length)]()
}
