module.exports = class GameObject {
    constructor( fX, fY, iLifeMax, fAngle, maxLength ) {
        this.iLife = iLifeMax;
        this.iLifeMax = iLifeMax;
        this.setPos( fX, fY, fAngle, maxLength );
    }

    setPos( fX, fY, fAngle, maxLength ) {
        this.fX = fX;
        this.fY = fY;
        this.fAngle = fAngle;
        this.maxLength = maxLength;
        this.maxRectBound = {
            fLeft: this.fX - this.maxLength,
            fBottom: this.fY - this.maxLength,
            fRight: this.fX + this.maxLength,
            fTop: this.fY + this.maxLength,
        }
    }

    damage( lifeDamage ) {
        if( lifeDamage <= 0 ) return;
        this.iLife -= lifeDamage ;
        this.iLife = this.floor(this.iLife);
        if( this.iLife <= 0 ) this.iLife = 0;
        return this.iLife;
    }

    floor( value)  {
        const base = 100;
        return Math.floor(value * base) / base;
    }    
}