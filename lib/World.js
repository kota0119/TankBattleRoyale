const Tank = require('./Tank.js');
const BotTank = require('./BotTank.js');
const Wall = require('./Wall.js');
const Bullet = require('./Bullet.js');
const Player = require('./Player.js');
const Shield = require('./Shield.js');
const Item = require('./Item.js');
const Explosion = require('./Explosion.js');
const Sound = require('./Sound.js');
const KillLog = require('./KillLog.js');
const SharedSettings = require('../public/js/SharedSettings.js');
const GameSettings = require('./GameSettings.js');

module.exports = class World {
    constructor(io) {
        this.io = io;
        this.setTank = new Set();
        this.setWall = new Set();
        this.setBullet = new Set();
        this.setMine = new Set();
        this.setPlayer = new Set();
        this.setShield = new Set();
        this.setSlowField = new Set();
        this.setItem = new Set();
        this.setExplosion = new Set();
        this.setSound = new Set();
        this.setKillLog = new Set();
        this.botEnemy = {};
        this.isBossAppeared = false;

        for( let i = 0; i < GameSettings.WALL_COUNT; i++ ) {
            this.createWall();
        }

        for( let i = 0; i < GameSettings.BOTTANK_COUNT; i++ ) {
            let botTank = this.createBotTank('Tank' + (i + 1).toString(16).toUpperCase() );
            this.setBotEnemy( botTank, null );
        }
    }

    update( fDeltaTime ) {
        this.updateObject( fDeltaTime );
        this.checkCollisions();
        this.doNewActions( fDeltaTime );
    }

    updateObject ( fDeltaTime ) {
        this.setTank.forEach(
            (tank) => {
                if( tank.level >= 40 ) this.isBossAppeared = true;
                const isLevelUp = tank.update( fDeltaTime, this.setWall, this.setTank, this.setMine ).isLevelUp;
                if( isLevelUp ) {
                    this.createSound( tank, SharedSettings.levelUpSoundNum );
                }
            }
        )

        this.setBullet.forEach(
            ( bullet ) => {
                const bDisapperar = bullet.update( fDeltaTime, this.setTank );
                if( bDisapperar ) {
                    this.destroyBullet(bullet);
                }
            }
        )

        this.setMine.forEach(
            (mine) => {
                const bDisapperar = mine.update( fDeltaTime );
                if( bDisapperar ) {
                    this.destroyMine(mine);
                }
            }
        )

        this.setPlayer.forEach(
            (player) => {
                player.update( fDeltaTime );
            }
        )

        this.setShield.forEach(
            (shield) => {
                shield.update();
            }
        )

        this.setSlowField.forEach(
            (slowField) => {
                slowField.update();
            }
        )

        this.setItem.forEach(
            (item) => {
                const bDisapperar = item.update( fDeltaTime );
                if( bDisapperar ) {
                    this.destroyItem(item);
                }
            }
        )

        this.setExplosion.forEach(
            (explosion) => {
                const bDisapperar = explosion.update();
                if( bDisapperar ) {
                    this.destroyExplosion( explosion );
                }
            }
        )

        this.setSound.forEach(
            (sound) => {
                const bDisapperar = sound.update();
                if( bDisapperar ) {
                    this.destroySound( sound );
                }
            }
        )

        this.setKillLog.forEach(
            ( killLog ) => {
                const bDisapperar = killLog.update( fDeltaTime );
                if( bDisapperar ) {
                    this.destroyKillLog( killLog );
                }
            }
        )
    }

    checkCollisions () {
        this.setBullet.forEach(
            (bullet) => {
                this.setBullet.forEach(
                    (enemyBullet) => {
                        if ( bullet.tank.uniqueID === enemyBullet.tank.uniqueID ) return;
                        if( bullet.isCollisionWithRectangle(enemyBullet) ) {
                            this.bulletCollision( bullet, enemyBullet );
                        }
                    }
                );

                if( bullet.iLife <= 0 ) return;

                this.setWall.forEach(
                    (wall) => {
                        if( bullet.isCollisionWithRectangle(wall) ) {
                            this.bulletCollision( bullet, wall );
                        }
                    }
                );

                if( bullet.iLife <= 0 ) return;

                this.setShield.forEach(
                    (shield) => {
                        if( shield.tank === bullet.tank ) return;
                        if( !shield.isActive ) return;
                        if( bullet.isCollisionWithCircle( shield ) ) {
                            this.bulletCollision( bullet, shield );
                        }
                    }
                );

                if( bullet.iLife <= 0 ) return;

                this.setTank.forEach(
                    (tank) => {
                        if( tank === bullet.tank ) return;
                        if( bullet.isCollisionWithRectangle( tank ) ) {
                            this.bulletCollision( bullet, tank );
                        }
                    }
                );                
            }
        );

        this.setMine.forEach(
            (mine) => {
                this.setShield.forEach(
                    (shield) => {
                        if( shield.tank === mine.tank ) return;
                        if( !shield.isActive ) return;
                        if( mine.isCollisionWithCircle( shield ) ) {
                            this.mineCollision( mine, shield );
                        }
                    }
                );

                if( mine.iLife <= 0 ) return;

                this.setTank.forEach(
                    (tank) => {
                        if( tank === mine.tank ) return;
                        if( mine.isCollisionWithRectangle( tank ) ) {
                            this.mineCollision( mine, tank );
                        }
                    }
                )
            }
        )

        this.setSlowField.forEach(
            (slowField) => {
                this.setTank.forEach(
                    (tank) => {
                        if( slowField.tank === tank ) return;
                        this.slowFieldOverlapCheck( slowField, tank );
                    }
                )

                this.setBullet.forEach(
                    (bullet) => {
                        if( slowField.tank.uniqueID === bullet.tank.uniqueID ) return;
                        this.slowFieldOverlapCheck( slowField, bullet );
                    }
                )
            }
        )

        this.setItem.forEach(
            (item) => {
                if( item.isBuriedInWall ) return;
                this.setTank.forEach(
                    (tank) => {
                        if( item.isCollisionWithRectangle( tank ) ) {
                            this.itemCollision( item, tank );
                        }
                    }
                )
            }
        )
    }

    bulletCollision( bullet, gameObject ) {
        if( bullet.setPenetratedObject.has(gameObject) ) return;

        const bullet_attack = bullet.iLife;
        const gameObject_attack = gameObject.iLife;

        if( bullet.damage( gameObject_attack, gameObject ) <= 0 ) {
            this.destroyBullet( bullet );
        }

        if( gameObject.damage( bullet_attack ) <= 0 ) {
            if( gameObject instanceof Tank ){
                bullet.tank.iScore += Math.floor(gameObject.iScore * GameSettings.TANK_KILL_REWARD_PROPORTION );
                if( bullet.tank.level <= gameObject.level ) bullet.tank.iScore += ( gameObject.level - bullet.tank.level + 1 ) * 5;
                bullet.tank.setAbility( gameObject, this.setShield, this.setSlowField );
                this.destroyTank( gameObject, bullet.tank );
            }
            if( gameObject instanceof Wall ) this.destroyWall( gameObject );
            if( gameObject instanceof Bullet ) this.destroyBullet( gameObject );
        } else if( gameObject instanceof Tank ) {
            this.setBotEnemy( gameObject, bullet.tank );
            bullet.tank.iScore += Math.max(1, Math.min(3, Math.ceil( (gameObject.level - bullet.tank.level) / 5.0 )) );
        } else if( gameObject instanceof Shield ) {
            this.setBotEnemy( gameObject.tank, bullet.tank );
            bullet.tank.iScore += Math.max(1, Math.min(3, Math.ceil( (gameObject.tank.level - bullet.tank.level) / 5.0 )) );
        }

        if( !(gameObject instanceof Bullet) && bullet.iLife > 0 ){
            this.createExplosion( bullet, gameObject, bullet_attack );
        }
    }

    mineCollision( mine, gameObject ) {
        const mine_attack = mine.iLife;
        if( gameObject instanceof Tank ){
            if( gameObject.damage( mine_attack) <= 0 ) {
                mine.tank.iScore += Math.floor(gameObject.iScore * GameSettings.TANK_KILL_REWARD_PROPORTION);
                if( mine.tank.level <= gameObject.level ) mine.tank.iScore += ( gameObject.level - mine.tank.level + 1 ) * 5;
                mine.tank.setAbility( gameObject, this.setShield, this.setSlowField );
                this.destroyTank( gameObject, mine.tank );
            } else {
                mine.tank.iScore += Math.max(1, Math.min(3, Math.ceil( (gameObject.level - mine.tank.level) / 5.0 )) );
            }
        } else if( gameObject instanceof Shield ) {
            gameObject.damage( mine_attack);
        }

        this.destroyMine( mine );
    }

    slowFieldOverlapCheck( slowField, rectangleObj ) {
        const isOverlap = slowField.isCollisionWithRectangle( rectangleObj );
        const isSlowing = rectangleObj.setSlowing.has(slowField.tank.uniqueID);

        if( isOverlap && !isSlowing ) {
            rectangleObj.setSlowing.add( slowField.tank.uniqueID );
        } else if ( !isOverlap && isSlowing ) {
            rectangleObj.setSlowing.delete( slowField.tank.uniqueID );
        }
    }

    itemCollision( item, tank ) {
        switch( item.itemTypeNum ) {
            case SharedSettings.itemSpeedUpNum : tank.itemEffect[SharedSettings.itemSpeedUpNum] = SharedSettings.itemEffectTime; break;
            case SharedSettings.itemRecoveryUpNum : tank.itemEffect[SharedSettings.itemRecoveryUpNum] = SharedSettings.itemEffectTime; break;
            case SharedSettings.itemDamegeDecreaseNum : tank.itemEffect[SharedSettings.itemDamegeDecreaseNum] = SharedSettings.itemEffectTime; break;
            case SharedSettings.itemDamegeIncreaseNum : tank.itemEffect[SharedSettings.itemDamegeIncreaseNum] = SharedSettings.itemEffectTime; break;
        }
        this.destroyItem( item );
        this.createSound( item, SharedSettings.itemGetSoundNum );
    }

    doNewActions ( fDeltaTime ) {
        this.setTank.forEach(
            (tank) => {
                if( !tank.isBot ) return;
                let nearestItem = this.setFAngleToNearestItem( tank, GameSettings.BOTTANK_NEAREST_ITEM );
                const isTankShoot = tank.SHOOT_PROBABILITY_PER_SEC * fDeltaTime > Math.random();

                if( !nearestItem ){
                    if( !this.getBotEnemy(tank) ) {
                        // this.getBotEnemy(tank) = 最も距離が近いタンク
                        let nearestTargetDistance = GameSettings.BOTTANK_NEAREST_ENEMY;
                        this.setTank.forEach(
                            ( otherTank ) => {
                                if( tank === otherTank ) return;
                                if( otherTank.isTransparent && !tank.tankType[SharedSettings.Tiger_II] ) return;
                                let distance = Math.sqrt( Math.pow( tank.fX - otherTank.fX, 2 ) + Math.pow( tank.fY - otherTank.fY, 2 ) );
                                if( distance <= nearestTargetDistance ) {
                                    nearestTargetDistance = distance;
                                    this.setBotEnemy( tank, otherTank );
                                }
                            }
                        )
                    }
    
                    if( this.getBotEnemy(tank) ) {
                        const distance = Math.sqrt( Math.pow( tank.fX - this.getBotEnemy(tank).fX, 2 ) + Math.pow( tank.fY - this.getBotEnemy(tank).fY, 2 ) );
                        if( distance >= GameSettings.BOTTANK_TARGET_RESET ) {
                            // this.getBotEnemy(tank)が一定以上の距離の場合、this.getBotEnemy(tank)をnullにする。
                            this.setBotEnemy( tank, null );
                        } 
                    }
    
                    if( this.getBotEnemy(tank) ) {
                        let enemyAngle = Math.atan2( this.getBotEnemy(tank).fY - tank.fY, this.getBotEnemy(tank).fX - tank.fX );
                        if( this.getBotEnemy(tank).isTransparent && this.getBotEnemy(tank).stealthShootPosition && !tank.tankType[SharedSettings.Tiger_II] ) {
                            const ssPos = this.getBotEnemy(tank).stealthShootPosition;
                            enemyAngle = Math.atan2( ssPos.fY - tank.fY, ssPos.fX - tank.fX );
                            if( isTankShoot ) {
                                const deltaAngle = 20;
                                enemyAngle += ( deltaAngle - deltaAngle * 2 * Math.random() ) * 2 * Math.PI / 360;
                            }
                        }
                        tank.setFAngle( enemyAngle, this.setWall, this.setTank, this.setMine );

                    } else {
                        nearestItem = this.setFAngleToNearestItem( tank, GameSettings.BOTTANK_NEAREST_ITEM_NONTARGET );
                    }
                }

                tank.justifyMovement( this.getBotEnemy(tank), nearestItem );

                if( tank.tankType[SharedSettings.M_6] ) {
                    let layMineProbability = GameSettings.BOTTANK_LAYMINE_PROBABILITY_PER_SEC * fDeltaTime;
                    if( tank.objMovement['back'] && !tank.objMovement['forward'] && this.getBotEnemy(tank) ){
                        layMineProbability *= 10;
                    } else if( tank.mineNum * 2 < tank.mineNumMax ) {
                        layMineProbability *= 5;
                    }
                    if( layMineProbability > Math.random() ) {
                        this.createMine( tank );
                    }
                }
                
                tank.changeTransparent(this.getBotEnemy(tank));
                
                if( isTankShoot ) {
                    this.createBullet( tank );
                }
            }
        )
    }

    createTank( strSocketID, strNickName, tankTypeNum ) {
        const tank = new Tank( strSocketID, strNickName, this.setWall, this.setTank, this.setMine, 1, tankTypeNum );
        this.setTank.add(tank);
        if( tank.tankType[SharedSettings.VK3601h] ) this.createSlowField( tank );
        if( tank.tankType[SharedSettings.KV_2] ) this.createShield( tank );

        return tank;
    }

    createBotTank( strNickName, timerId ) {
        if( timerId ) {
            if( this.setTank.size > 45 ){
                return;
            } else {
                clearInterval(timerId);
            }
        }

        let botLevel = 1;
        const random = Math.random();
        if( random < 1.0 / 3.0 ) {
            botLevel += Math.floor(6 * Math.random());
        } else if ( random < 2.0 / 3.0 ) {
            botLevel += Math.floor(8 * Math.random());
        } else { 
            botLevel += Math.floor(10 * Math.random());
        }

        if( this.isBossAppeared ) {
            if( random <= 0.01 ) botLevel = 40 + Math.floor(11 * Math.random());
        } else {
            if( random <= 0.03 ) {
                botLevel = 40 + Math.floor(11 * Math.random());
                this.isBossAppeared = true;
            }
        }
        
        const botTank = new BotTank( strNickName, this.setWall, this.setTank, this.setMine, botLevel, Math.floor(Object.keys(SharedSettings.TANK_TYPE_INFO).length * Math.random()) );
        this.setTank.add(botTank);
        if( botTank.tankType[SharedSettings.VK3601h] ) this.createSlowField( botTank );
        if( botTank.tankType[SharedSettings.KV_2] ) this.createShield( botTank );

        return botTank;
    }

    destroyTank(tank, destroyer) {
        // console.log('dead: socket.id = %s', tank.strSocketID, " iScore: ", tank.iScore );
        this.createExplosion( tank, tank, tank.iLifeMax );
        if( destroyer ) this.createKillLog( destroyer, tank );

        this.setTank.forEach(
            ( otherTank ) => {
                if( this.getBotEnemy(otherTank) === tank ) {
                    this.setBotEnemy(otherTank, null);
                }
            }
        )

        this.destroySlowField( tank );
        this.destroyShield( tank );
        this.setTank.delete( tank );

        if ( tank.isBot ) {
            this.setBotEnemy(tank, null);
            let timerId = setInterval(
                () => {
                    this.createBotTank( tank.strNickName, timerId );
                },
                GameSettings.BOTTANK_WAIT_FOR_NEW_BOT
            );
        } else {
            let tankPlayer = null;
            this.setPlayer.forEach(
                ( player ) => {
                    if( player.strSocketID === tank.strSocketID ) {
                        tankPlayer = player;
                    }
                }
            )

            if( tankPlayer ) {
                tankPlayer.tank = null;
                tankPlayer.isPlaying = false;
            }

            this.io.to( tank.strSocketID ).emit('dead');
        }
    }

    createWall() {
        const random = Math.random();
        let wallTypeNum = 0;
        if( random < 0.1 ) {
            wallTypeNum = 2;
        } else if( random < 0.3 ) {
            wallTypeNum = 1;
        }
        const wall = new Wall( this.setWall, this.setTank, wallTypeNum );
        let itemProbability = 0;
        switch( wallTypeNum ) {
            case 0 : itemProbability = 1.0 / 12.0; break;
            case 1 : itemProbability = 1.0 / 4.0; break;
            case 2 : itemProbability = 1.0 / 2.0; break;
        }
        
        if( itemProbability > Math.random() ) {
            this.createItem( wall );
        }

        this.setWall.add( wall );
        return wall;
    }

    destroyWall( wall ) {
        this.createExplosion( wall, wall, GameSettings.WALL_LIFE_MAX * 0.5 );
        this.setWall.delete( wall );
        this.setItem.forEach(
            (item) => {
                if( !item.isBuriedInWall ) return;
                if( item.wall === wall ) {
                    item.isBuriedInWall = false;
                }
            }
        )

        setTimeout(
            () => {
                this.createWall();
            },
            GameSettings.WALL_WAIT_FOR_NEW_WALL
        );
    }

    createBullet( tank ) {
        const bullet = tank.shoot();
        if( bullet ) this.setBullet.add( bullet );
    }

    destroyBullet( bullet ) {
        this.createExplosion( bullet, bullet, bullet.iLife );
        this.setBullet.delete( bullet );
    }

    createMine( tank ) {
        if( !tank.tankType[SharedSettings.M_6] ) return;
        const mine = tank.layMine(this.setMine);
        if( mine ) this.setMine.add( mine );
    }

    destroyMine( mine ) {
        if( !mine.tank.tankType[SharedSettings.M_6] ) return;
        this.createExplosion( mine, mine, mine.iLifeMax );
        if ( mine.tank && this.setTank.has(mine.tank) && mine.tank.iLife > 0 ) {
            mine.tank.mineNum--;
        }
        mine.iLife = 0;
        this.setMine.delete( mine );
    }

    createSlowField( tank ) {
        if( !tank.tankType[SharedSettings.VK3601h] ) return;
        tank.deploySlowField( this.setSlowField );
    }

    destroySlowField( tank ) {
        if( !tank.tankType[SharedSettings.VK3601h] ) return;
        Array.from(this.setTank).forEach(
            (otherTank) => {
                if( otherTank.setSlowing.has(tank.uniqueID) ) otherTank.setSlowing.delete( tank.uniqueID );
            }
        );
        Array.from(this.setBullet).forEach(
            (otherBullet) => {
                if( otherBullet.setSlowing.has(tank.uniqueID) ) otherBullet.setSlowing.delete( tank.uniqueID );
            }
        );
        Array.from(this.setSlowField).forEach(
            (slowField) => {
                if( slowField.tank.uniqueID === tank.uniqueID ) {
                    this.setSlowField.delete( slowField );
                }
            }
        );
    }

    createShield( tank ) {
        if( !tank.tankType[SharedSettings.KV_2] ) return;
        tank.deployShield( this.setShield );
    }

    destroyShield( tank ) {
        if( !tank.tankType[SharedSettings.KV_2] ) return;
        Array.from(this.setShield).forEach(
            (shield) => {
                if( shield.tank.uniqueID === tank.uniqueID ) {
                    this.setShield.delete( shield );
                }
            }
        )
    }

    createPlayer( strSocketID ) {
        const player = new Player( SharedSettings.FIELD_WIDTH * 0.5, SharedSettings.FIELD_HEIGHT * 0.5, strSocketID );
        this.setPlayer.add( player );
        return player;
    }

    destroyPlayer( player ){
        this.setPlayer.delete( player );
    }

    createItem( gameObject ) {
        const itemTypeNum = Math.floor( 4 * Math.random() );
        const item = new Item( gameObject, itemTypeNum );
        this.setItem.add( item );
    }

    destroyItem( item ) {
        this.setItem.delete( item );
    }

    createExplosion( attacker, tank, damage ) {
        this.setExplosion.add( new Explosion( attacker, tank, damage) );
        this.createSound( attacker, SharedSettings.explosionSoundNum );
    }

    destroyExplosion( explosion ) {
        this.setExplosion.delete( explosion );
    }

    createSound( gameObject, soundTypeNum ) {
        this.setSound.add( new Sound( gameObject, soundTypeNum ) );
    }

    destroySound( sound ) {
        this.setSound.delete( sound );
    }

    setBotEnemy( botTank, enemyTank ) {
        if( !botTank.isBot ) return;
        if ( enemyTank && this.setTank.has(enemyTank) && !enemyTank.isDead ) {
            this.botEnemy[botTank.uniqueID] = enemyTank;
            botTank.hasTargetTank = true;
        } else {
            this.botEnemy[botTank.uniqueID] = null;
            botTank.hasTargetTank = false;
        }
    }

    getBotEnemy( botTank ) {
        if( !botTank.isBot ) return null;
        return this.botEnemy[botTank.uniqueID];
    }

    setFAngleToNearestItem( tank, maxDistance ) {
        let nearestItem = null;
        let nearestItemDistance = maxDistance;
        const canDigWall = tank.tankType[SharedSettings.Tiger_II] && !this.getBotEnemy(tank);

        this.setItem.forEach(
            ( item ) => {
                let isApproach = !item.isBuriedInWall || (canDigWall && (item.wall.iLife <= tank.offensivePower * 10));
                if( !isApproach ) return;
                let distance = Math.sqrt( Math.pow( tank.fX - item.fX, 2 ) + Math.pow( tank.fY - item.fY, 2 ) );
                if( distance <= nearestItemDistance ) {
                    nearestItemDistance = distance;
                    nearestItem = item;
                }
            }
        )

        if( nearestItem ) {
            const itemAngle = Math.atan2( nearestItem.fY - tank.fY, nearestItem.fX - tank.fX );
            tank.setFAngle( itemAngle, this.setWall, this.setTank, this.setMine );
            tank.hasTargetItem = true;
        } else {
            tank.hasTargetItem = false;
        }

        return nearestItem;
    }

    createKillLog( winnerTank, loserTank ) {
        this.setKillLog.add( new KillLog( winnerTank, loserTank ) );
    }

    destroyKillLog( killLog ) {
        this.setKillLog.delete( killLog );
    }
}