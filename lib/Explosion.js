const RectangleObject = require('./lib_gameObject/RectangleObject.js');
const GameSettings = require('./GameSettings.js');

module.exports = class Explosion extends RectangleObject {
    constructor( attacker, gameObject , damage) {
        super( attacker.fX, attacker.fY, 0, 0, GameSettings.EXPLOSION_WIDTH, GameSettings.EXPLOSION_HEIGHT );
        this.gameObject = gameObject;
        this.explosionDistance = Math.sqrt( Math.pow(attacker.fX - gameObject.fX, 2) + Math.pow(attacker.fY - gameObject.fY, 2) );
        this.explosionAngle = Math.atan2( ( attacker.fY - gameObject.fY ), ( attacker.fX - gameObject.fX ) );
        this.gameObjectFAngleOrigin = gameObject.fAngle;
        this.damage = damage;
        this.imageIndex = 0;
        this.calcPos();
    }

    update() {
        if( this.gameObject && this.gameObject.iLife > 0 ) {
            this.calcPos();
        }
        return this.imageIndex > 15;
    }

    emitEndUpdate() {
        this.imageIndex++;
    }

    calcPos() {
        this.fX = this.gameObject.fX + this.explosionDistance * Math.cos( this.explosionAngle + (this.gameObject.fAngle - this.gameObjectFAngleOrigin) );
        this.fY = this.gameObject.fY + this.explosionDistance * Math.sin( this.explosionAngle + (this.gameObject.fAngle - this.gameObjectFAngleOrigin) );
        this.fWidth = GameSettings.EXPLOSION_WIDTH + this.floor(this.damage * 0.75);
        this.fHeight = GameSettings.EXPLOSION_HEIGHT + this.floor(this.damage * 0.75);
        this.setPos( this.fX, this.fY, this.fWidth, this.fHeight, 0 );
    }

    toJSON( rectVisibleArea ) {
        if( !rectVisibleArea ) return;
        const isRenderInField = this.isOverlapWithVisibleArea( rectVisibleArea );
        const mapJSON = {
            isRenderInField : isRenderInField,
        }
        if( !isRenderInField || this.imageIndex > 15 ) {
            return JSON.stringify(mapJSON);
        }

        const fieldJSON = {
            fX : this.fX,
            fY : this.fY,
            fWidth : this.fWidth,
            fHeight : this.fHeight,
            imageIndex : this.imageIndex,
        }

        return JSON.stringify(Object.assign( mapJSON, fieldJSON ));
    }
}