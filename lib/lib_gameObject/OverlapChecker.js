const SharedSettings = require('../../public/js/SharedSettings.js');

module.exports = class OverlapChecker {

    static isRectBoundOverlapWithRectArea( rectBound, rectArea ) {
        if( rectArea.fLeft > rectBound.fRight ) return false;
        if( rectArea.fRight < rectBound.fLeft ) return false;
        if( rectArea.fBottom > rectBound.fTop ) return false;
        if( rectArea.fTop < rectBound.fBottom ) return false;
        return true;
    }

    static isRectBoundInRectArea ( rectBound, rectArea ) {
        return rectArea.fLeft <= rectBound.fLeft &&
        rectArea.fBottom <= rectBound.fBottom &&
        rectArea.fRight >= rectBound.fRight &&
        rectArea.fTop >= rectBound.fTop;
    }

    static isEnoughFarFrom( gameObject1, gameObject2, distance ) {
        const minDistance = (distance === undefined) ? 0 : distance;
        const centerDistance = Math.sqrt(Math.pow( (gameObject1.fX - gameObject2.fX ), 2 ) + Math.pow( (gameObject1.fY - gameObject2.fY), 2 ));
        const maxLengthDistance = gameObject1.maxLength + gameObject2.maxLength;
        return centerDistance - maxLengthDistance > minDistance;
    }

    static getMaxLength( fWidth, fHeight ) {
        return Math.ceil(Math.sqrt(Math.pow(fWidth * 0.5, 2) + Math.pow(fHeight * 0.5, 2)));
    }

    static get RECTFIELD() {
        return {
            fLeft: 0,
            fBottom: 0,
            fRight: SharedSettings.FIELD_WIDTH,
            fTop: SharedSettings.FIELD_HEIGHT,
        };
    }
}