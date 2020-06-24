const CircleObject = require('./lib_gameObject/CircleObject.js');
const SharedSettings = require('../public/js/SharedSettings.js');
const GameSettings = require('./GameSettings.js');

module.exports = class Shield extends CircleObject {
    constructor( tank ) {
        super( tank.fX, tank.fY, tank.iLifeMax, tank.fAngle, tank.shieldRadius );
        this.iLifeMax = tank.iLifeMax;
        this.iLfe = this.iLifeMax;
        this.tank = tank;
        this.isActive = true;

        // 1秒間あたりの回復量: シールドHPの2%
        setInterval(
            () => {
                if( this.tank.itemEffect[SharedSettings.itemRecoveryUpNum] > 0 ) {
                    this.iLife = Math.min( this.iLifeMax, this.floor(this.iLife + this.iLifeMax * (0.02 + GameSettings.ITEM_RECOVERYUP_RATE)) );
                } else {
                    this.iLife = Math.min( this.iLifeMax, this.floor(this.iLife + this.iLifeMax * 0.02) );
                }
            },
            1000
        );
    }

    update() {
        this.iLifeMax = this.tank.iLifeMax;
        if( this.iLife === this.iLifeMax ) this.isActive = true;
        this.setPos(
            this.tank.fX,
            this.tank.fY,
            this.tank.fAngle,
            this.tank.shieldRadius
        );
    }

    damage( lifeDamage ) {
        let damage = lifeDamage;
        if( this.tank.itemEffect[SharedSettings.itemDamegeDecreaseNum] > 0 ) {
            damage = this.floor( lifeDamage * GameSettings.ITEM_DAMEGEDECREASE_RATE )
        }
        const iLife = super.damage( damage );
        if( iLife <= 0 ) this.isActive = false;
        return iLife;
    }

    emitFilter( player ) {
        if( !this.tank.isTransparent ) return true;
        if( !player.tank ) return false;
        if( player.tank.uniqueID === this.tank.uniqueID ) return true;
        if( player.tank.tankType[SharedSettings.Tiger_II] ) return true;
        return false;
    }

    toJSON( rectVisibleArea ) {
        if( !rectVisibleArea ) return;
        const isRenderInField = this.isOverlapWithVisibleArea( rectVisibleArea );
        const mapJSON = {
            isRenderInField : isRenderInField,
        }

        if( !isRenderInField ) {
            return JSON.stringify(mapJSON);
        }

        const fieldJSON = {
            fX : this.fX,
            fY : this.fY,
            fRadius : this.fRadius,
            iLife : this.iLife,
            iLifeMax : this.iLifeMax,
            isActive : this.isActive,
            tankFWidth : this.tank.fWidth,
            tankMaxLength : this.tank.maxLength,
            tankIsTransparent : this.tank.isTransparent,
        }
        
        return JSON.stringify(Object.assign( mapJSON, fieldJSON ));
    }
}