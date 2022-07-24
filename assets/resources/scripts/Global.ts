import { TileAnimationController } from "./animations/TileAnimations";
import Config from "./cfg/Config";
import GridController from "./Controllers/GridController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Global extends cc.Component {
    private _config = new Config()
    // private _gridController = new GridController()
    private _tileAnimationController = new TileAnimationController()
    // private _statsController = new StatsController()
    private static _instance: Global

    static get instance() { return this._instance || (this._instance = new Global()) }
    static get config() { return Global.instance._config }
    // static get gridController() { return this._instance._gridController }
    static get tileAnimation() { return this._instance._tileAnimationController }
    // static get statsController() { return this._instance._statsController }

        
}
