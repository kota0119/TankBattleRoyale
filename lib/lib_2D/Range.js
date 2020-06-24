const Vector2D = require('./Vector2D.js');

module.exports = class Range {
    constructor(val1, val2) {
        if( val1 < val2 ) {
            this.min = val1;
            this.max = val2;
        } else {
            this.min = val2;
            this.max = val1;
        }
    }

    static getMergeRange( range1, range2 ) {
        let min = range1.min < range2.min ? range1.min : range2.min;
        let max = range1.max < range2.max ? range2.max : range1.max;
        return new Range( min, max );
    }

    static getSegmentRange( segment, onto ) {
        let ontoUnitVector = Vector2D.getUnitVector(onto);
        let value1 = Vector2D.dotProduct2D( ontoUnitVector, segment.point1 );
        let value2 = Vector2D.dotProduct2D( ontoUnitVector, segment.point2 );
        return new Range( value1, value2 );
    }

    static isOverLappingRanges( range1, range2 ) {
        return range1.min <= range2.max && range2.min <= range1.max;
    }
}