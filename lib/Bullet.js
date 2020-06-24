const RectangleObject = require('./lib_gameObject/RectangleObject.js');
const SharedSettings = require('../public/js/SharedSettings.js');
const GameSettings = require('./GameSettings.js');

module.exports = class Bullet extends RectangleObject {
    constructor( fX, fY, tank ) {
        super( fX, fY, tank.offensivePower, tank.fAngle, tank.bulletFWidth, tank.bulletFHeight );
        this.fSpeed = tank.bulletFSpeed;
        this.fLifeTime = tank.bulletFLifeTime;
        this.tank = tank;
        this.setPenetratedObject = new Set();
        this.setSlowing = new Set();

        if( this.tank.itemEffect[SharedSettings.itemDamegeIncreaseNum] > 0 ) {
            this.iLife = this.floor(this.iLife * GameSettings.ITEM_DAMEGEINCREASE_RATE);
            this.resetSize();
        }

        if( this.tank.tankType[SharedSettings.PzKpfwIV] ) {
            this.iLife = this.floor(this.iLife * 0.8);
            this.resetSize();
        }

        // クリティカルヒット
        if( Math.random() <= 0.05 ) {
            this.iLife = this.floor(this.iLife * 3);
            this.resetSize();
        }
    }

    update( fDeltaTime, setTank ) {
        if( this.tank.tankType[SharedSettings.PzKpfwIV] ) fDeltaTime *= 0.8;
        fDeltaTime *= Math.max( 1.0 - (this.setSlowing.size * 0.3), 0.1 );

        this.fLifeTime -= fDeltaTime;
        if( this.fLifeTime < 0 ) return true;
        const fDistance = this.fSpeed * fDeltaTime;

        if( this.tank.tankType[SharedSettings.PzKpfwIV] ) {
            if( this.target && this.setPenetratedObject.has(this.target) ) this.target = null;
            if( this.target && !setTank.has(this.target)) this.target = null;
            if( this.target && this.target.isTransparent && !this.tank.tankType[SharedSettings.Tiger_II] ) this.target = null;

            if( !this.target ) {
                let nearestTargetDistance = GameSettings.BOTTANK_NEAREST_ENEMY;
                setTank.forEach(
                    ( otherTank ) => {
                        if( this.tank === otherTank ) return;
                        if( this.setPenetratedObject.has(otherTank) ) return;
                        if( !setTank.has(otherTank)) return;
                        if( otherTank.isTransparent && !this.tank.tankType[SharedSettings.Tiger_II] ) return;
                        let distance = Math.sqrt( Math.pow( this.fX - otherTank.fX, 2 ) + Math.pow( this.fY - otherTank.fY, 2 ) );
                        if( distance <= nearestTargetDistance ) {
                            nearestTargetDistance = distance;
                            this.target = otherTank;
                        }
                    }
                )
            }

            if( this.target ) {
                this.fAngle = Math.atan2( this.target.fY - this.fY, this.target.fX - this.fX );  
            }
        }

        this.setPos( 
            this.fX + fDistance * Math.cos(this.fAngle),
            this.fY + fDistance * Math.sin(this.fAngle),
            this.fWidth, this.fHeight, this.fAngle
        );

        return this.isCollisionWithField();
    }

    damage( lifeDamage, gameObject ) {       
        this.setPenetratedObject.add(gameObject);

        if( this.tank.tankType[SharedSettings.PzKpfwIV_G] && !(gameObject instanceof Bullet) ){
            return this.iLife;
        }

        let iLife = super.damage( lifeDamage );
        this.resetSize();
        return iLife;
    }

    resetSize(){
        this.fWidth = GameSettings.BULLET_WIDTH + this.floor(this.iLife * 0.5);
        this.fHeight = GameSettings.BULLET_HEIGHT + this.floor(this.iLife * 0.5);
        this.setPos( this.fX, this.fY, this.fWidth, this.fHeight, this.fAngle );
    }

    toJSON( rectVisibleArea ) {
        if( !rectVisibleArea ) return;
        const isRenderInField = this.isOverlapWithVisibleArea( rectVisibleArea );
        const fieldJSON = {
            fX : this.fX,
            fY : this.fY,
            fWidth : this.fWidth,
            fHeight : this.fHeight,
            fAngle : this.fAngle,
            isRenderInField : isRenderInField,
        }

        return JSON.stringify(fieldJSON);
    }
}