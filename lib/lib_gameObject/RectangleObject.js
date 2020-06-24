const GameObject = require('./GameObject.js');
const OrientedRectangle = require('../lib_2D/OrientedRectangle.js');
const Circle = require('../lib_2D/Circle.js');
const OverlapChecker = require('./OverlapChecker.js');
const GameSettings = require('../GameSettings.js');

module.exports = class RectangleObject extends GameObject {
    constructor( fX, fY, iLifeMax, fAngle, fWidth, fHeight ) {
        super( fX, fY, iLifeMax, fAngle, OverlapChecker.getMaxLength(fWidth, fHeight) );
        this.rectangleObject = new OrientedRectangle( fX, fY, fWidth * 0.5, fHeight * 0.5, fAngle );
        this.setPos( fX, fY, fWidth, fHeight, fAngle );
    }

    setPos( fX, fY, fWidth, fHeight, fAngle ) {
        super.setPos( fX, fY, fAngle, OverlapChecker.getMaxLength(fWidth, fHeight) );
        this.fWidth = fWidth;
        this.fHeight = fHeight;
        this.heightRectBound = {
            fLeft: this.fX - this.fHeight * 0.5,
            fBottom: this.fY - this.fHeight * 0.5,
            fRight: this.fX + this.fHeight * 0.5,
            fTop: this.fY + this.fHeight * 0.5,
        }

        if( this.rectangleObject ) this.rectangleObject.setParameter( this.fX, this.fY, this.fWidth * 0.5, this.fHeight * 0.5, fAngle );
    }

    isOverlapWithVisibleArea ( rectVisibleArea ) {
        return OverlapChecker.isRectBoundOverlapWithRectArea( this.maxRectBound, rectVisibleArea );
    }

    isCollisionWithField () {
        if( OverlapChecker.isRectBoundInRectArea( this.maxRectBound, OverlapChecker.RECTFIELD ) ) return false;
        const accurateRectBound = this.rectangleObject.getAccurateRectBound();
        return !OverlapChecker.isRectBoundInRectArea( accurateRectBound, OverlapChecker.RECTFIELD );
    }

    isCollisionWithFieldForTankMove () {
        return !OverlapChecker.isRectBoundInRectArea( this.heightRectBound, OverlapChecker.RECTFIELD );
    }

    isCollisionWithRectangle( rectangleObj ) {
        if( this === rectangleObj ) return false;
        if( OverlapChecker.isEnoughFarFrom( this, rectangleObj ) ) return false;
        return OrientedRectangle.isOrientedRectangleCollision(this.rectangleObject, rectangleObj.rectangleObject);
    }

    isCollisionWithCircle( circleObj ) {
        if( OverlapChecker.isEnoughFarFrom( this, circleObj ) ) return false;
        return Circle.isOrientedRectangleCollision( circleObj.circleObject, this.rectangleObject );
    }

    isCollisionWithSetRectangle( setRectangleObject ) {
        return Array.from( setRectangleObject ).some(
            ( rectangleObj ) => {
                return this.isCollisionWithRectangle( rectangleObj );
            }
        );
    }

    isCollisionWithSetCircle( setCircleObject ) {
        return Array.from( setCircleObject ).some(
            ( circleObj ) => {
                return this.isCollisionWithCircle( circleObj );
            }
        );
    }

    isEnoughFarFromOtherTanksWhenStarting ( setTank ) {
        return Array.from( setTank ).every(
            ( tank ) => {
                if( this === tank ) return true;
                return OverlapChecker.isEnoughFarFrom( this, tank, GameSettings.TANK_STARTING_MIN_DISTANCE );
            }
        );
    }
}