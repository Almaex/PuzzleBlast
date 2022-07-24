import { GridNode } from "../nodes/GridNode";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {
    @property(cc.Prefab) statsBarPrefab: cc.Prefab = null
    @property(cc.Prefab) gridPrefab: cc.Prefab = null
    @property(cc.Node) statsBarPosition: cc.Node = null
    @property(cc.Node) gridPosition: cc.Node = null

    private _grid: GridNode = null

    onLoad() {
        let statsNode = cc.instantiate(this.statsBarPrefab)
        this.statsBarPosition.addChild(statsNode)
        this._createGrid()
    }

    private _createGrid() {
        cc.log("[LOG]_createGrid")
        let gridNode = cc.instantiate(this.gridPrefab)
        this._grid = gridNode.getComponent(GridNode)
        this._initView()
        this.gridPosition.addChild(gridNode)
    }

    private _initView() {
        cc.log("[LOG]_initView")
        this._grid.createGrid().then(() => {
            cc.log("[LOG]_initView.then")
            this._grid.onAnimationCompleted.add(this.node, needReshuffle => {
                this._grid.removeBlock()
            })
        })
    }
}
