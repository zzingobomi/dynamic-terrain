import { Managers } from "./managers/Managers";

export class App {
  instance = Managers.Instance;
}

new App();
