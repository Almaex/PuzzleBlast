import Global from "../Global";
import { Grid, GridChangesInfo, GridChangesType } from "../model/Grid";
import { Tile, TileState } from "../model/Tile";
import { Event } from "../utils/EventHandler";
import TileNode from "./TileNode";

const {ccclass, property} = cc._decorator;

@ccclass
export class GridNode extends cc.Component {
    @property(cc.Node) view: cc.Node = null
    @property(cc.Prefab) tilePrefab: cc.Prefab = null
    @property(cc.Node) noStepNode: cc.Node = null

    onAnimationCompleted = new Event
    onGridChanged = new Event


    private _grid: Grid
    private _tileSize = 0

    get isSelectBooster() { return this._grid.isSelectBooster }
 
    removeBlock() {
        this._grid.removeBlock()
    }

    getTileNode(tile: Tile) {
        return this.view.children.find((node: cc.Node) => {
            let tileNode = node.getComponent(TileNode)
            return tileNode.tile.position.x == tile.position.x && tileNode.tile.position.y == tile.position.y
        }).getComponent(TileNode)
    }

    createGrid() {
        this.noStepNode.active = false
        this._grid = new Grid(Global.config.gridSize)
        this._tileSize = this.tilePrefab.data.getContentSize().width
        this._grid.currentGrid.forEach(r => r.forEach(t => this.createTile(t)))
        this._grid.onGridChanged.add(this.node, (info: GridChangesInfo) => {
            this._gridChange(info)
            !info.needMix && this.onGridChanged.dispatch(info.removedTiles.length)
        })
        this._grid.onAddBooster.add(this.node, (tile: Tile) => this.changeTile(tile))
        this._grid.onNeedMix.add(this.node, () => {
            this._noStepsAnimation()
        })
    }

    createTile(tile: Tile) {
        let tileNode = cc.instantiate(this.tilePrefab)
        tileNode.getComponent(TileNode).setInfo(tile)
        tileNode.setContentSize
        tileNode.setPosition(tile.position.y * this._tileSize, -tile.position.x * this._tileSize)
        this.view.addChild(tileNode)
    }
    changeTile(tile: Tile) {
        this.getTileNode(tile).updateTileIconAnimation()
        this.onAnimationCompleted.dispatch()
    }
    selectBooster(booster: TileState) {
        this._grid.waitTileSelectionBooster(booster)
    }

    private async _gridChange(changesInfo: GridChangesInfo) {
        await Promise.all(changesInfo.removedTiles.map(t => this.getTileNode(t).removingAnimation()))
        changesInfo.activeTile.isBooster && await this.getTileNode(changesInfo.activeTile).bombAnimation()
        await Promise.all(changesInfo.dropTiles.map(t => this.getTileNode(t).dropingAnimation()))
        await Promise.all(changesInfo.removedTiles.map(t => this.getTileNode(t).updateIcon()))
        await Promise.all(changesInfo.removedTiles.map(t => this.getTileNode(t).emergenceAnimation()))
        this.onAnimationCompleted.dispatch(changesInfo.needMix)
        this.removeBlock()
    }
    private _noStepsAnimation() {
        let node = this.noStepNode
        const speed = 1
            
        cc.tween(node)
            .call(() => {
                node.active = true
                node.opacity = 255
                node.scale = 0
            })
            .to(speed, { scale: 1.1 })
            .to(speed, { scale: 1 })
    }
}
