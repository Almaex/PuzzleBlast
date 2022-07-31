import { Stats } from "../../model/Stats";

const {ccclass, property} = cc._decorator;

@ccclass
export default class StatsBarNode extends cc.Component {
    @property(cc.Label) moveLabel: cc.Label = null
    @property(cc.Label) scoreLabel: cc.Label = null
    @property(cc.Label) scoreToWinLabel: cc.Label = null

    private _stats: Stats

    init(stats: Stats) {
        this._stats = stats
        this._stats.onStatsUpdated.add(this.node, () => this.updateNode())
        this.updateNode()
    }

    updateNode() {
        this.scoreLabel.string = `${this._stats.score}`
        this.moveLabel.string = `${this._stats.moves}`
        this.scoreToWinLabel.string = `${this._stats.scoreToWin}`
    }

}
