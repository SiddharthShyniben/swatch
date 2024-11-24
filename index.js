import { MenuScene, Screen } from "./screen.js";

const screen = new Screen([new MenuScene()]);
screen.render();
setTimeout(() => screen.close(), 1000);
