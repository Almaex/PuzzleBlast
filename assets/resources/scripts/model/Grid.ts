import { chunkArray, Event, shuffle } from "../utils/EventHandler";
import { Tile } from "./Tile";

export const enum GridState {
    NotReady = 0,
    Ready,
    Move,
    FullStop,
    SelectBooster
}

export const enum GridChangesType {
    None,
    Simple,
    Booster,
    Reshuffle
}

export class GridChangesInfo {
    type: GridChangesType = GridChangesType.None
    activeTile: Tile
    removedTiles: Array<Tile>
    dropTiles: Array<Tile>
    reshuffle: boolean
    booster: Tile
}

export class Grid {
    private _size: cc.Vec2 = null
    private _currentGrid: Array<Array<Tile>> = []
    private _connectedTilesArray: Array<Tile> = []
    private _gridChangesInfo: GridChangesInfo = new GridChangesInfo()
    private _state = GridState.NotReady

    get size() { return this._size }
    get rowsCount() { return this._size.x }
    get columnCount() { return this._size.y }
    get currentGrid() { return this._currentGrid }
    get connectedTilesArray() { return this._connectedTilesArray }
    get isBlock() { return this._state == GridState.Move || this._state == GridState.FullStop }

    onGridChanged = new Event


    constructor(size: cc.Vec2) {
        this._size = size
        this._addTiles()
    }

    removeBlock() {
        this._state = GridState.Ready
    }

    reshuffleGridIfNeeded(forceReshuffle = false) {
        if (!this._needReshuffle() && !forceReshuffle) return
        const updateAllTiles = () => {
            for (let row = 0; row < this._size.x; row++) {
                for (let column = 0; column < this._size.y; column++) {
                    this._currentGrid[row][column].updatePos(cc.v2(row, column))
                }
            }
        }
        let allTiles = []
        this._currentGrid.forEach(r => allTiles = allTiles.concat(r))
        shuffle(allTiles)
        let newBoard = chunkArray(allTiles, this._size.x)
        this._currentGrid = newBoard
        updateAllTiles()
        this.reshuffleGridIfNeeded()
    }
    private _needReshuffle() {
        for (let row = 0; row < this._size.x; row++) {
            for (let column = 0; column < this._size.y; column++) {
                let tilePos = cc.v2(row, column)
                if (this._getListConnectedTiles(tilePos).length > 1) {
                    return false
                }
            }
        }
        return true
    }

    private _getTile(position: cc.Vec2) {
        return this._currentGrid[position.x][position.y]
    }
    isValidPick = (pos: cc.Vec2) => this._currentGrid[pos.x]?.[pos.y] != null

    private _findTilesChain(pos: cc.Vec2, color) {
        if (!this.isValidPick(pos)) return
        let tile = this._getTile(pos)
        if (tile.removed) return
    
        if (tile.color == color && !this._isCheckTile(tile)) {
            this._connectedTilesArray.push(tile)
            this._findTilesChain(cc.v2(pos.x + 1, pos.y), color)
            this._findTilesChain(cc.v2(pos.x - 1, pos.y), color)
            this._findTilesChain(cc.v2(pos.x, pos.y + 1), color)
            this._findTilesChain(cc.v2(pos.x, pos.y - 1), color)
        }
    }
    private _canMakeMove(tile: Tile) {
        let tiles = this._getListConnectedTiles(tile.position)
        let canMakeMove = tiles.length > 1
        if (!canMakeMove) {
            tile.noCombo.dispatch()
            this._state = GridState.Ready
        }
        return canMakeMove
    }

    private _isCheckTile = (tileCheck: Tile) => 
        this._connectedTilesArray.find(tile => { return tile.position.x === tileCheck.position.x && tile.position.y === tileCheck.position.y }) != null

    
    private _addTiles() {
        for (let row = 0; row < this.size.x; row++) {
            this.currentGrid.push([])
            for (let column = 0; column < this.size.y; column++) {
                let tile = new Tile(cc.v2(row, column))
                tile.onTileClick.add(this, () => {
                    if (this.isBlock) return
                    this._state = GridState.Move
                    this._changeCurrentGrid(tile)
                    })
                this.currentGrid[row].push(tile)
            }
        }
        this.reshuffleGridIfNeeded()
            
    }
    private _getListConnectedTiles(pos: cc.Vec2) {
        this._connectedTilesArray = []
        let tileColor = this._getTile(pos).color
        this._findTilesChain(pos, tileColor)
        return this._connectedTilesArray
    }

    private _changeCurrentGrid(tile: Tile) {
        if (!this._canMakeMove(tile)) return
        this._gridChangesInfo.type = GridChangesType.Simple
        this._gridChangesInfo.activeTile = tile
        this._gridChangesInfo.removedTiles = this._removeTiles(tile)

        this._gridChangesInfo.dropTiles = this._dropTiles()
        this._fillGrid()
        this.onGridChanged.dispatch(this._gridChangesInfo)
        this._gridChangesInfo = new GridChangesInfo()
    }

    private _removeTiles(tile: Tile) {
        let r = []
        let tiles = this._getListConnectedTiles(tile.position)
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

    private _dropTiles() {
        let r = []
        for (let i = this.rowsCount - 2; i >= 0; i--) {
            for (let j = 0; j < this.columnCount; j++) {
                let emptySpaces = this._emptySpacesBelow(i, j)
                let tile = this._getTile(cc.v2(i, j))
                if (tile.isNormal && emptySpaces > 0) {
                    r.push(tile)
                    this._tileExchange(tile.position, cc.v2(i + emptySpaces, j))
                }
            }
        }
        return r
    }
    private _tileExchange(fromPos: cc.Vec2, toPos: cc.Vec2) {
        let setNewTile = (pos: cc.Vec2, newTile: Tile) => {
            this._currentGrid[pos.x][pos.y] = newTile
            this._currentGrid[pos.x][pos.y].updatePos(cc.v2(pos.x, pos.y))
        }
        let fromTile = Object.assign(this._getTile(fromPos))
        setNewTile(fromPos, this._getTile(toPos))
        setNewTile(toPos, fromTile)
    }

    private _emptySpacesBelow(row: number, column: number) {
        let r = 0
        if (row != this.rowsCount) {
            for (let i = row + 1; i < this.rowsCount; i++) {
                this._getTile(cc.v2(i, column)).removed && r++ 
            }
        }
        return r
    }

    private _fillGrid() {
        for (let i = 0; i < this.columnCount; i++) {
            if (this.currentGrid[0][i].removed) {
                let emptySpaces = this._emptySpacesBelow(0, i) + 1
                for (let j = 0; j < emptySpaces; j++) {
                    this.currentGrid[j][i].updateState()
                }
            }
        }
    }
}
