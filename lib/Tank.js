const RectangleObject = require('./lib_gameObject/RectangleObject.js');
const Bullet = require('./Bullet.js');
const Landmine = require('./Landmine.js');
const Shield = require('./Shield.js');
const SlowField = require('./SlowField.js');
const SharedSettings = require('../public/js/SharedSettings.js');
const GameSettings = require('./GameSettings.js');

module.exports = class Tank extends RectangleObject {
    constructor( strSocketID, strNickName, setWall, setTank, setMine, level, tankTypeNum ) {
        super( 0, 0, GameSettings.TANK_LIFE_MAX, 0, 0, 0 );
        this.uniqueID = this.getUniqueID();
        this.tankTypeNum = tankTypeNum;
        this.tankType = new Array(Object.keys(SharedSettings.TANK_TYPE_INFO).length).fill(false);
        this.tankType[tankTypeNum] = true;
        this.strSocketID = strSocketID;
        this.strNickName = strNickName;
        this.objMovement = {};
        this.iTimeLastShoot = 0;
        this.fRotationSpeed = GameSettings.TANK_ROTATION_SPEED;
        this.level = level;
        this.isDead = false;
        this.setSlowing = new Set();
        this.itemEffect = new Array(SharedSettings.itemTotalNumber).fill(0);

        // 余裕があれば動的計画法でiScore算出をリファクタリング
        this.iScore = 0;
        for( let i = 1; i < this.level; i++ ){
            this.iScore += Math.floor(35 * Math.pow( 1.1, (i - 1) ) );
        }
        this.requiredScore = Math.floor(35 * Math.pow( 1.1, (this.level - 1) ) );
        this.spended_iScore = this.iScore;
        this.aquiredScore = this.iScore - this.spended_iScore;

        // 1秒間あたりの回復量: HPの1%
        setInterval(
            () => {
                if( this.itemEffect[SharedSettings.itemRecoveryUpNum] > 0 ) {
                    this.iLife = Math.min( this.iLifeMax, this.floor(this.iLife + this.iLifeMax * (0.01 + GameSettings.ITEM_RECOVERYUP_RATE)) );
                } else {
                    this.iLife = Math.min( this.iLifeMax, this.floor(this.iLife + this.iLifeMax * 0.01) );
                }

                if( this.itemEffect[SharedSettings.itemRecoveryUpNum] > 0 ) this.itemEffect[SharedSettings.itemRecoveryUpNum]--;
                if( this.itemEffect[SharedSettings.itemSpeedUpNum] > 0 ) this.itemEffect[SharedSettings.itemSpeedUpNum]--;
                if( this.itemEffect[SharedSettings.itemDamegeDecreaseNum] > 0 ) this.itemEffect[SharedSettings.itemDamegeDecreaseNum]--;
                if( this.itemEffect[SharedSettings.itemDamegeIncreaseNum] > 0 ) this.itemEffect[SharedSettings.itemDamegeIncreaseNum]--;
            },
            1000
        );

        this.updateStatus();

        do{
            this.setPos(
                this.fWidth * 0.5 + Math.random() * ( SharedSettings.FIELD_WIDTH - this.fWidth * 0.5 ),
                this.fHeight * 0.5 + Math.random() * ( SharedSettings.FIELD_HEIGHT - this.fHeight * 0.5 ),
                this.fWidth, this.fHeight, this.fAngle
            );
        } while ( 
            this.isCollisionWithFieldForTankMove() ||
            !this.isEnoughFarFromOtherTanksWhenStarting(setTank) ||
            this.isCollisionWithSetRectangle(setWall)  ||
            this.isCollisionWithSetCircle(setMine)
        );

        this.mineNum = 0;
        this.transGauge = this.transGaugeMax;
        this.isTransparent = false;
        this.stealthShootPosition = null;
        this.setTransparentInterval();
    }

    levelUp() {
        this.aquiredScore = this.iScore - this.spended_iScore;
        if( this.aquiredScore < this.requiredScore ) return false;

        if( this.level >= SharedSettings.TANK_MAX_LEVEL ){
            this.iLife = this.iLifeMax;
            this.spended_iScore += this.requiredScore;
            this.aquiredScore = this.iScore - this.spended_iScore;
            this.requiredScore = Math.floor(35 * Math.pow( 1.1, (this.level - 1) ) );
            return true;
        } 

        while( this.aquiredScore >= this.requiredScore ) {
            this.spended_iScore += this.requiredScore;
            this.aquiredScore = this.iScore - this.spended_iScore;
            this.level++;
            this.requiredScore = Math.floor(35 * Math.pow( 1.1, (this.level - 1) ) );
        }

        this.updateStatus();
        return true;
    }

    updateStatus() {
        // HP: 135 + レベル * 15
        this.iLifeMax = GameSettings.TANK_LIFE_MAX + this.level * 15;
        this.iLife = this.iLifeMax;
        // 速度: 350 - レベル
        this.fSpeed = GameSettings.TANK_SPEED - this.level * 1.5;

        // 大きさ
        this.fWidth = this.floor( SharedSettings.TANK_TYPE_INFO[this.tankTypeNum].sw * 0.8 * (0.8 + 0.017 * this.level) );
        this.fHeight = this.floor( SharedSettings.TANK_TYPE_INFO[this.tankTypeNum].sh * (0.8 + 0.017 * this.level) );
        this.setPos( this.fX, this.fY, this.fWidth, this.fHeight, this.fAngle );

        this.offensivePower = GameSettings.TANK_OFFENSIVE_POWER + this.level;

        // 弾丸の速度: 500 + レベル * 2
        this.bulletFSpeed = GameSettings.BULLET_SPEED + this.level * 1.5;
        this.bulletFWidth = GameSettings.BULLET_WIDTH + this.offensivePower * 0.5;
        this.bulletFHeight = GameSettings.BULLET_HEIGHT + this.offensivePower * 0.5;
        this.bulletFLifeTime = GameSettings.BULLET_LIFETIME_MAX + this.level / 20.0;

        this.mineRadius = GameSettings.MINE_RADIUS + this.offensivePower * 0.5;
        this.mineNumMax = GameSettings.MINE_NUM_MAX + Math.floor(this.level / 3.0);

        this.slowFieldRadius = GameSettings.SLOWFIELD_RADIUS + this.level * 5;

        this.shieldRadius = this.maxLength + 30;

        this.transGaugeMax = GameSettings.TRANSPARENT_BASE_TIME + this.level * GameSettings.TRANSPARENT_LEVELUP_GAUGE_INCREASE;
    }

    update( fDeltaTime, setWall, setTank, setMine ) {
        if( this.itemEffect[SharedSettings.itemSpeedUpNum] > 0 ) {
            fDeltaTime *= GameSettings.ITEM_SPEEDUP_RATE;
        }
        fDeltaTime *= Math.max( 1.0 - (this.setSlowing.size * 0.3), 0.1 );
        const isLevelUp = this.levelUp();

        const fX_old = this.fX;
        const fY_old = this.fY;
        const fAngle_old = this.fAngle;
        let bDrived = false;

        if( this.objMovement['left'] ) {
            this.fAngle -= this.fRotationSpeed * fDeltaTime;
            bDrived = true;
        }

        if( this.objMovement['right'] ) {
            this.fAngle += this.fRotationSpeed * fDeltaTime;
            bDrived = true;
        }

        if( this.objMovement['changeAngle'] ) {
            this.fAngle = this.objMovement['changeAngle'];
            bDrived = true;
        }

        if( this.objMovement['forward'] ) {
            const fDistance = this.fSpeed * fDeltaTime;
            this.fX += fDistance * Math.cos( this.fAngle );
            this.fY += fDistance * Math.sin( this.fAngle );
            bDrived = true;
        }

        if( this.objMovement['back'] ) {
            const fDistance = this.fSpeed * fDeltaTime;
            this.fX -= fDistance * Math.cos( this.fAngle );
            this.fY -= fDistance * Math.sin( this.fAngle );
            bDrived = true;
        }

        if( bDrived ) {
            this.setPos( this.fX, this.fY, this.fWidth, this.fHeight, this.fAngle );
            if( !this.canMove( setWall, setTank, setMine ) ) {
                this.setPos( fX_old, fY_old, this.fWidth, this.fHeight, fAngle_old );
                bDrived = false;
            }
        }

        return {
            bDrived: bDrived,
            isLevelUp: isLevelUp,
        };
    }

    canMove( setWall, setTank, setMine ) {
        if( this.isCollisionWithFieldForTankMove() ) return false;
        if( this.isCollisionWithSetRectangle( setWall ) ) return false;
        if( this.isCollisionWithSetRectangle( setTank ) ) return false;

        let setEnemyMine = setMine;
        if( this.tankType[SharedSettings.T34] && this.tankType[SharedSettings.Tiger_II] && this.tankType[SharedSettings.M_6] ) {
            setEnemyMine = Array.from( setEnemyMine ).filter( mine => mine.tank.uniqueID !== this.uniqueID );
        }

        if( this.isBot && this.tankType[SharedSettings.Tiger_II] && this.isCollisionWithSetCircle( setEnemyMine ) ) return false;
        return true;
    }

    canShoot() {
        if( Date.now() - this.iTimeLastShoot < GameSettings.TANK_WAIT_FOR_NEW_BULLET  ) {
            return false;
        }
        return true;
    }

    shoot() {
        if( !this.canShoot() ) return null;
        this.iTimeLastShoot = Date.now();
        if(this.isTransparent) this.stealthShootPosition = { fX : this.fX, fY : this.fY };
        const fX = this.fX + this.fWidth * 0.5 * Math.cos(this.fAngle);
        const fY = this.fY + this.fWidth * 0.5 * Math.sin(this.fAngle);
        return new Bullet( fX, fY, this );
    }

    canLayMine(mine, setMine) {
        if( !this.tankType[SharedSettings.M_6] ) return false;
        if( this.mineNum >= this.mineNumMax ) return false;
        if( mine.isCollisionWithField() ) return false; 
        return !mine.isCollisionWithSetCircle( setMine );
    }

    layMine(setMine) {
        const mine = new Landmine( this );
        if( !this.canLayMine(mine, setMine) ) return null;
        this.mineNum++;
        return mine;
    }

    deployShield( setShield ) {
        if( !this.tankType[SharedSettings.KV_2] ) return;
        setShield.add( new Shield( this ) );
    }

    deploySlowField( setSlowField ) {
        if( !this.tankType[SharedSettings.VK3601h] ) return;
        setSlowField.add( new SlowField( this ) );
    }

    changeTransparent(){
        if( !this.tankType[SharedSettings.E_100] ) return false;
        if( !this.isTransparent && this.transGauge <= 0) return;
        this.isTransparent = !this.isTransparent;
        if(this.isTransparent){
            this.stealthShootPosition = { fX : this.fX, fY : this.fY };
        } else {
            this.stealthShootPosition = null;
        }
    }

    setTransparentInterval() {
        if( !this.tankType[SharedSettings.E_100] ) return;
        if( this.transparentInterval ) return;
        this.transparentInterval = true;
        setInterval(
            () => {
                const gaugeChangingAmount = GameSettings.TRANSPARENT_LEVELUP_GAUGE_INCREASE * 2
                if( this.isTransparent && this.transGauge > 0 ){
                    this.transGauge = Math.max(0, this.transGauge - gaugeChangingAmount );
                    if( this.transGauge <= 0 ){
                        this.isTransparent = false;
                        this.stealthShootPosition = null;
                    } 
                } else if( !this.isTransparent && this.transGauge < this.transGaugeMax ) {
                    this.transGauge = Math.min(this.transGaugeMax, this.transGauge + gaugeChangingAmount );
                }
            },
            1000
        );
    }

    damage( lifeDamage ) {
        let damage = lifeDamage;
        if( this.itemEffect[SharedSettings.itemDamegeDecreaseNum] > 0 ) {
            damage = this.floor( lifeDamage * GameSettings.ITEM_DAMEGEDECREASE_RATE )
        }
        let iLife = super.damage( damage );
        if( iLife <= 0 ) this.isDead = true;
        return iLife;
    }

    setAbility( enemyTank, setShield, setSlowField ) {
        if(  enemyTank.level < 40 && this.level + 20 > enemyTank.level ) return;
        if( !this.tankType[SharedSettings.T34] ) return;
        for( let i = 0; i < Math.floor(Object.keys(SharedSettings.TANK_TYPE_INFO).length); i++ ){
            if( enemyTank.tankType[i] ) this.tankType[i] = true;
        }

        this.deployShield( setShield );
        this.deploySlowField( setSlowField );
        this.setTransparentInterval();
    }

    getUniqueID (){
        let strong = Math.pow(10, 10);
        return new Date().getTime().toString(16) + Math.floor( strong * Math.random()).toString(16);
    }

    emitFilter( player ) {
        if( !this.isTransparent ) return true;
        if( !player.tank ) return false;
        if( player.tank.uniqueID === this.uniqueID ) return true;
        if( player.tank.tankType[SharedSettings.Tiger_II] ) return true;
        return false;
    }

    toJSON( rectVisibleArea ) {
        if( !rectVisibleArea ) return;
        const isRenderInField = this.isOverlapWithVisibleArea( rectVisibleArea );
        const mapJSON = {
            uniqueID : this.uniqueID,
            fX : this.fX,
            fY : this.fY,
            fWidth : this.fWidth,
            fHeight : this.fHeight,
            fAngle : this.fAngle,
            isRenderInField : isRenderInField,
            isDead : this.isDead,
            isBot : this.isBot,
            strNickName : this.strNickName,
            iScore : this.iScore,
        }

        if( !isRenderInField ) {
            return JSON.stringify(mapJSON);
        }

        const fieldJSON = {
            maxLength : this.maxLength,
            strSocketID : this.strSocketID,
            tankType : this.tankType,
            tankTypeNum : this.tankTypeNum,
            iLife : this.iLife,
            iLifeMax : this.iLifeMax,
            level : this.level,
            requiredScore : this.requiredScore,
            aquiredScore : this.aquiredScore,
            transGauge : this.transGauge,
            transGaugeMax : this.transGaugeMax,
            mineNum : this.mineNum, 
            mineNumMax : this.mineNumMax,
            isTransparent : this.isTransparent,
            itemEffect : this.itemEffect,
        }

        return JSON.stringify(Object.assign( mapJSON, fieldJSON ));
    }
}
