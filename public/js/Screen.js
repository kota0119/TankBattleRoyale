class Screen {
    constructor( socket, canvas, assets ) {
        this.socket = socket;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.assets = assets;
        this.player = null;
        this.arrayTank = null;
        this.arrayWall = null;
        this.arrayBullet = null;
        this.arrayMine = null;
        this.arrayShield = null;
        this.arraySlowField = null;
        this.arrayItem = null;
        this.arrayExplosion = null;
        this.arraySound = null;
        this.arrayKillLog = null;
        // this.iProcessingTimeNanoSec = 0;
        this.renderMapFlag = true;
        this.renderInfoFlag = true;
        this.isMute = true;

        this.initSocket();

        this.context.mozImageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;
        this.context.imageSmoothingEnabled = false;

        this.fCenterX = SharedSettings.FIELD_WIDTH * 0.5;
        this.fCenterY = SharedSettings.FIELD_HEIGHT * 0.5;

        this.tankSelf = null;
    }

    initSocket() {
        this.socket.on( 'connect', 
            () => {
                this.browserResize();
                console.log('connect:socket.id = %s', socket.id );
            }
        )

        this.socket.on( 'update',
            ( player, arrayTank, arrayWall, arrayBullet, arrayMine, arrayShield, arraySlowField, arrayItem, arrayExplosion, arraySound, arrayKillLog ) => {
                this.player = player;
                this.arrayTank = arrayTank.map( jsonTank => JSON.parse(jsonTank) );
                this.arrayWall = arrayWall.map( jsonWall => JSON.parse(jsonWall) );
                this.arrayBullet = arrayBullet.map( jsonBullet => JSON.parse(jsonBullet) );
                this.arrayMine = arrayMine.map( jsonMine => JSON.parse(jsonMine) );
                this.arrayShield = arrayShield.map( jsonShield => JSON.parse(jsonShield) );
                this.arraySlowField = arraySlowField.map( jsonSlowField => JSON.parse(jsonSlowField) );
                this.arrayItem = arrayItem.map( jsonItem => JSON.parse(jsonItem) );
                this.arrayExplosion = arrayExplosion.map( jsonExplosion => JSON.parse(jsonExplosion) );
                this.arraySound = arraySound.map( jsonSound => JSON.parse(jsonSound) );
                this.arrayKillLog = arrayKillLog.map( jsonKillLog => JSON.parse(jsonKillLog) );
                // this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
            }
        )

        this.socket.on('dead', 
            () => {
                if( this.tankSelf ) this.tankSelf.isDead = true;
                $('#start-screen').show();
            }
        );

        this.socket.on('crowded', 
        () => {
            $('#start-screen').show();
            $('#errorMsg-Nickname').text('混雑により参加制限がかかっています。');
        }
    );

    }

    animate ( iTimeCurrent ) {
        requestAnimationFrame(
            (iTimeCurrent) => {
                this.animate( iTimeCurrent );
            }
        )
        this.render( iTimeCurrent );
    }

    render( iTimeCurrent ) {
        const fTimeCurrentSec = iTimeCurrent * 0.001;

        if( this.arrayTank ) {
            this.arrayTank.some(
                (tank) => {
                    if( this.socket.id && tank.strSocketID === this.socket.id ) {
                        this.tankSelf = tank;
                        return true;
                    }
                }
            );
        }

        if( this.tankSelf && !this.tankSelf.isDead ) {
            this.fCenterX = this.tankSelf.fX;
            this.fCenterY = this.tankSelf.fY;
        } else if( this.player && !this.player.isPlaying ) {
            this.fCenterX = this.player.fX;
            this.fCenterY = this.player.fY;
        }

        this.context.clearRect( 0, 0, this.browserWidth, this.browserHeight );

        this.context.save();
        this.context.translate(
            -1 * parseInt( this.fCenterX - this.browserWidth * 0.5 ),
            -1 * parseInt( this.fCenterY - this.browserHeight * 0.5 )
        );
        this.renderField();                       

        if( this.arrayMine ) {
            this.arrayMine.forEach(
                (mine) => {
                    if( !mine.isRenderInField ) return;
                    this.renderMine(mine);
                }
            )
        }

        if( this.arrayItem ) {
            this.arrayItem.filter( item => !item.isBuriedInWall ).forEach(
                (item) => {
                    if( !item.isRenderInField ) return;
                    this.renderItem( item ,fTimeCurrentSec );
                }
            )
        }

        if( this.arrayWall ) {
            this.arrayWall.forEach(
                (wall) => {
                    if( !wall.isRenderInField ) return;
                    this.renderWall(wall);
                }
            )
        }

        if( this.arrayItem ) {
            this.arrayItem.filter( item => item.isBuriedInWall ).forEach(
                (item) => {
                    if( !item.isRenderInField ) return;
                    this.renderItem( item ,fTimeCurrentSec );
                }
            )
        }

        if( this.arraySlowField ) {
            this.arraySlowField.forEach(
                (slowField) => {
                    if( !slowField.isRenderInField ) return;
                    this.renderSlowField(slowField);
                }
            )
        }  

        if( this.arrayShield ) {
            this.arrayShield.forEach(
                (shield) => {
                    if( !shield.isRenderInField ) return;
                    this.renderShield(shield);
                }
            )
        }            

        if( this.arrayTank ) {
            this.arrayTank.forEach(
                (tank) => {
                    if( !tank.isRenderInField ) return;
                    this.renderTank(tank);
                }
            )
        }

        if( this.arrayBullet ) {
            this.arrayBullet.forEach(
                (bullet) => {
                    if( !bullet.isRenderInField ) return;
                    this.renderBullet( bullet );
                }
            );
        }

        if( this.arrayExplosion ) {
            this.arrayExplosion.forEach(
                (explosion) => {
                    if( !explosion.isRenderInField ) return;
                    this.renderExplosion( explosion );
                }
            )
        }

        if( !this.isMute && this.arraySound ) {
            this.arraySound.forEach(
                (sound) => {
                    if( !sound ) return;
                    if( !sound.isRenderInField ) return;
                    this.playSound( sound );
                }
            )
        }

        this.context.restore();

        if( this.tankSelf ) {
            this.context.save();
            this.context.font = RenderingSettings.SCORE_FONT;
            this.context.fillStyle = RenderingSettings.SCORE_COLOR;
            let msg = 'Score:' + this.tankSelf.iScore;
            if( !this.tankSelf.isDead && this.tankSelf.tankType[SharedSettings.M_6] ) {
                let tankMineNum = this.tankSelf.mineNum;
                msg += '  Mine:' + tankMineNum + '/' + this.tankSelf.mineNumMax;
            }

            const msgWidth = this.context.measureText(msg).width;
            this.context.fillText( 
                msg,
                this.browserWidth / 2 - msgWidth / 2, 
                40 + 10
            );
            this.context.restore();
        }

        this.context.save();
        this.context.strokeStyle = RenderingSettings.FIELD_LINECOLOR;
        this.context.lineWidth = RenderingSettings.FIELD_LINEWIDTH;
        this.context.beginPath();
        this.context.moveTo(0, 0);
        this.context.lineTo(0, this.browserHeight);
        this.context.moveTo(this.browserWidth, 0);
        this.context.lineTo(this.browserWidth, this.browserHeight);
        this.context.closePath();
        this.context.stroke();
        this.context.restore();

        ////////////////////////////////////////////////
        // this.context.save();
        // this.context.font =  '20px Bold Arial';
        // this.context.fillStyle = 'black';
        // this.context.fillText( (this.iProcessingTimeNanoSec * 1e-9).toFixed(9) + '[s]',
        // 20, 420 );
        // this.context.restore();
        ////////////////////////////////////////////////

        this.renderMap();

        this.renderScoreRanking();

        this.renderKillLog();

        this.renderCrisis();
    }

    renderField() {
        this.context.save()

        let iCountX = parseInt( SharedSettings.FIELD_WIDTH / SharedSettings.FIELDTILE_WIDTH );
        let iCountY = parseInt( SharedSettings.FIELD_HEIGHT / SharedSettings.FIELDTILE_HEIGHT );

        for( let iIndexX = 0; iIndexX < iCountX; iIndexX++ ) {
            for( let iIndexY = 0; iIndexY < iCountY; iIndexY++ ) {
                
                this.context.drawImage(
                    this.assets.imageSprite,
                    this.assets.sandImageRectArea.sx, this.assets.sandImageRectArea.sy,
                    this.assets.sandImageRectArea.sw, this.assets.sandImageRectArea.sh,
                    iIndexX * SharedSettings.FIELDTILE_WIDTH,
                    iIndexY * SharedSettings.FIELDTILE_HEIGHT,
                    SharedSettings.FIELDTILE_WIDTH,
                    SharedSettings.FIELDTILE_HEIGHT
                );
            }
        }

        this.context.save();
        this.context.strokeStyle = '#222';
        this.context.lineWidth = 1;
        this.context.strokeRect( 0, 0, 
            iCountX * SharedSettings.FIELDTILE_WIDTH, 
            iCountY * SharedSettings.FIELDTILE_HEIGHT,
        );
        this.context.restore();       

        this.context.restore();
    }

    renderTank( tank ) {
        this.context.save();
        this.context.translate( tank.fX, tank.fY );    
        if( tank.isTransparent ) this.context.globalAlpha = 0.5;

        this.context.save();
        const fLifeCellWidth = tank.fWidth / tank.iLifeMax;
        this.context.fillStyle = RenderingSettings.LIFE_REMAINING_COLOR;
        this.context.fillRect( 
            -tank.fWidth * 0.5,
            tank.maxLength + 1,
            fLifeCellWidth * tank.iLife,
            10
        );
        if( tank.iLife < tank.iLifeMax ) {
            this.context.fillStyle = RenderingSettings.LIFE_MISSING_COLOR;
            this.context.fillRect(
                -tank.fWidth * 0.5 + fLifeCellWidth * tank.iLife ,
                tank.maxLength + 1,
                fLifeCellWidth * ( tank.iLifeMax - tank.iLife ),
                10
            );
        }
        this.context.restore();

        this.context.save();
        const fLevelUpCellWidth = tank.fWidth / tank.requiredScore;
        this.context.fillStyle = RenderingSettings.LEVELUP_ACQUIRED_SCORE_COLOR;
        this.context.fillRect(
            -tank.fWidth * 0.5,
            tank.maxLength + 11 * 1 + 1,
            fLevelUpCellWidth * tank.aquiredScore,
            10
        );
        this.context.fillStyle = RenderingSettings.LEVELUP_REQUIRED_SCORE_COLOR;
        this.context.fillRect(
            -tank.fWidth * 0.5 + fLevelUpCellWidth * tank.aquiredScore,
            tank.maxLength + 11 * 1 + 1,
            fLevelUpCellWidth * ( tank.requiredScore - tank.aquiredScore ),
            10
        )
        this.context.restore();

        this.context.save();
        let itemOrder = 0;
        for( let i = 0; i < SharedSettings.itemTotalNumber; i++ ){
            if( tank.itemEffect[i] > 0 ) {
                const itemEffect = this.assets.itemEffect[i][0];
                const sx = itemEffect.sx;
                const sy = itemEffect.sy;
                const sw = itemEffect.sw;
                const sh = itemEffect.sh;
                const lostRate = ((SharedSettings.itemEffectTime - tank.itemEffect[i]) / SharedSettings.itemEffectTime);

                this.context.save();
                this.context.globalAlpha = 0.4;
                this.context.drawImage(
                    this.assets.imageSprite, sx, sy, sw, sh * lostRate,
                    (RenderingSettings.ITEM_ICON_SIZE + 10) * (itemOrder - (SharedSettings.itemTotalNumber / 2.0) ),
                    -(tank.maxLength + 1 + 30 + RenderingSettings.ITEM_ICON_SIZE + 1),
                    RenderingSettings.ITEM_ICON_SIZE,
                    RenderingSettings.ITEM_ICON_SIZE * lostRate
                )
                this.context.restore();

                this.context.drawImage(
                    this.assets.imageSprite, sx, sy + sh * lostRate, sw, sh * (1 - lostRate),
                    (RenderingSettings.ITEM_ICON_SIZE + 10) * (itemOrder - (SharedSettings.itemTotalNumber / 2.0) ),
                    -(tank.maxLength + 1 + 30 + RenderingSettings.ITEM_ICON_SIZE + 1) + RenderingSettings.ITEM_ICON_SIZE * lostRate,
                    RenderingSettings.ITEM_ICON_SIZE,
                    RenderingSettings.ITEM_ICON_SIZE * (1 - lostRate)
                )

                itemOrder++;
            }
        }
        this.context.restore();

        this.context.save();
        this.context.textAlign = 'center';
        this.context.font = RenderingSettings.NICKNAME_FONT;

        if( this.tankSelf && tank.uniqueID === this.tankSelf.uniqueID ){
            this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_ME;
        } else if( tank.isBot ) {
            this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_BOT;
        } else {
            this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_OTHER_PLAYER;
        }

        const strtankLevel = ( tank.level < SharedSettings.TANK_MAX_LEVEL ) ? tank.level : "Max";
        this.context.fillText( "【" + tank.strNickName + "】" + "Lv." + strtankLevel, 0, -(tank.maxLength + 1) );
        this.context.restore();

        if( tank.tankType[SharedSettings.E_100] ) {
            let heightOffset = 11 * 2 + 1;
            if( tank.tankType[SharedSettings.KV_2] ) heightOffset = 11 * 3 + 1;
            this.context.save();
            const ftransCellWidth = tank.fWidth / tank.transGaugeMax;
            this.context.fillStyle = RenderingSettings.SKILL_TRANSPARENT_ACQUIRED_COLOR;
            this.context.fillRect(
                -tank.fWidth * 0.5,
                tank.maxLength + heightOffset,
                ftransCellWidth * tank.transGauge,
                10
            );
            this.context.fillStyle = RenderingSettings.SKILL_TRANSPARENT_REQUIRED_COLOR;
            this.context.fillRect(
                -tank.fWidth * 0.5 + ftransCellWidth * tank.transGauge,
                tank.maxLength + heightOffset,
                ftransCellWidth * ( tank.transGaugeMax - tank.transGauge ),
                10
            )
            this.context.restore();
        }

        this.context.save();
        this.context.rotate( tank.fAngle );
        this.context.drawImage( 
            this.assets.imageSprite,
            this.assets.tankType[tank.tankTypeNum].sx,
            this.assets.tankType[tank.tankTypeNum].sy,
            this.assets.tankType[tank.tankTypeNum].sw,
            this.assets.tankType[tank.tankTypeNum].sh,
            -tank.fWidth * 0.5,
            -tank.fHeight * 0.5,
            tank.fWidth,
            tank.fHeight
        );
        this.context.restore();  

        this.context.restore();
    }

    renderSlowField( slowField ) {
        if( slowField.tankIsDead ) return;

        this.context.save();
        this.context.translate( slowField.fX, slowField.fY );
        if( slowField.tankIsTransparent ) this.context.globalAlpha = 0.5;
        this.context.drawImage(
            this.assets.imageSprite,
            this.assets.slowFieldImageRectArea.sx,
            this.assets.slowFieldImageRectArea.sy,
            this.assets.slowFieldImageRectArea.sw,
            this.assets.slowFieldImageRectArea.sh,
            -slowField.fRadius,
            -slowField.fRadius,
            slowField.fRadius * 2,
            slowField.fRadius * 2
        );

        this.context.restore();
    }

    renderShield( shield ) {
        this.context.save();
        this.context.translate( shield.fX, shield.fY );
        if( shield.tankIsTransparent ) this.context.globalAlpha = 0.5;

        if( shield.isActive ) {
            this.context.drawImage(
                this.assets.imageSprite,
                this.assets.shieldImageRectArea.sx,
                this.assets.shieldImageRectArea.sy,
                this.assets.shieldImageRectArea.sw,
                this.assets.shieldImageRectArea.sh,
                -shield.fRadius,
                -shield.fRadius,
                shield.fRadius * 2,
                shield.fRadius * 2
            );
        }

        const fShieldCellWidth = shield.tankFWidth / shield.iLifeMax;
        this.context.fillStyle = RenderingSettings.SKILL_SHIELD_ACQUIRED_COLOR;
        this.context.fillRect(
            -shield.tankFWidth * 0.5,
            shield.tankMaxLength + 11 * 2 + 1,
            fShieldCellWidth * shield.iLife,
            10
        );
        this.context.fillStyle = RenderingSettings.SKILL_SHIELD_REQUIRED_COLOR;
        this.context.fillRect(
            -shield.tankFWidth * 0.5 + fShieldCellWidth * shield.iLife,
            shield.tankMaxLength + 11 * 2 + 1,
            fShieldCellWidth * ( shield.iLifeMax - shield.iLife ),
            10
        )
        this.context.restore();
    }

    renderMine( mine ) {
        this.context.save();
        if( this.tankSelf && mine.tankUniqueID !== this.tankSelf.uniqueID ) {
            this.context.globalAlpha = 0.5;
        }
        this.context.drawImage(
            this.assets.imageSprite,
            this.assets.landmineImageRectArea.sx,
            this.assets.landmineImageRectArea.sy,
            this.assets.landmineImageRectArea.sw,
            this.assets.landmineImageRectArea.sh,
            mine.fX - mine.fRadius,
            mine.fY - mine.fRadius,
            mine.fRadius * 2,
            mine.fRadius * 2
        );
        this.context.restore();
    }

    renderItem( item ,fTimeCurrentSec ) {
        let iIndexFrame = Math.floor( fTimeCurrentSec * 5 ) % 2;
        this.context.save();
        if( item.isBuriedInWall ){
            this.context.globalAlpha = 0.8;
            iIndexFrame = 0;
        } 
        const itemEffect = this.assets.itemEffect[item.itemTypeNum][iIndexFrame];
        const sx = itemEffect.sx;
        const sy = itemEffect.sy;
        const sw = itemEffect.sw;
        const sh = itemEffect.sh;
        this.context.drawImage(
            this.assets.imageSprite, sx, sy, sw, sh,
            item.fX - item.fRadius,
            item.fY - item.fRadius,
            item.fRadius * 2,
            item.fRadius * 2
        )
        this.context.restore();
    }

    renderWall( wall ) {
        this.context.save();
        this.context.translate( wall.fX, wall.fY );    
        this.context.rotate( wall.fAngle );
        this.context.drawImage(
            this.assets.imageSprite,
            this.assets.wallType[wall.wallTypeNum].sx,
            this.assets.wallType[wall.wallTypeNum].sy,
            this.assets.wallType[wall.wallTypeNum].sw,
            this.assets.wallType[wall.wallTypeNum].sh,
            -wall.fWidth * 0.5,
            -wall.fHeight * 0.5,
            wall.fWidth,
            wall.fHeight
        );

        if( wall.iLife < wall.iLifeMax ) {
            const fLifeCellWidth = wall.fWidth / wall.iLifeMax;
            this.context.fillStyle = RenderingSettings.LIFE_REMAINING_COLOR;
            this.context.fillRect( 
                -wall.fWidth * 0.5,
                wall.fHeight * 0.5 + 1,
                fLifeCellWidth * wall.iLife,
                10
            );
            if( wall.iLife < wall.iLifeMax ) {
                this.context.fillStyle = RenderingSettings.LIFE_MISSING_COLOR;
                this.context.fillRect(
                    -wall.fWidth * 0.5 + fLifeCellWidth * wall.iLife ,
                    wall.fHeight * 0.5 + 1,
                    fLifeCellWidth * ( wall.iLifeMax - wall.iLife ),
                    10
                );
            }
        }
        this.context.restore();
    }

    renderBullet( bullet ) {
        this.context.save();
        this.context.translate( bullet.fX, bullet.fY );
        this.context.rotate( bullet.fAngle );
        this.context.drawImage(
            this.assets.imageSprite,
            this.assets.bulletImageRectArea.sx,
            this.assets.bulletImageRectArea.sy,
            this.assets.bulletImageRectArea.sw,
            this.assets.bulletImageRectArea.sh,
            -bullet.fWidth * 0.5,
            -bullet.fHeight * 0.5,
            bullet.fWidth,
            bullet.fHeight
        )
        this.context.restore();
    }

    renderExplosion( explosion ) {
        this.context.save();
        this.context.translate( explosion.fX, explosion.fY );
        const imageWidth = this.assets.explosionImageRectArea.sw;
        const imageHeight = this.assets.explosionImageRectArea.sh;
        this.context.drawImage(
            this.assets.imageSprite,
            this.assets.explosionImageRectArea.sx + imageWidth * (explosion.imageIndex % 4),
            this.assets.explosionImageRectArea.sy + imageHeight * Math.floor(explosion.imageIndex / 4),
            imageWidth,
            imageHeight,
            -explosion.fWidth * 0.5,
            -explosion.fHeight * 0.5,
            explosion.fWidth,
            explosion.fHeight
        )
        this.context.restore();
    }

    playSound( sound ) {
        if( !this.player ) return;
        const soundDistance = Math.sqrt( Math.pow(sound.fX - this.player.fX, 2) + Math.pow(sound.fY - this.player.fY, 2) );
        const baseDistance = 1500;
        const volume = Math.max( ( baseDistance - soundDistance ) / baseDistance, 0.1); 

        const audioSrc = this.assets.sounds[sound.soundTypeNum].src;
        const playSound = new Audio();
        playSound.src = audioSrc;
        playSound.volume = volume;
        playSound.play();
    }

    renderMap() {
        if( !this.renderMapFlag ) return;
        this.renderMapField();

        if( this.arrayTank ) {
            this.arrayTank.forEach(
                (tank) => {
                    this.renderMapTank( tank );
                }
            )
        }

        if( this.arrayWall ) {
            this.arrayWall.forEach(
                (wall) => {
                    this.renderMapWall( wall );
                }
            )
        }

        if( this.arrayBullet ) {
            this.context.fillStyle = "black";
            this.arrayBullet.forEach(
                (bullet) => {
                    this.renderMapBullet( bullet );
                }
            )
        }

        if( this.arrayMine ) {
            this.arrayMine.forEach(
                (mine) => {
                    this.renderMapMine( mine );
                }
            )
        }
        this.context.restore();
    }

    renderMapField(){
        const MAP_OFFSET_WIDTH = this.canvas.width - RenderingSettings.MAP_WIDTH_HEIGHT - RenderingSettings.MAP_OFFSET_HEIGHT;
        this.context.save();
        this.context.strokeStyle = 'black';
        this.context.strokeRect( 
            MAP_OFFSET_WIDTH, 
            RenderingSettings.MAP_OFFSET_HEIGHT, 
            RenderingSettings.MAP_WIDTH_HEIGHT, 
            RenderingSettings.MAP_WIDTH_HEIGHT 
        );
        this.context.globalAlpha = 0.85;
        this.context.fillStyle = RenderingSettings.INFO_BACKGROUND_COLOR;

        this.context.fillRect( 
            MAP_OFFSET_WIDTH, 
            RenderingSettings.MAP_OFFSET_HEIGHT, 
            RenderingSettings.MAP_WIDTH_HEIGHT, 
            RenderingSettings.MAP_WIDTH_HEIGHT 
        );
        this.context.beginPath();
        this.context.rect( 
            MAP_OFFSET_WIDTH, 
            RenderingSettings.MAP_OFFSET_HEIGHT, 
            RenderingSettings.MAP_WIDTH_HEIGHT, 
            RenderingSettings.MAP_WIDTH_HEIGHT 
        );
        this.context.clip();
        this.context.translate( MAP_OFFSET_WIDTH, RenderingSettings.MAP_OFFSET_HEIGHT );
        this.context.scale( 
            RenderingSettings.MAP_WIDTH_HEIGHT / SharedSettings.FIELD_WIDTH, 
            RenderingSettings.MAP_WIDTH_HEIGHT / SharedSettings.FIELD_HEIGHT 
        );

        this.context.strokeRect(
            (this.fCenterX - this.browserWidth * 0.5),
            (this.fCenterY - this.browserHeight * 0.5),
            this.browserWidth,
            this.browserHeight
        );
        this.context.fillStyle = "white";
        this.context.fillRect(
            (this.fCenterX - this.browserWidth * 0.5),
            (this.fCenterY - this.browserHeight * 0.5),
            this.browserWidth,
            this.browserHeight
        );
    }

    renderMapTank( tank ) {
        this.context.save();
        if( this.tankSelf && tank.uniqueID === this.tankSelf.uniqueID ) {
            this.context.fillStyle = "green";
        } else {
            this.context.fillStyle = "red";
        }
        this.context.translate( tank.fX, tank.fY );
        this.context.rotate( tank.fAngle );
        this.context.fillRect( 
            (-tank.fWidth * 0.5), 
            (-tank.fHeight * 0.5), 
            tank.fWidth, 
            tank.fHeight
        );
        this.context.restore();
    }

    renderMapWall( wall ) {
        this.context.save();
        this.context.translate( wall.fX, wall.fY );    
        this.context.rotate( wall.fAngle );
        this.context.fillStyle = this.assets.wallType[wall.wallTypeNum].color;
        this.context.fillRect(
            (-wall.fWidth * 0.5), 
            (-wall.fHeight * 0.5), 
            wall.fWidth, 
            wall.fHeight
        );
        this.context.strokeStyle = '#000';
        this.context.lineWidth = 2;
        this.context.strokeRect(
            (-wall.fWidth * 0.5), 
            (-wall.fHeight * 0.5), 
            wall.fWidth, 
            wall.fHeight
        );
        this.context.restore();
    }

    renderMapBullet( bullet ) {
        this.context.save();
        this.context.translate( bullet.fX, bullet.fY );
        this.context.rotate( bullet.fAngle );
        this.context.fillRect(
            -bullet.fWidth * 0.5, 
            -bullet.fHeight * 0.5, 
            bullet.fWidth, 
            bullet.fHeight
        )
        this.context.restore();
    }

    renderMapMine( mine ) {
        if( this.tankSelf && mine.tankUniqueID === this.tankSelf.uniqueID ) {
            this.context.fillStyle = "blue";
        } else {
            this.context.fillStyle = "black";
        }
        this.context.beginPath();
        this.context.arc( 
            mine.fX, 
            mine.fY, 
            mine.fRadius, 
            0 * Math.PI / 180, 
            360 * Math.PI / 180, 
            false 
        ) ;
        this.context.fill();
    }

    renderScoreRanking() {
        if( !this.renderInfoFlag ) return;
        if( !this.arrayTank ) return;

        const playerNum = this.arrayTank.filter( tank => !tank.isBot ).length;
        const arrayRankerTank = this.arrayTank.sort( (a1, a2) => {
            if( a1.iScore > a2.iScore ) return -1;
            if( a1.iScore < a2.iScore ) return 1;
            return 0;
        }).slice(0, 10);

        this.context.save();
        const rankingFontSize = 24;
        const scoreBoardfX = 20;
        const scoreBoardfY = RenderingSettings.MAP_OFFSET_HEIGHT;
        const scoreBoardWidth = RenderingSettings.MAP_WIDTH_HEIGHT;
        const lineNum = 11;
        const scoreBoardHeight = rankingFontSize * (lineNum + 1.8) + 5 * (lineNum - 1);

        this.context.save();
        this.context.strokeStyle = 'black';
        this.context.strokeRect( 
            scoreBoardfX, 
            scoreBoardfY, 
            scoreBoardWidth, 
            scoreBoardHeight 
        );
        this.context.globalAlpha = 0.5;
        this.context.fillStyle = 'white';
        this.context.fillRect( 
            scoreBoardfX, 
            scoreBoardfY, 
            scoreBoardWidth, 
            scoreBoardHeight 
        );
        this.context.restore();

        this.context.font =  rankingFontSize + 'px Bold Arial';
        this.context.fillStyle = "black";
        this.context.fillText( 'All ' + this.arrayTank.length + ' tanks, ' + playerNum + ' players.',
            scoreBoardfX + rankingFontSize * 3, scoreBoardfY + rankingFontSize * 1.5
        );

        let rankNumber = 1;
        let beforeScore = null;
        arrayRankerTank.forEach((tank, index) => {
            if( beforeScore && beforeScore > tank.iScore ){
                rankNumber++;
            }

            if( this.tankSelf && tank.uniqueID === this.tankSelf.uniqueID ){
                this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_ME;
            } else if( tank.isBot ) {
                this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_BOT;
            } else {
                this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_OTHER_PLAYER;
            }

            const rankNumberStr = ( rankNumber < 10 ) ? '  ' + rankNumber : rankNumber;
            this.context.fillText( rankNumberStr + '. '  + tank.strNickName,
                scoreBoardfX + rankingFontSize, scoreBoardfY + rankingFontSize * 1.8 + (rankingFontSize + 5) * (index + 1)
            );
            this.context.fillText( tank.iScore,
                scoreBoardfX + rankingFontSize * 12, scoreBoardfY + rankingFontSize * 1.8 + (rankingFontSize + 5) * (index + 1)
            );
            beforeScore = tank.iScore;
        })

        this.context.restore();
    }

    renderKillLog (){
        if( !this.renderInfoFlag ) return;

        const killLogPadding = 15;
        const KillLogFontSize = 20;
        const killLogfX = this.browserWidth - (510 + killLogPadding * 2) - 20;
        const killLogfY = this.browserHeight - (KillLogFontSize * 1.2 * 5 + killLogPadding * 2) + KillLogFontSize - 20;

        this.context.save();
        this.context.strokeStyle = 'black';
        this.context.strokeRect( 
            killLogfX,
            killLogfY - KillLogFontSize,
            510 + killLogPadding * 2,
            KillLogFontSize * 1.2 * 5 + killLogPadding * 2
        );
        this.context.globalAlpha = 0.5;
        this.context.fillStyle = 'white'
        this.context.fillRect(
            killLogfX,
            killLogfY - KillLogFontSize,
            510 + killLogPadding * 2,
            KillLogFontSize * 1.2 * 5 + killLogPadding * 2
        )
        this.context.restore();

        if( !this.arrayKillLog || this.arrayKillLog.length <= 0 ) return;

        this.context.save();
        const logMessage = 'was destroyed by';
        this.context.font =  KillLogFontSize + 'px Bold Arial';
        const arrayKilllogLatest5 = this.arrayKillLog.sort( (a1, a2) => {
            if( a1.fLifeTime > a2.fLifeTime ) return -1;
            if( a1.fLifeTime < a2.fLifeTime ) return 1;
            return 0;
        }).slice(0, 5);

        const logOffset = 5 - arrayKilllogLatest5.length;

        arrayKilllogLatest5.forEach( (killLog, index) => {
            if( this.tankSelf && killLog.loserTankUniqueID === this.tankSelf.uniqueID ){
                this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_ME;
            } else if( killLog.loserTankIsBot ) {
                this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_BOT;
            } else {
                this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_OTHER_PLAYER;
            }

            this.context.fillText( killLog.loserTankNickName, 
                killLogfX + killLogPadding,
                killLogfY + killLogPadding + KillLogFontSize * 1.2 * ( 5 - (index + 1) - logOffset )
            );

            this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_BOT;
            this.context.fillText( logMessage,
                killLogfX + killLogPadding + this.context.measureText(killLog.loserTankNickName).width + KillLogFontSize / 2,
                killLogfY + killLogPadding + KillLogFontSize * 1.2 * ( 5 - (index + 1) - logOffset )
            );

            if( this.tankSelf && killLog.winnerTankUniqueID === this.tankSelf.uniqueID ){
                this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_ME;
            } else if( killLog.winnerTankIsBot ) {
                this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_BOT;
            } else {
                this.context.fillStyle = RenderingSettings.NICKNAME_COLOR_OTHER_PLAYER;
            }

            this.context.fillText( killLog.winnerTankNickName + '.',
                killLogfX + killLogPadding + this.context.measureText(killLog.loserTankNickName + logMessage ).width + KillLogFontSize,
                killLogfY + killLogPadding + KillLogFontSize * 1.2 * ( 5 - (index + 1) - logOffset )
            );
        })

        this.context.restore();
    }


    renderCrisis () {
        if( this.tankSelf && !this.tankSelf.isDead && this.player.isPlaying ) {
            this.context.save();
            let shadowGlobalAlpha = Math.max(0, (this.tankSelf.iLifeMax / 2 - this.tankSelf.iLife) / (this.tankSelf.iLifeMax / 2));
            this.context.shadowColor = 'rgba(255, 0, 0,' + shadowGlobalAlpha + ')';
            // ぼかしのサイズ
            this.context.shadowBlur = 300;
            // X方向のオフセット
            this.context.shadowOffsetX = -this.browserWidth - 100;
            // Y方向のオフセット
            this.context.shadowOffsetY = -this.browserHeight - 100;
            this.context.lineWidth = 165;
            this.context.strokeRect( 0 + this.browserWidth + 100, 0 + this.browserHeight + 100, this.browserWidth, this.browserHeight);
            this.context.restore();
        }
    }

    browserResize() {
        const browserWidth = $(window).width();
        const browserHeight = $(window).height();

        let scale = RenderingSettings.SCREEN_EXPANSION_RATE_FOR_PC;
        if( browserWidth <= 1024 && browserHeight <= 768 ) {
            scale = RenderingSettings.SCREEN_EXPANSION_RATE_FOR_TABLET;
        } 
        if( browserWidth <= 850 && browserHeight <= 500 ) {
            scale = RenderingSettings.SCREEN_EXPANSION_RATE_FOR_MEDIUM_SMARTPHONE;
        }
        if( browserWidth <= 600 && browserHeight <= 400 ) {
            scale = RenderingSettings.SCREEN_EXPANSION_RATE_FOR_SMALL_SMARTPHONE;
        }

        const scaledBrowserWidth = scale * browserWidth;
        const scaledBrowserHeight = scale * browserHeight;

        this.canvas.width = scaledBrowserWidth;
        this.canvas.height = scaledBrowserHeight;
        const objBrowserSize = {};
        objBrowserSize['width'] = scaledBrowserWidth;
        objBrowserSize['height'] = scaledBrowserHeight;
        this.browserWidth = scaledBrowserWidth;
        this.browserHeight = scaledBrowserHeight;
        this.socket.emit( 'resize', objBrowserSize );
    }
}