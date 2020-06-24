const CircleObject = require('./lib_gameObject/CircleObject.js');
const SharedSettings = require('../public/js/SharedSettings.js');

module.exports = class SlowField extends CircleObject {
    constructor( tank ) {
        super( tank.fX, tank.fY, 0, tank.fAngle, tank.slowFieldRadius );
        this.tank = tank;
    }

    update() {
        this.setPos(
            this.tank.fX,
            this.tank.fY,
            this.tank.fAngle,
            this.tank.slowFieldRadius
        );
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
            tankIsDead : this.tank.isDead,
            tankIsTransparent : this.tank.isTransparent,
        }
        
        return JSON.stringify(Object.assign( mapJSON, fieldJSON ));
    }
}
