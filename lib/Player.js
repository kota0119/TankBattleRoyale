const RectangleObject = require('./lib_gameObject/RectangleObject.js');

module.exports = class Player extends RectangleObject {
    constructor( fX, fY, strSocketID ) {
        super( fX, fY, 0, 0, 10, 10 );
        this.fSpeed = 200;
        this.strSocketID = strSocketID;
        this.objMovement = {};
        this.isPlaying = false;
        this.tank = null;
        this.clientBrowserWidth = null;
        this.clientBrowserHeight = null;
    }

    update( fDeltaTime ) {
        if( this.tank && !this.tank.isDead ) {
            this.setPos( this.tank.fX, this.tank.fY, this.fWidth, this.fHeight, this.fAngle );
            return;
        }

        const fX_old = this.fX;
        const fY_old = this.fY;
        let bDrived = false;

        const fDistance = this.fSpeed * fDeltaTime;
        if( this.objMovement['forward'] ) {
            this.fY -= fDistance;
            bDrived = true;
        }

        if( this.objMovement['back'] ) {
            this.fY += fDistance;
            bDrived = true;
        }

        if( this.objMovement['left'] ) {
            this.fX -= fDistance;
            bDrived = true;
        }

        if( this.objMovement['right'] ) {
            this.fX += fDistance;
            bDrived = true;
        }

        if( bDrived ) {
            this.setPos( this.fX, this.fY, this.fWidth, this.fHeight, this.fAngle );
            if( this.isCollisionWithField() ) {
                this.setPos( fX_old, fY_old, this.fWidth, this.fHeight, this.fAngle );
            }
        }
    }

    setClientBrowserSize( clientBrowserWidth, clientBrowserHeight ) {
        this.clientBrowserWidth = Math.min(clientBrowserWidth , 2200);
        this.clientBrowserHeight = Math.min(clientBrowserHeight, 2200);
    }
}
