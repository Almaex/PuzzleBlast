import Global from "../Global";
import { Timer } from "../utils/Timer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SyncScene extends cc.Component {
    @property(cc.Node) syncScreen: cc.Node = null

    start() {
        this._preload().then(() => cc.director.loadScene("MenuScene"))
    }

    private _preload() {
        return new Promise<void>(resolve => {
            cc.log("[LOG]_preload")
            new Timer(Global.config.loadSceneDelay, () => {cc.director.preloadScene("MenuScene"), resolve()})
            
        })
    }
}
