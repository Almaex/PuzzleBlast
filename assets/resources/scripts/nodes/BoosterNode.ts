import { Booster } from "../model/Boosters";
import { Event } from "../utils/EventHandler";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BoosterNode extends cc.Component {
    @property(cc.Sprite) icon: cc.Sprite = null
    @property(cc.Label) count: cc.Label = null
    @property([cc.SpriteFrame]) icons = new Array<cc.SpriteFrame>()

    private _booster: Booster = null
    get type() { return this._booster.type }

    onActiveBooster = new Event

    setBooster(booster: Booster) {
        this._booster = booster
        this.icon.spriteFrame = this.icons[booster.type - 2]
        this.count.string = `${booster.count}`
        booster.onChangeCount.add(this.node, () => {
            this._changeCount()
        })
    }

    onClick() {
        if (this._booster.count <= 0) return
        cc.log("[LOG]onClisck")
        this.onActiveBooster.dispatch(this._booster.type)
    }

    private _changeCount() {
        this.count.string = `${this._booster.count}`
    }

}
