import { EndGameType } from "../model/Stats";
import { Event } from "../utils/EventHandler";

const {ccclass, property} = cc._decorator;

@ccclass
export class EndGameNode extends cc.Component {
    @property(cc.Label) Label: cc.Label = null

    onEnd = new Event

    setEndType(endType: EndGameType) {
        this.Label.string = endType == EndGameType.Win ? "YOU WIN" : "YOU LOSE"
    }

    onClick() {
        cc.log("[LOG]ENDGAME")
        this.onEnd.dispatch()
    }
   
}
