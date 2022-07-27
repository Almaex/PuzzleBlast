import { Grid } from "./Grid"

export class GridMixer {
    private _grid: Grid = null

    mixGrid() {
        let currentGrid = this._grid.currentGrid
        const updateAllTiles = () => {
            for (let row = 0; row < this._grid.size.x; row++) {
                for (let column = 0; column < this._grid.size.y; column++) {
                    currentGrid[row][column].updatePos(cc.v2(row, column))
                }
            }
        }
        let allTiles = []
        currentGrid.forEach(r => allTiles = allTiles.concat(r))
        this._mix(allTiles)
        let newBoard = this._chunkArray(allTiles, this._grid.size.x)
        currentGrid = newBoard
        updateAllTiles()
        this.mixGrid()
    }

    private _mix(array) {
        for (let i = array.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]]
        }
    }

    private _chunkArray(array, size) {
        if (array.length > size) return [array.slice(0, size), this._chunkArray(array.slice(size), size)]
        else return [array]
    }
}