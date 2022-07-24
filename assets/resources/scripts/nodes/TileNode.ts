import { TileAnimationType } from "../animations/TileAnimations";
import Global from "../Global";
import { Tile } from "../model/Tile";
import { Event } from "../utils/EventHandler";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TileNode extends cc.Component {
    @property(cc.Sprite) tileIcon: cc.Sprite = null
    @property([cc.SpriteFrame]) icons = new Array<cc.SpriteFrame>()

    private _tile: Tile = null

    onColorChange = new Event

    get tile() { return this._tile }
    get isNormal() { return this._tile.isNormal }
    get color() { return this._tile.color }
    get tilePosition() { return this._tile.position }
    get size() { return this.node.getContentSize().width }

    setInfo(tile: Tile) {
        this._tile = tile
    }

    async updateIcon() {
        if (this._tile.isNormal) this.tileIcon.spriteFrame = this.icons[this.color]
    }
    onLoad() {
        this.tileIcon.spriteFrame = this.icons[this.color]
        this._tile.noCombo.add(this.node, () => this.noConnectedAnimation())
    }

    onClick() {
        this._tile.onClick()
    }

    noConnectedAnimation() {
        return Global.tileAnimation.animate(this, TileAnimationType.NoConnected)
    }
    removingAnimation() {
        return Global.tileAnimation.animate(this, TileAnimationType.Removing)
    }
    dropingAnimation() {
        return Global.tileAnimation.animate(this, TileAnimationType.Droping)
    }
    emergenceAnimation() {
        return Global.tileAnimation.animate(this, TileAnimationType.Emergence)
    }
}
