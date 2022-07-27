import Global from "../Global";
import { Stats } from "../model/Stats";
import { GridNode } from "../nodes/GridNode";
import StatsBarNode from "../nodes/ui/StatsBarNode";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {
    @property(cc.Prefab) statsBarPrefab: cc.Prefab = null
    @property(cc.Prefab) gridPrefab: cc.Prefab = null
    @property(cc.Node) statsBarPosition: cc.Node = null
    @property(cc.Node) gridPosition: cc.Node = null

    private _gridNode: GridNode = null
    private _statsNode: StatsBarNode = null
    private _stats: Stats = null


    onLoad() {
        let statsNode = cc.instantiate(this.statsBarPrefab)
        this._statsNode = statsNode.getComponent(StatsBarNode)
        this._stats = new Stats(Global.config.defaultScoreToWin, Global.config.defaultMoves)
        this._statsNode.init(this._stats)
        this.statsBarPosition.addChild(statsNode)
        this._createGrid()
    }

    private _createGrid() {
        let gridNode = cc.instantiate(this.gridPrefab)
        this._gridNode = gridNode.getComponent(GridNode)
        this._gridNode.createGrid()
        this.gridPosition.addChild(gridNode)
    }
}
