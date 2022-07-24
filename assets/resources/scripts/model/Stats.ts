
export class Stats {
    private _score: number = 0 
    private _moves: number = 0

    get score() { return this._score }
    get moves() { return this._moves }

    set score(score: number) { this._score = score }
    set moves(moves: number) { this._moves = moves }

    addMove(move: number) {
        this.moves += move
    }
    subtractMove() {
        this.moves --
    }

    addScore() {
        this.score ++
    }

}

