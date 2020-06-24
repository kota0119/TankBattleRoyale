const Tank = require('./Tank.js');
const SharedSettings = require('../public/js/SharedSettings.js');
const GameSettings = require('./GameSettings.js');

module.exports = class BotTank extends Tank {
    constructor( strNickName, setWall, setTank, setMine, level, tankTypeNum ) {
        super("[bot]", strNickName, setWall, setTank, setMine, level, tankTypeNum );
        this.isBot = true;
        this.objMovement['forward'] = true;
        this.hasTargetTank = false;
        this.hasTargetItem = false;
        this.failRotationCount = 0;
        this.cancelFowardBack = 0;
        this.SHOOT_PROBABILITY_PER_SEC_ORIGIN = GameSettings.BOTTANK_SHOOT_PROBABILITY_PER_SEC - Math.random();
        this.SHOOT_PROBABILITY_PER_SEC = this.SHOOT_PROBABILITY_PER_SEC_ORIGIN;
    }

    update( fDeltaTime, setWall, setTank, setMine ) {
        const returnObject = super.update( fDeltaTime, setWall, setTank, setMine );
        const bDrived = returnObject.bDrived;
        if( !bDrived && ( this.objMovement['forward'] || this.objMovement['back'] )  ) {
            if( this.hasTargetTank || this.hasTargetItem ) {
                this.setReverseMovement( 30 );
            } else {
                this.setFAngle( Math.random() * 2 * Math.PI, setWall, setTank, setMine );
            }
        } 

        if( this.iLife * 2 > this.iLifeMax ) {
            this.SHOOT_PROBABILITY_PER_SEC = this.SHOOT_PROBABILITY_PER_SEC_ORIGIN;
        } else {
            this.SHOOT_PROBABILITY_PER_SEC = this.SHOOT_PROBABILITY_PER_SEC_ORIGIN + 1.0;
        }

        return returnObject;
    }

    justifyMovement( enemyTank, nearestItem ) {
        let actionParam = 0;
        if( nearestItem ) {
            actionParam = 0;
        } else if( this.iLife * 2 <= this.iLifeMax ) {
            if( enemyTank && enemyTank.iLife * 3 <= this.iLife * 2 && !enemyTank.isTransparent ) {
                actionParam = 0;
            } else {
                actionParam = 1;
            }
        } else {
            if( enemyTank && enemyTank.iLife * 3 <= this.iLife && !enemyTank.isTransparent ) {
                actionParam = 0;
            } else if ( isNearEnemyTank( this, enemyTank ) && this.failRotationCount === 0 ) {
                actionParam = 2;
            }
        }

        this.setForwardBackStop( actionParam );

        function isNearEnemyTank( self, enemyTank ) {
            if( !enemyTank ) return false;
            const distance = Math.sqrt( Math.pow( self.fX - enemyTank.fX, 2 ) + Math.pow( self.fY - enemyTank.fY, 2 ) );
            return distance < GameSettings.BOTTANK_STOP_DISTANCE;
        }
    }

    setForwardBackStop( fbs ) {
        if( this.cancelFowardBack > 0 ) {
            this.cancelFowardBack--;
            return;
        }

        switch( fbs ) {
            case 0 :
                this.objMovement['forward'] = true;
                this.objMovement['back'] = false;
                break;
            case 1 :
                this.objMovement['forward'] = false;
                this.objMovement['back'] = true;
                break;
            case 2 :
                this.objMovement['forward'] = false;
                this.objMovement['back'] = false;
                break;
        }
    }

    setReverseMovement ( cancelTime ) {
        if( this.failRotationCount > 5 ) {
            if( this.objMovement['forward'] || this.objMovement['back'] ){
                this.objMovement['forward'] = !this.objMovement['forward'];
                this.objMovement['back'] = !this.objMovement['back'];
            } else {
                this.objMovement['forward'] = false;
                this.objMovement['back'] = true;
            }
            this.cancelFowardBack = cancelTime;
            return true;
        }

        return false;
    }

    setFAngle ( fAngle, setWall, setTank, setMine ) {
        const fAngle_old = this.fAngle;
        this.setPos( this.fX, this.fY, this.fWidth, this.fHeight, fAngle );
        if( !this.canMove( setWall, setTank, setMine ) ) {
            this.setPos( this.fX, this.fY, this.fWidth, this.fHeight, fAngle_old );
            this.failRotationCount++;
            return false;
        }
        this.failRotationCount = 0;
        this.cancelFowardBack = 0;
        return true;
    }

    changeTransparent( enemyTank ) {
        if( !this.tankType[SharedSettings.E_100] ) return;

        if( enemyTank && (enemyTank.tankTypeNum !== SharedSettings.Tiger_II) && !this.isTransparent && this.transGauge >= 10 && this.iLife * 4 <= this.iLifeMax * 3 ) {
            super.changeTransparent();
        } else if( (!enemyTank || (enemyTank.tankTypeNum === SharedSettings.Tiger_II) ) && this.isTransparent ) {
            super.changeTransparent();
        }
    }
}