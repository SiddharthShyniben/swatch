import keypress from "keypress";

import { Screen } from "./screen.js";
import { MenuScene } from "./menu.js";
import { PickerScene } from "./picker.js";

keypress(process.stdin);

const picker = new PickerScene();

const screen = new Screen([
  new MenuScene({
    "Color Picker": picker,
    "Palette Generator": new MenuScene(),
    // "Gradient Generator": new MenuScene(),
    // "Accesibility Testing": new MenuScene(),
  }),
  picker,
]);

process.stdin.on("keypress", function (ch, key) {
  if (key && key.ctrl && key.name === "c") {
    screen.close();
    process.exit();
  }

  screen.onKey(ch, key);
});

screen.render();

process.stdin.setRawMode(true);
process.stdin.resume();
