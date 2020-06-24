const GameObject = require('./GameObject.js');
const Circle = require('../lib_2D/Circle.js');
const OverlapChecker = require('./OverlapChecker.js');

module.exports = class CircleObject extends GameObject {
    constructor( fX, fY, iLifeMax, fAngle, fRadius ) {
        super( fX, fY, iLifeMax, fAngle, fRadius );
        this.circleObject = new Circle( fX, fY, fRadius );
        this.setPos( fX, fY, fAngle, fRadius );
    }

    setPos( fX, fY, fAngle, fRadius ) {
        super.setPos( fX, fY, fAngle, fRadius );
        this.fRadius = fRadius;
        if( this.circleObject ) this.circleObject.setParameter( this.fX, this.fY, this.fRadius );
    }

    isOverlapWithVisibleArea ( rectVisibleArea ) {
        return OverlapChecker.isRectBoundOverlapWithRectArea( this.maxRectBound, rectVisibleArea );
    }

    isCollisionWithField () {
        return !OverlapChecker.isRectBoundInRectArea( this.maxRectBound, OverlapChecker.RECTFIELD );
    }

    isCollisionWithRectangle( rectangleObj ) {
        if( OverlapChecker.isEnoughFarFrom( this, rectangleObj ) ) return false;
        return Circle.isOrientedRectangleCollision( this.circleObject, rectangleObj.rectangleObject );
    }

    isCollisionWithCircle( circleObj ) {
        if( this === circleObj ) return false;
        if( OverlapChecker.isEnoughFarFrom( this, circleObj ) ) return false;
        return Circle.isCircleCollision( this.circleObject, circleObj.circleObject );
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
}