import { GameManager } from "@src/managers/GameManager";

export class Managers {
  private static s_instance: Managers;
  static get Instance(): Managers {
    this.Init();
    return this.s_instance;
  }

  _game: GameManager = new GameManager();

  static get Game(): GameManager {
    return Managers.Instance._game;
  }

  static async Init() {
    if (!this.s_instance) {
      this.s_instance = new Managers();

      await this.s_instance._game.Init();
    }
  }

  public static Clear(): void {}
}
