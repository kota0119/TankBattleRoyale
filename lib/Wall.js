const RectangleObject = require('./lib_gameObject/RectangleObject.js');
const SharedSettings = require('../public/js/SharedSettings.js');
const GameSettings = require('./GameSettings.js');

module.exports = class Wall extends RectangleObject {
    constructor( setWall, setTank, wallTypeNum ) {
        super( 0, 0, GameSettings.WALL_LIFE_MAX * (wallTypeNum + 1),  (0.5 - 1 * Math.random()) * Math.PI, SharedSettings.WALL_WIDTH, SharedSettings.WALL_HEIGHT );
        this.wallTypeNum = wallTypeNum;
        do{
            this.setPos(
                this.fWidth * 0.5 + Math.random() * ( SharedSettings.FIELD_WIDTH - this.fWidth * 0.5 ),
                this.fHeight * 0.5 + Math.random() * ( SharedSettings.FIELD_HEIGHT - this.fHeight * 0.5 ),
                this.fWidth, this.fHeight, this.fAngle
            );
        } while ( 
            this.isCollisionWithField() ||
            this.isCollisionWithSetRectangle(setTank) ||
            this.isCollisionWithSetRectangle(setWall) 
        );
    }

    toJSON( rectVisibleArea ) {
        if( !rectVisibleArea ) return;
        const isRenderInField = this.isOverlapWithVisibleArea( rectVisibleArea );

        const mapJSON = {
            fX : this.fX,
            fY : this.fY,
            fWidth : this.fWidth,
            fHeight : this.fHeight,
            fAngle : this.fAngle,
            wallTypeNum : this.wallTypeNum,
            isRenderInField : isRenderInField,
        }

        if( !isRenderInField ) {
            return JSON.stringify(mapJSON);
        }

        const fieldJSON = {
            iLife : this.iLife,
            iLifeMax : this.iLifeMax,
        }
        
        return JSON.stringify(Object.assign( mapJSON, fieldJSON ));
    }
}