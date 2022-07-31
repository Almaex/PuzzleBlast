
import { Tile } from "./Tile"

export enum GridAct {
    Mix,
    Drop,
    Fill,
    Find,
    Remove
}

export class GridUtils {
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
