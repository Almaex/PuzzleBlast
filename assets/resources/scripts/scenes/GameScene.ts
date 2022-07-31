import Global from "../Global";
import { BoostersController } from "../model/Boosters";
import { EndGameType, Stats } from "../model/Stats";
import { TileState } from "../model/Tile";
import BoostersNode from "../nodes/BoostersNode";
import { EndGameNode } from "../nodes/EndGameNode";
import { GridNode } from "../nodes/GridNode";
import StatsBarNode from "../nodes/ui/StatsBarNode";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {
    @property(cc.Prefab) statsBarPrefab: cc.Prefab = null
    @property(cc.Prefab) gridPrefab: cc.Prefab = null
    @property(cc.Prefab) boostersPrefab: cc.Prefab = null
    @property(cc.Prefab) endGamePrefab: cc.Prefab = null
    @property(cc.Node) statsBarPosition: cc.Node = null
    @property(cc.Node) gridPosition: cc.Node = null
    @property(cc.Node) boostersPosition: cc.Node = null
    @property(cc.Node) endGamePosition: cc.Node = null
    @property(cc.Node) blackScreen: cc.Node = null

    private _gridNode: GridNode = null
    private _statsNode: StatsBarNode = null
    private _stats: Stats = null
    private _boostersNode: cc.Node = null
    private _boostersController: BoostersController = null


    onLoad() {
        let statsNode = cc.instantiate(this.statsBarPrefab)
        this._statsNode = statsNode.getComponent(StatsBarNode)
        this._stats = new Stats(Global.config.defaultScoreToWin, Global.config.defaultMoves)
        this._statsNode.init(this._stats)
        this.statsBarPosition.addChild(statsNode)
        this._setBooters()
        this._createGrid()
        this._gridNode.onGridChanged.add(this.node, (info: number) => this._stats.changeStats(info))
        this._stats.onEndGame.add(this.node, (type: EndGameType) => this._onEndGame(type))
        this._gridNode.onAddBooster.add(this.node, (type: TileState) => this._boostersController.decremenBoosterCount(type))

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
        this._boostersController = new BoostersController()
        let boostersNode = cc.instantiate(this.boostersPrefab)
        boostersNode.getComponent(BoostersNode).setBoosters(this._boostersController)
        boostersNode.getComponent(BoostersNode).onActiveBooster.add(this.node, (t: TileState) => {
            this._gridNode.selectBooster(t)
            this._boostersNode.getComponent(BoostersNode).selectBooster(t)
        })
        this._boostersNode = boostersNode
        this.boostersPosition.addChild(boostersNode)
    }

    private _onEndGame(type: EndGameType) {
        let endNode = cc.instantiate(this.endGamePrefab)
            endNode.getComponent(EndGameNode).setEndType(type)
            endNode.getComponent(EndGameNode).onEnd.add(this.node, () => {
                let animEndNode = cc.tween(endNode)
                    .by(0.1, { scale: 0.1 })
                    .to(0.2, { scale: 0 })
                    .start()
                let animBlackScreen = cc.tween(this.blackScreen)
                    .to(2, { opacity: 255 })
                    .call(() => cc.director.loadScene("MenuScene"))
                    .start()
                cc.tween(this.blackScreen).sequence(
                    animEndNode,
                    cc.tween(this.blackScreen).delay(0.2),
                    animBlackScreen
                )
            })
            this.blackScreen.active = true
            this.blackScreen.opacity = 200
            this.blackScreen.addChild(endNode)
    }
}
