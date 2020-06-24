module.exports = class KillLog{
    constructor( winnerTank, loserTank ){
        this.winnerTankNickName = winnerTank.strNickName;
        this.winnerTankUniqueID = winnerTank.uniqueID;        
        this.winnerTankIsBot = winnerTank.isBot;
        this.loserTankNickName = loserTank.strNickName;
        this.loserTankUniqueID = loserTank.uniqueID;
        this.loserTankIsBot = loserTank.isBot;
        this.fLifeTime = 20.0;
    }

    update(fDeltaTime){
        this.fLifeTime -= fDeltaTime;
        return this.fLifeTime < 0;
    }

    toJSON() {
        const fieldJSON = {
            winnerTankNickName : this.winnerTankNickName,
            winnerTankUniqueID : this.winnerTankUniqueID,
            winnerTankIsBot : this.winnerTankIsBot,
            loserTankNickName : this.loserTankNickName,
            loserTankUniqueID : this.loserTankUniqueID,
            loserTankIsBot : this.loserTankIsBot,
            fLifeTime : this.fLifeTime,
        }

        return JSON.stringify(fieldJSON);
    }
}