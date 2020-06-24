module.exports = class Vector2D {
    constructor( x, y ) {
        this.x = x;
        this.y = y;
    }

    // ベクトルの足し算
    static getAddVector( vector1, vector2 ) {
        return new Vector2D( vector1.x + vector2.x, vector1.y + vector2.y );
    }

    // ベクトルの引き算
    static getSubtractVector( vector1, vector2 ) {
        return new Vector2D( vector1.x - vector2.x, vector1.y - vector2.y );
    }

    // ベクトルの掛け算
    static getMultiplyVector( vector, scalar ) {
        return new Vector2D( vector.x * scalar, vector.y * scalar );
    }

    //　ベクトルの割り算
    static getDivideVector( vector, length ) {
        if( length === 0 ) return vector; 
        return new Vector2D( vector.x / length, vector.y / length );
    }    

    // 逆ベクトルを返す
    static getInversionVector( vector ) {
        return new Vector2D( -vector.x, -vector.y );
    }

    // 回転させたベクトルを返す
    static getRotateVector( vector, radian ) {
        let sin = Math.sin( radian );
        let cos = Math.cos( radian );

        let r = new Vector2D();
        r.x = vector.x * cos - vector.y * sin;
        r.y = vector.x * sin + vector.y * cos;
        return r;
    }

    // ベクトルの長さを返す
    static getVectorLength2D( vector ) {
        return Math.sqrt( Math.pow( vector.x, 2 ) + Math.pow( vector.y, 2 ) );
    }

    // 単位ベクトルを返す
    static getUnitVector( vector ) {
        let length = this.getVectorLength2D( vector );
        return this.getDivideVector(vector, length);
    }

    // 内積を求める
    static dotProduct2D( vector1, vector2 ) {
        return vector1.x * vector2.x + vector1.y * vector2.y;
    }
}