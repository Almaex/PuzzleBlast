import Global from "../Global";
import { Event } from "../utils/EventHandler";
import { GridAct, GridUtils } from "./GridUtils";
import { Tile, TileState } from "./Tile";

export const enum GridState {
    NotReady = 0,
    Ready,
    Move,
    SelectBooster
}
export const enum GridChangesType {
    None,
    Normal,
    Booster,
    Reshuffle
}

export class GridChangesInfo {
    type: GridChangesType = GridChangesType.None
    activeTile: Tile
    removedTiles: Array<Tile>
    dropTiles: Array<Tile>
    needMix: boolean = false
    booster: Tile
}

export class Grid {
    private _size: cc.Vec2 = null
    private _currentGrid: Array<Array<Tile>> = []
    private _connectedTilesArray: Array<Tile> = []
    private _gridChangesInfo: GridChangesInfo = new GridChangesInfo()
    private _state = GridState.NotReady
    private _gridUtils: GridUtils = new GridUtils()
    private _selectBoosterType: TileState = null


    get size() { return this._size }
    get rowsCount() { return this._size.x }
    get columnCount() { return this._size.y }
    get currentGrid() { return this._currentGrid }
    get connectedTilesArray() { return this._connectedTilesArray }
    get isBlock() { return this._state == GridState.Move }
    get isSelectBooster() { return this._state == GridState.SelectBooster }

    onGridChanged = new Event
    onAddBooster = new Event
    onNeedMix = new Event


    constructor(size: cc.Vec2) {
        this._size = size
        this._addTiles()
    }

    removeBlock() {
        this._state = GridState.Ready
    }
    waitTileSelectionBooster(type) {
        this._state = GridState.SelectBooster
        this._selectBoosterType = type
    }
    private _getTile(position: cc.Vec2) {
        if (!this._isValidPick(position)) return
        return this._currentGrid[position.x][position.y]
    }

    private _canMove(tile: Tile) {
        let tiles = this._gridUtils.doAct(this._currentGrid, tile.position, GridAct.Find)
        let canMakeMove = tiles.length > 2
        if (!canMakeMove) {
            tile.noCombo.dispatch()
            this._state = GridState.Ready
        }
        return canMakeMove
    }
    
    private _addTiles() {
        for (let row = 0; row < this.size.x; row++) {
            this.currentGrid.push([])
            for (let column = 0; column < this.size.y; column++) {
                let tile = new Tile(cc.v2(row, column))
                tile.onTileClick.add(this, () => {
                    if (this.isBlock) return
                    if (this.isSelectBooster) {
                        this._state = GridState.Move
                        this._selectBooster(tile)
                        return
                    }
                    if (this._findNeedMix()) {
                        this._mixGrid()
                        tile.createBooster(TileState.Mix)
                        this._changeCurrentGrid(tile)
                        this.onNeedMix.dispatch()
                    }
                    this._state = GridState.Move
                    this._changeCurrentGrid(tile)
                    })
                this.currentGrid[row].push(tile)
            }
        }
        this._mixGrid()
    }

    private _findNeedMix() {
        for (let row = 0; row < this.size.x; row++) {
            for (let column = 0; column < this.size.y; column++) {
                let tilePos = cc.v2(row, column)
                let finder = this._gridUtils.doAct(this._currentGrid, tilePos, GridAct.Find)
                if (finder.length > 2) {
                    return false
                }
            }
        }
        return true
    }
    private _mixGrid(forced: boolean = false) {
        if (!forced || !this._findNeedMix()) return
        let newBoard = this._gridUtils.doAct(this._currentGrid, this.size, GridAct.Mix) 
        this._currentGrid = newBoard
    }

    private _changeCurrentGrid(tile: Tile) {
        if (tile.isBooster || this._canMove(tile)) {
            let changeType = tile.isBooster ? GridChangesType.Booster : GridChangesType.Normal
            this._gridChangesInfo.activeTile = tile
            this._gridChangesInfo.type = changeType
            this._gridChangesInfo.removedTiles = this._boosterAction(tile)
            this._gridChangesInfo.needMix = tile.isMix

            let canMakeBooster = changeType != GridChangesType.Booster
            canMakeBooster && this._createBomb(tile, this._gridChangesInfo.removedTiles.length)

            let dropTiles = this._gridUtils.doAct(this.currentGrid, this.size, GridAct.Drop)
            this._gridChangesInfo.dropTiles = dropTiles
            let newGrid = this._gridUtils.doAct(this.currentGrid, this.size, GridAct.Fill)
            this._currentGrid = newGrid
            this.onGridChanged.dispatch(this._gridChangesInfo)
            this._gridChangesInfo = new GridChangesInfo()

        }
    }

    private _removeTiles(tile: Tile) {
        let r = []
        let tiles = this._gridUtils.doAct(this._currentGrid, tile.position, GridAct.Find)
        tiles.forEach((removedTile: Tile) => {
            let tile = this._getTile(removedTile.position)
            r = r.concat(this._getRemoveTiles(tile))
        })
        return r
    }

    private _getRemoveTiles(tile: Tile) {
        tile.remove()
        return [tile]
    }
    private _getRemoveTilesBomb(tile: Tile) {
        let size = Global.config.bombRemoveArea
        let bombDestroyed = this._gridUtils.doAct(this._currentGrid, tile.position, GridAct.Remove)
        bombDestroyed.forEach((tile) => tile.remove())
        return bombDestroyed
    }
    private _selectBooster(tile: Tile) {
        this._getTile(tile.position).state = this._selectBoosterType
        this._state = GridState.Ready
        this._selectBoosterType = null
        this.onAddBooster.dispatch(tile)
    }
    private _createBomb(tile: Tile, tilesRemoveCount: number) {
        let bombCreateSize = Global.config.bombCreateSize
        if (tilesRemoveCount < bombCreateSize) return
        tile.createBooster(TileState.Bomb)
    } 
    private _isValidPick = (position: cc.Vec2) => this._currentGrid[position.x]?.[position.y] != null

    private _boosterAction(tile: Tile) {
        if (tile.isBomb) {
            return this._getRemoveTilesBomb(tile)
        } else if (tile.isMix) {
            let allTiles = []
            this._currentGrid.forEach(r => allTiles = allTiles.concat(r))
            allTiles.forEach((t) => t.remove())
            return allTiles
        } else {
            return this._removeTiles(tile)
        }
    }
}
