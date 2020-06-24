const Vector2D = require('./Vector2D.js');
const OrientedRectangle = require('./OrientedRectangle.js');

module.exports = class Circle {
    constructor( centerX, centerY, radius ) {
        this.center = new Vector2D( centerX, centerY );
        this.radius = radius;
    }

    setParameter( centerX, centerY, radius ) {
        this.center.x = centerX;
        this.center.y = centerY;
        this.radius = radius;
    }

    isPointCollision( point ) {
        const distance = Vector2D.getSubtractVector( this.center, point );
        return Vector2D.getVectorLength2D(distance) <= this.radius;
    }

    clampOnRectangle( rectangle ) {
        let clampX = clampOnRange( this.center.x, rectangle.center.x - rectangle.halfExtend.x, rectangle.center.x + rectangle.halfExtend.x );
        let clampY = clampOnRange( this.center.y, rectangle.center.y - rectangle.halfExtend.y, rectangle.center.y + rectangle.halfExtend.y );
        return new Vector2D( clampX, clampY );

        function clampOnRange( x, min, max ) {
            return Math.min(max, Math.max(x, min));
        }
    }

    circleRectangleCollision( rectangle ) {
        let clampPoint = this.clampOnRectangle( rectangle );
        return this.isPointCollision( clampPoint );
    }

    static isCircleCollision( circle1, circle2 ) {
        const centerDistanceP2 = Math.pow( (circle1.center.x - circle2.center.x), 2 ) + Math.pow( (circle1.center.y - circle2.center.y), 2 );
        const radiusDistanceP2 = Math.pow( (circle1.radius + circle2.radius), 2 );
        return centerDistanceP2 <= radiusDistanceP2;
    }

    static isOrientedRectangleCollision( circle, orientedRectangle ) {
        let createRectangle = new OrientedRectangle( 
            orientedRectangle.halfExtend.x, 
            orientedRectangle.halfExtend.y, 
            orientedRectangle.halfExtend.x, 
            orientedRectangle.halfExtend.y,
            0 
        );
        let distance = Vector2D.getSubtractVector( circle.center, orientedRectangle.center );
        distance = Vector2D.getRotateVector( distance, -orientedRectangle.rotation );
        let circleCenter = Vector2D.getAddVector( distance, orientedRectangle.halfExtend );
        let createCircle = new Circle( 
            circleCenter.x, 
            circleCenter.y, 
            circle.radius 
        );
        return createCircle.circleRectangleCollision( createRectangle );
    }
}