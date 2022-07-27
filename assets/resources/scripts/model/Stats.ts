import Global from "../Global"
import { Event } from "../utils/EventHandler"

export const enum EndGameType {
    Win, 
    Lose
}

export class Stats {
    private _score: number = 0
    private _scoreToWin: number = 0 
    private _moves: number = 0

    onStatsUpdated = new Event
    onEndGame = new Event

    get score() { return this._score }
    get moves() { return this._moves }
    get scoreToWin() { return this._scoreToWin }
    
    constructor(scoreToWin: number, moves: number) {
        this._scoreToWin = scoreToWin
        this._moves = moves
        this._score = 0
    }

    changeStats(removedCount: number) {
        if (removedCount == 0) return
        this.checkEndGame()
        this._score += removedCount
        this._moves --
        this.onStatsUpdated.dispatch()
    }
    checkEndGame() {
        if (this._score >= this._scoreToWin) this.onEndGame.dispatch(EndGameType.Win)
        else if (this._moves == 0) this.onEndGame.dispatch(EndGameType.Lose)

    }

}