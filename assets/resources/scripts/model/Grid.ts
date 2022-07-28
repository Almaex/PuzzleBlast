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
    needMix: boolean
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
    onNeedMix = new Event
    onAddBooster = new Event


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
                    this._state = GridState.Move
                    this._changeCurrentGrid(tile)
                    })
                this.currentGrid[row].push(tile)
            }
        }
        this._isNeedMix()
    }
    private _isNeedMix() {
        for (let row = 0; row < this.size.x; row++) {
            for (let column = 0; column < this.size.y; column++) {
                let tilePos = cc.v2(row, column)
                let finder = this._gridUtils.doAct(this._currentGrid, tilePos, GridAct.Find)
                if (finder.length > 1) {
                    return false
                }
            }
        }
        let newBoard = this._gridUtils.doAct(this._currentGrid, this.size, GridAct.Mix) 
        this._currentGrid = newBoard
    }

    private _changeCurrentGrid(tile: Tile) {
        if (tile.isBooster || this._canMove(tile)) {
        let changeType = tile.isBooster ? GridChangesType.Booster : GridChangesType.Normal
        this._gridChangesInfo.activeTile = tile
        this._gridChangesInfo.type = changeType
        this._gridChangesInfo.removedTiles = tile.isBooster ? this._getRemoveTilesBomb(tile) : this._removeTiles(tile)

        let canMakeBooster = changeType != GridChangesType.Booster
        canMakeBooster && this._createBomb(tile, this._gridChangesInfo.removedTiles.length)

        let dropTiles = this._gridUtils.doAct(this.currentGrid, this.size, GridAct.Drop)
        this._gridChangesInfo.dropTiles = dropTiles
        let newGrid = this._gridUtils.doAct(this.currentGrid, this.size, GridAct.Fill)
        this._currentGrid = newGrid
        let needMix = this._isNeedMix()
        if (needMix) {
            this.onNeedMix.dispatch()
        }
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
        
        let size = 2
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
        let boosterList = [5, 5, 5]
        if (tilesRemoveCount < Math.min(...boosterList)) return

        let getBombType = tilesRemoveCount => {
            if (tilesRemoveCount >= 5) {
                return TileState.Bomb
            } else if (tilesRemoveCount >= 5) {
                return TileState.Mix
            }
        }

        tile.createBomb(getBombType(tilesRemoveCount))
    } 
    private _isValidPick = (position: cc.Vec2) => this._currentGrid[position.x]?.[position.y] != null
    connectedTilesArrayBomb = []
}
