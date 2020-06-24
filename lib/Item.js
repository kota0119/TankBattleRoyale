const CircleObject = require('./lib_gameObject/CircleObject.js');
const SharedSettings = require('../public/js/SharedSettings.js');

module.exports = class Item extends CircleObject {
    constructor( wall, itemTypeNum ) {
        super( wall.fX, wall.fY, 0, 0, 30 );
        this.fLifeTime = 30.0;
        this.itemTypeNum = itemTypeNum;
        this.isBuriedInWall = true;
        this.wall = wall;
    }

    update( fDeltaTime ) {
        if( this.isBuriedInWall ) return false;
        this.fLifeTime -= fDeltaTime;
        return this.fLifeTime < 0;
    }

    emitFilter( player ) {
        if( !this.isBuriedInWall ) return true;
        return player.tank && player.tank.tankType[SharedSettings.Tiger_II];
    }

    toJSON( rectVisibleArea ) {
        if( !rectVisibleArea ) return;
        const isRenderInField = this.isOverlapWithVisibleArea( rectVisibleArea );
        const mapJSON = {
            isRenderInField : isRenderInField,
        }
        if( !isRenderInField ) {
            return JSON.stringify(mapJSON);
        }

        const fieldJSON = {
            fX : this.fX,
            fY : this.fY,
            fRadius : this.fRadius,
            itemTypeNum : this.itemTypeNum,
            isBuriedInWall : this.isBuriedInWall,
        }

        return JSON.stringify(Object.assign( mapJSON, fieldJSON ));
    }
}