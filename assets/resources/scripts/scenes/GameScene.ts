import Global from "../Global";
import { BoostersController } from "../model/Boosters";
import { Stats } from "../model/Stats";
import { TileState } from "../model/Tile";
import BoostersNode from "../nodes/BoostersNode";
import { GridNode } from "../nodes/GridNode";
import StatsBarNode from "../nodes/ui/StatsBarNode";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {
    @property(cc.Prefab) statsBarPrefab: cc.Prefab = null
    @property(cc.Prefab) gridPrefab: cc.Prefab = null
    @property(cc.Prefab) boostersPrefab: cc.Prefab = null
    @property(cc.Node) statsBarPosition: cc.Node = null
    @property(cc.Node) gridPosition: cc.Node = null
    @property(cc.Node) boostersPosition: cc.Node = null

    private _gridNode: GridNode = null
    private _statsNode: StatsBarNode = null
    private _stats: Stats = null
    private _boostersNode: cc.Node = null


    onLoad() {
        let statsNode = cc.instantiate(this.statsBarPrefab)
        this._statsNode = statsNode.getComponent(StatsBarNode)
        this._stats = new Stats(Global.config.defaultScoreToWin, Global.config.defaultMoves)
        this._statsNode.init(this._stats)
        this.statsBarPosition.addChild(statsNode)
        this._setBooters()
        this._createGrid()
        this._gridNode.onGridChanged.add(this.node, (info: number) => this._stats.changeStats(info))

    }

    private _createGrid() {
        let gridNode = cc.instantiate(this.gridPrefab)
        this._gridNode = gridNode.getComponent(GridNode)
        this._gridNode.createGrid()
        this.gridPosition.addChild(gridNode)
        this._gridNode.onAnimationCompleted.add(this.node, () => {
            if (!this._gridNode.isSelectBooster) this._boostersNode.getComponent(BoostersNode).disableBooster()
            else this._gridNode.removeBlock()
        })
    }
    private _setBooters() {
        let boostersController = new BoostersController()
        let boostersNode = cc.instantiate(this.boostersPrefab)
        boostersNode.getComponent(BoostersNode).setBoosters(boostersController)
        boostersNode.getComponent(BoostersNode).onActiveBooster.add(this.node, (t: TileState) => {
            this._gridNode.selectBooster(t)
            this._boostersNode.getComponent(BoostersNode).selectBooster(t)
        })
        this._boostersNode = boostersNode
        this.boostersPosition.addChild(boostersNode)

    }
}
