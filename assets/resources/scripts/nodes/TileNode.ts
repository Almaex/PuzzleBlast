import { TileAnimationType } from "../animations/TileAnimations";
import Global from "../Global";
import { Tile } from "../model/Tile";
import { Event } from "../utils/EventHandler";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TileNode extends cc.Component {
    @property(cc.Sprite) tileIcon: cc.Sprite = null
    @property([cc.SpriteFrame]) icons = new Array<cc.SpriteFrame>()
    @property([cc.SpriteFrame]) boosterIcons = new Array<cc.SpriteFrame>()

    private _tile: Tile = null

    get tile() { return this._tile }
    get isNormal() { return this._tile.isNormal }
    get isBooster() { return this._tile.isBooster }
    get color() { return this._tile.color }
    get tilePosition() { return this._tile.position }
    get size() { return this.node.getContentSize().width }

    setInfo(tile: Tile) {
        this._tile = tile
    }

    async updateIcon() {
        if (this._tile.isNormal && !this._tile.isBooster) this.tileIcon.spriteFrame = this.icons[this.color]
    }
    onLoad() {
        this.tileIcon.spriteFrame = this.icons[this.color]
        this._tile.noCombo.add(this.node, () => this.noConnectedAnimation())
    }
    updateTileIconAnimation() {
        this.tileIcon.spriteFrame = this.boosterIcons[this._tile.state - 2]
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
        let type = this.isBooster ? TileAnimationType.BombEmergence : TileAnimationType.Emergence
        return Global.tileAnimation.animate(this, type)
    }
    bombAnimation() {
        return Global.tileAnimation.animate(this, TileAnimationType.CreateBomb)
    }
    mixAnimation() {
        return Global.tileAnimation.animate(this, TileAnimationType.MixAnimation)
    }

}
