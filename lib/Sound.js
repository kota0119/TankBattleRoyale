const CircleObject = require('./lib_gameObject/CircleObject.js');

module.exports = class Sound extends CircleObject  {
    constructor( gameObject, soundTypeNum ) {
        super( gameObject.fX, gameObject.fY, 0, 0, 200 );
        this.soundTypeNum = soundTypeNum;
        this.isEmitted = false;
    }

    update() {
        return this.isEmitted;
    }

    emitEndUpdate (){
        this.isEmitted = true;
    }

    toJSON( rectVisibleArea ) {
        if( !rectVisibleArea ) return;
        if( this.isEmitted ) return;
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
            soundTypeNum : this.soundTypeNum,
        }

        return JSON.stringify(Object.assign( mapJSON, fieldJSON ));
    }
}