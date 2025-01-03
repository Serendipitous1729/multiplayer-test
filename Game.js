class Game {
    UID = 0; // unique id for each player
    players = [];
    addPlayer(player) {
        player.ID = this.UID++; // set, then increment
        this.players.push(player);
        return player;
    }
    removePlayer(player) {
        let indexOfPlayer = this.players.indexOf(player);
        if(indexOfPlayer === -1) {
            return false;
        }
        this.players.splice(indexOfPlayer, 1);
        return true;
    }
}

export {Game};