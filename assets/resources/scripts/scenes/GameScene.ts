import { GridNode } from "../nodes/GridNode";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {
    @property(cc.Prefab) statsBarPrefab: cc.Prefab = null
    @property(cc.Prefab) gridPrefab: cc.Prefab = null
    @property(cc.Node) statsBarPosition: cc.Node = null
    @property(cc.Node) gridPosition: cc.Node = null

    private _gridNode: GridNode = null

    onLoad() {
        let statsNode = cc.instantiate(this.statsBarPrefab)
        this.statsBarPosition.addChild(statsNode)
        this._createGrid()
    }

    private _createGrid() {
        cc.log("[LOG]_createGrid")
        let gridNode = cc.instantiate(this.gridPrefab)
        this._gridNode = gridNode.getComponent(GridNode)
        this._gridNode.createGrid()
        this.gridPosition.addChild(gridNode)
    }
}
