import Global from "../Global";
import { Timer } from "../utils/Timer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SyncScene extends cc.Component {
    @property(cc.Node) syncScreen: cc.Node = null

    start() {
        Global.instance.init().then(() => this._preload())
    }

    private async _preload() {
        new Timer(Global.config.loadSceneDelay, () => {cc.director.preloadScene("MenuScene")})
        cc.director.loadScene("MenuScene")
    }
}
