import keypress from "keypress";

import { Screen } from "./screen.js";
import { MenuScene } from "./menu.js";

keypress(process.stdin);

const screen = new Screen([
  new MenuScene({
    "Color Picker": new MenuScene(),
    "Palette Generator": new MenuScene(),
    "Gradient Generator": new MenuScene(),
    "Accesibility Testing": new MenuScene(),
  }),
]);

process.stdin.on("keypress", function (ch, key) {
  if (key && key.ctrl && key.name == "c") {
    screen.close();
    process.exit();
  }

  screen.onKey(ch, key);
});

screen.render();

process.stdin.setRawMode(true);
process.stdin.resume();
