const CircleObject = require('./lib_gameObject/CircleObject.js');
const SharedSettings = require('../public/js/SharedSettings.js');
const GameSettings = require('./GameSettings.js');

module.exports = class Landmine extends CircleObject {
    constructor( tank ) {
        super( tank.fX, tank.fY, Math.floor(tank.offensivePower), 0, tank.mineRadius );
        this.iLifeMax = this.floor(tank.offensivePower);
        this.iLife = this.iLifeMax;
        this.tank = tank;
        this.fLifeTime = tank.bulletFLifeTime * 20.0;

        if( this.tank.itemEffect[SharedSettings.itemDamegeIncreaseNum] > 0 ) {
            this.iLife = this.floor(this.iLife * GameSettings.ITEM_DAMEGEINCREASE_RATE);
            this.fRadius = GameSettings.MINE_RADIUS + this.iLife * 0.5;
        }
    }

    update( fDeltaTime ) {
        this.fLifeTime -= fDeltaTime;
        return this.fLifeTime < 0;
    }

    emitFilter( player ) {
        if( !player.tank ) return false;
        if( player.tank.uniqueID === this.tank.uniqueID ) return true;
        if( player.tank.tankType[SharedSettings.Tiger_II] ) return true;
        return false;
    }

    toJSON( rectVisibleArea ) {
        if( !rectVisibleArea ) return;
        const isRenderInField = this.isOverlapWithVisibleArea( rectVisibleArea );
        const fieldJSON = {
            fX : this.fX,
            fY : this.fY,
            fRadius : this.fRadius,
            tankUniqueID : this.tank.uniqueID,
            isRenderInField : isRenderInField,
        }

        return JSON.stringify(fieldJSON);
    }
}