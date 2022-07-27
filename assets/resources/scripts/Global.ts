import { TileAnimationController } from "./animations/TileAnimations";
import Config from "./cfg/Config";
import { Stats } from "./model/Stats";

export default class Global {
    private static _instance: Global
    private _config: Config
    private _tileAnimationController: TileAnimationController
    private _stats: Stats

    static get instance() { return Global._instance || (this._instance = new Global())}
    static get config() { return this._instance._config }
    static get stats() { return this._instance._stats }
    static get tileAnimation() { return Global._instance._tileAnimationController }

    init = () => new Promise<void>((resolve) => {
        Global._instance._config = new Config()
        Global._instance._stats = new Stats(Global.config.defaultScoreToWin, Global.config.defaultMoves)
        Global._instance._tileAnimationController = new TileAnimationController()
        resolve()
    })
}
