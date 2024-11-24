import keypress from "keypress";

import { MenuScene, Screen } from "./screen.js";

keypress(process.stdin);

const screen = new Screen([
  new MenuScene({
    "Other Menu": new MenuScene(),
    "Some Menu": new MenuScene(),
    "Some Really Really Long Menu": new MenuScene(),
  }),
]);

process.stdin.on("keypress", function (ch, key) {
  if (key && key.ctrl && key.name == "c") {
    screen.close();
    process.exit();
  }
});

screen.render();

process.stdin.setRawMode(true);
process.stdin.resume();
