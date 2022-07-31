import Global from "../Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SyncScene extends cc.Component {
    @property(cc.Node) blackScreen: cc.Node = null

    start() {
        Global.instance.init().then(() => this._preload()).then(() => cc.director.loadScene("MenuScene"))
    }

    private _preload() {
        return new Promise(resolve => {
            setTimeout(() => {
                cc.tween(this.blackScreen)
                    .call(() => cc.director.preloadScene("MenuScene"))
                    .to(0.5, {opacity: 255})
                    .call(resolve)
                    .start()
        }, 1000)
    })}
}
