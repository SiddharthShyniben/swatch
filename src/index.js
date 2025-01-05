import keypress from "keypress";
import { throttle } from "throttle-debounce";

import { Screen } from "./screen.js";
import { MenuScene } from "./menu.js";
import { PickerScene } from "./picker.js";
import { GeneratorScene } from "./generator.js"

keypress(process.stdin);

const picker = new PickerScene();
const generator = new GeneratorScene()

const screen = new Screen([
  new MenuScene({
    "Color Picker": picker,
    "Palette Generator": generator,
    // "Gradient Generator": new MenuScene(),
    // "Accessibility Testing": new MenuScene(),
  }),
  picker,
  generator
]);

process.stdin.on("keypress", throttle(10, function (ch, key) {
  key ??= {}
  ch ??= ''

  if (key && key.ctrl && key.name === "c") {
    screen.close();
    process.exit();
  }

  try {
    screen.onKey(ch, key)
  } catch (e) {
    throw e
  }
}), { noTrailing: true });

screen.render();

process.stdin.setRawMode(true);
process.stdin.resume();
