import Global from "../Global";
import { Grid, GridChangesInfo } from "../model/Grid";
import { Tile } from "../model/Tile";
import { Event } from "../utils/EventHandler";
import TileNode from "./TileNode";

const {ccclass, property} = cc._decorator;

@ccclass
export class GridNode extends cc.Component {
    @property(cc.Node) view: cc.Node = null
    @property(cc.Prefab) tilePrefab: cc.Prefab = null

    onAnimationCompleted = new Event
    onGridChanged = new Event


    private _grid: Grid
    private _tileSize = 0

    removeBlock() {
        this._grid.removeBlock()
    }

    getTileNode(tile: Tile) {
        return this.view.children.find((node: cc.Node) => {
            let tileNode = node.getComponent(TileNode)
            return tileNode.tile.position.x == tile.position.x && tileNode.tile.position.y == tile.position.y
        }).getComponent(TileNode)
    }

    async createGrid() {
        this._grid = new Grid(Global.config.gridSize)
        this._tileSize = this.tilePrefab.data.getContentSize().width
        this._grid.currentGrid.forEach(r => r.forEach(t => this.createTile(t)))
        this._grid.onGridChanged.add(this.node, (info: GridChangesInfo) => {
            this._simpleChange(info)
            this.onGridChanged.dispatch(info.removedTiles.length)
        })
    }

    createTile(tile: Tile) {
        let tileNode = cc.instantiate(this.tilePrefab)
        tileNode.getComponent(TileNode).setInfo(tile)
        tileNode.setContentSize
        tileNode.setPosition(tile.position.y * this._tileSize, -tile.position.x * this._tileSize)
        this.view.addChild(tileNode)
    }

    private async _simpleChange(changesInfo: GridChangesInfo) {
        await Promise.all(changesInfo.removedTiles.map(t => this.getTileNode(t).removingAnimation()))
        await Promise.all(changesInfo.dropTiles.map(t => this.getTileNode(t).dropingAnimation()))
        await Promise.all(changesInfo.removedTiles.map(t => this.getTileNode(t).updateIcon()))
        await Promise.all(changesInfo.removedTiles.map(t => this.getTileNode(t).emergenceAnimation()))
        this.onAnimationCompleted.dispatch(changesInfo.needMix)
        this.removeBlock()
    }
    private async _bombChange(changesInfo: GridChangesInfo) {
    }
}
