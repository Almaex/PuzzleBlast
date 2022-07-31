import { Tile } from "./Tile"

export enum GridAct {
    Mix,
    Drop,
    Fill,
    Find,
    Remove
}

export class GridUtils {
    
    private _mixer = new GridMixer()
    private _dropper = new GridDropper()
    private _filler = new GridFiller()
    private _finder = new GridFinder()
    private _remover = new GridRemover()

    doAct(grid: Array<Array<Tile>>, size: cc.Vec2, act: GridAct) {
        switch(act) {
            case GridAct.Mix: 
                return this._mixer.mix(grid, size)
            case GridAct.Drop:
                return this._dropper.drop(grid, size)
            case GridAct.Fill:
                return this._filler.fill(grid, size)
            case GridAct.Find:
                return this._finder.find(grid, size)
            case GridAct.Remove:
                return this._remover.remove(grid, size)
        }
    }
}

class GridMixer {

    mix(grid: Array<Array<Tile>>, size: cc.Vec2) {
        let newGrid = grid
        const updateAllTiles = () => {
            for (let row = 0; row < size.x; row++) {
                for (let column = 0; column < size.y; column++) {
                    newGrid[row][column].updatePos(cc.v2(row, column))
                }
            }
        }
        let allTiles = []
        newGrid.forEach(r => allTiles = allTiles.concat(r))
        this._mix(allTiles)
        let newBoard = this._chunkArray(allTiles, size.x)
        newGrid = newBoard
        updateAllTiles()
        return newGrid
    }

    private _mix(array) {
        for (let i = array.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]]
        }
    }

    private _chunkArray(array, size: number) {
        if (array.length > size) return [array.slice(0, size), this._chunkArray(array.slice(size), size)]
        else return [array]
    }
}

class GridDropper {

    private _rowsCount: number = 0
    private _columnCount: number = 0
    private _grid: Array<Array<Tile>> = []

    drop(grid: Array<Array<Tile>>, size: cc.Vec2) {
        this._grid = grid
        this._rowsCount = size.x
        this._columnCount = size.y
        return this._dropGrid()
    }
    private _dropGrid() {
        let r = []
        for (let i = this._rowsCount - 2; i >= 0; i--) {
            for (let j = 0; j < this._columnCount; j++) {
                let emptySpaces = this._emptySpaces(i, j)
                let tile = this._getTile(cc.v2(i, j))
                if (tile.isNormal && emptySpaces > 0) {
                    r.push(tile)
                    this._tileExchange(tile.position, cc.v2(i + emptySpaces, j))
                }
            }
        }
        return r
    }
    private _getTile(position: cc.Vec2) {
        return this._grid[position.x][position.y]
    }
    private _tileExchange(fromPos: cc.Vec2, toPos: cc.Vec2) {
        let setNewTile = (pos: cc.Vec2, newTile: Tile) => {
            this._grid[pos.x][pos.y] = newTile
            this._grid[pos.x][pos.y].updatePos(cc.v2(pos.x, pos.y))
        }
        let fromTile = Object.assign(this._grid[fromPos.x][fromPos.y])
        setNewTile(fromPos, this._getTile(toPos))
        setNewTile(toPos, fromTile)
    }
    private _emptySpaces(row: number, column: number) {
        let r = 0
        if (row != this._rowsCount) {
            for (let i = row + 1; i < this._rowsCount; i++) {
                this._getTile(cc.v2(i, column)).removed && r++ 
            }
        }
        return r
    }
}

class GridFiller {

    private _rowsCount: number = 0
    private _columnCount: number = 0
    private _grid: Array<Array<Tile>> = []

    fill(grid: Array<Array<Tile>>, size: cc.Vec2) {
        this._grid = grid
        this._rowsCount = size.x
        this._columnCount = size.y
        this._fillGrid()
        return this._grid

    }
    private _emptySpaces(row: number, column: number) {
        let r = 0
        if (row != this._rowsCount) {
            for (let i = row + 1; i < this._rowsCount; i++) {
                this._getTile(cc.v2(i, column)).removed && r++ 
            }
        }
        return r
    }
    private _getTile(position: cc.Vec2) {
        return this._grid[position.x][position.y]
    }

    private _fillGrid() {
        for (let i = 0; i < this._columnCount; i++) {
            if (this._grid[0][i].removed) {
                let emptySpaces = this._emptySpaces(0, i) + 1
                for (let j = 0; j < emptySpaces; j++) {
                    this._grid[j][i].updateState()
                }
            }
        }
    }

}

class GridFinder {

    private _connectedTilesArray: Array<Tile> = []
    private _grid: Array<Array<Tile>> = []

    find(grid: Array<Array<Tile>>, tile: cc.Vec2) {
        this._grid = grid
        return this._getConnectedTiles(tile)
    }
    private _getTile(position: cc.Vec2) {
        return this._grid[position.x][position.y]
    }
    private _isCheckTile = (tileCheck: Tile) => this._connectedTilesArray.find(tile => { return tile.position.x === tileCheck.position.x && tile.position.y === tileCheck.position.y }) != null
    private _isValidPick = (position: cc.Vec2) => this._grid[position.x]?.[position.y] != null
    
    private _findTilesChain(position: cc.Vec2, color) {
        if (!this._isValidPick(position)) return
        let tile = this._getTile(position)
        if (tile.removed) return
        
        if (tile.color == color && !this._isCheckTile(tile)) {
            this._connectedTilesArray.push(tile)
            this._findTilesChain(cc.v2(position.x + 1, position.y), color)
            this._findTilesChain(cc.v2(position.x - 1, position.y), color)
            this._findTilesChain(cc.v2(position.x, position.y + 1), color)
            this._findTilesChain(cc.v2(position.x, position.y - 1), color)
        }
    }
    private _getConnectedTiles(position: cc.Vec2) {
        this._connectedTilesArray = []
        let tileColor = this._getTile(position).color
        this._findTilesChain(position, tileColor)
        return this._connectedTilesArray
    }
}

export class GridRemover {

    private _connectedTilesArray: Array<Tile> = []
    private _grid: Array<Array<Tile>> = []

    remove(grid: Array<Array<Tile>>, tile: cc.Vec2) {
        this._grid = grid
        this._connectedTilesArray = []
        this._findLeft(tile, 1)
        this._findRight(tile, 1)
        return this._connectedTilesArray
    }

    private _getTile(position: cc.Vec2) {
        return this._grid[position.x][position.y]
    }

    private _isValidPick = (position: cc.Vec2) => this._grid[position.x]?.[position.y] != null

    private _findLeft(position: cc.Vec2, area: number) {
        for (let i = position.x; i <= position.x + area; i++) {
            for (let j = position.y - area; j <= position.y; j++) {
                this._addTile(i, j)
            }
            for (let j = position.y; j <= position.y + area; j++) {
                this._addTile(i, j)
            }
        }
    }
    private _findRight(position: cc.Vec2, area: number) {
        for (let i = position.x - area; i <= position.x; i++) {
            for (let j = position.y; j <= position.y + area; j++) {
                this._addTile(i, j)
            }
            for (let j = position.y - area; j <= position.y; j++) {
                this._addTile(i, j)
            }
        }
    }
    private _addTile(x: number, y: number) {
        if (this._isValidPick(cc.v2(x,y))) {
            let newTile = this._getTile(cc.v2(x, y))
            this._connectedTilesArray.push(newTile)
        }
    }
}
