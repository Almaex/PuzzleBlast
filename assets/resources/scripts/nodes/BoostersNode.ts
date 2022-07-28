import { TileAnimationType } from "../animations/TileAnimations";
import Global from "../Global";
import { BoostersController } from "../model/Boosters";
import { Tile, TileState } from "../model/Tile";
import { Event } from "../utils/EventHandler";
import BoosterNode from "./BoosterNode";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BoostersNode extends cc.Component {
    @property([cc.Node]) buttons = new Array<cc.Node>()
    @property([cc.SpriteFrame]) icons = new Array<cc.SpriteFrame>()

    onActiveBooster = new Event

    setBoosters(controller: BoostersController) {
        this.buttons.forEach((bn, i) => {
            let node = bn.getComponent(BoosterNode)
            node.setBooster(controller.boosters[i])
            node.onActiveBooster.add(this.node, (t: TileState) => this.onActiveBooster.dispatch(t))
        })
    }

    selectBooster(t: TileState) {
        let currentButton = this.buttons.find(bn => {
            return bn.getComponent(BoosterNode).type == t
        })
        this.buttons.forEach(bn => bn.scale = 1)
        currentButton.scale = 1.1
    }
    disableBooster() {
        this.buttons.forEach(bn => bn.scale = 1)
    }
}
