const Vector2D = require('./Vector2D.js');
const Range = require('./Range.js');

class LineSegment2D {
    constructor( point1, point2 ) {
        this.point1 = point1;
        this.point2 = point2;
    }
}

module.exports = class OrientedRectangle {
    constructor( centerX, centerY, halfExtendX, halfExtendY, rotation ) {
        this.center = new Vector2D( centerX, centerY );
        this.halfExtend = new Vector2D( halfExtendX, halfExtendY );
        this.rotation = rotation;
    }

    setParameter( centerX, centerY, halfExtendX, halfExtendY, rotation ) {
        this.center.x = centerX;
        this.center.y = centerY;
        this.halfExtend.x = halfExtendX;
        this.halfExtend.y = halfExtendY;
        this.rotation = rotation;
    }

    getAccurateRectBound () {
        let vector = [];
        vector[0] = this.halfExtend
        vector[1] = new Vector2D( this.halfExtend.x, -this.halfExtend.y );
        vector[2] = Vector2D.getInversionVector( vector[0] );
        vector[3] = Vector2D.getInversionVector( vector[1] );

        vector = vector.map(
            (vec) => {
                vec = Vector2D.getRotateVector( vec, this.rotation );
                vec = Vector2D.getAddVector( vec, this.center );
                return vec;
            }
        )

        const xMin = vector.reduce(
            ( result, current ) => {
                if( result === null ) return current;
                return ( result.x > current.x ) ? current : result;
            },
            null
        ).x;

        const xMax = vector.reduce(
            ( result, current ) => {
                if( result === null ) return current;
                return ( result.x < current.x ) ? current : result;
            },
            null
        ).x;

        const yMin = vector.reduce(
            ( result, current ) => {
                if( result === null ) return current;
                return ( result.y > current.y ) ? current : result;
            },
            null
        ).y

        const yMax = vector.reduce(
            ( result, current ) => {
                if( result === null ) return current;
                return ( result.y < current.y ) ? current : result;
            },
            null
        ).y

        return {
            fLeft: xMin,
            fRight: xMax,
            fBottom: yMin,
            fTop: yMax,
        }
    }

    getOrientedRectangleEdge ( point ) {
        let vecA = new Vector2D( this.halfExtend.x, this.halfExtend.y );
        let vecB = new Vector2D( this.halfExtend.x, this.halfExtend.y );
    
        switch( point % 4 ) {
            case 0:  // top edge
                vecA.x = -vecA.x;
                break;
            case 1:  // right edge
                vecB.y = -vecB.y;
                break;
            case 2:  // bottom edge
                vecA.y = -vecA.y;
                vecB = Vector2D.getInversionVector(vecB)
                break;
            case 3:  // left edge
                vecA = Vector2D.getInversionVector(vecA);
                vecB.x = -vecB.x;
                break;
        }
    
        vecA = Vector2D.getRotateVector( vecA, this.rotation );
        vecA = Vector2D.getAddVector( vecA, this.center );
    
        vecB = Vector2D.getRotateVector( vecB, this.rotation );
        vecB = Vector2D.getAddVector( vecB, this.center );
    
        let edge = new LineSegment2D();
        edge.point1 = vecA;
        edge.point2 = vecB;
        return edge;
    }

    isSeparatingAxisForOrientedRectangle( axis ) {
        let edgeTop = this.getOrientedRectangleEdge(0);
        let edgeBottom = this.getOrientedRectangleEdge(2);

        let unitAxis = Vector2D.getSubtractVector( axis.point1, axis.point2 );
        unitAxis = Vector2D.getUnitVector(unitAxis);

        let axisRange = Range.getSegmentRange( axis, unitAxis );
        let topRange = Range.getSegmentRange( edgeTop, unitAxis );
        let bottomRange = Range.getSegmentRange( edgeBottom, unitAxis );
        let mergedRange = Range.getMergeRange( topRange, bottomRange );

        return !Range.isOverLappingRanges( axisRange, mergedRange );
    }

    static isOrientedRectangleCollision( orect1, orect2 ) {
        const orect1TopEdge = orect1.getOrientedRectangleEdge(0);
        if( orect2.isSeparatingAxisForOrientedRectangle(orect1TopEdge) ) {
            return false;
        }

        const orect1RightEdge = orect1.getOrientedRectangleEdge(1);
        if( orect2.isSeparatingAxisForOrientedRectangle(orect1RightEdge) ) {
            return false;
        }

        const orect2TopEdge = orect2.getOrientedRectangleEdge(0);
        if( orect1.isSeparatingAxisForOrientedRectangle(orect2TopEdge) ) {
            return false;
        }

        const orect2BottomEdge = orect2.getOrientedRectangleEdge(1);
        if( orect1.isSeparatingAxisForOrientedRectangle(orect2BottomEdge) ) {
            return false;
        }

        return true;
    }
}