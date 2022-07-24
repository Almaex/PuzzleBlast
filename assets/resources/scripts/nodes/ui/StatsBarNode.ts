import Global from "../../Global";
import { Stats } from "../../model/Stats";

const {ccclass, property} = cc._decorator;

@ccclass
export default class StatsBarNode extends cc.Component {
    @property(cc.Label) moveLabel: cc.Label = null
    @property(cc.Label) scoreLabel: cc.Label = null

    private _stats: Stats = null
    
    onLoad() { 
        this._stats = new Stats()
        this.scoreLabel.string = `${this._stats.score}`
        this.moveLabel.string = `${this._stats.moves}`
    }

}
