const World = require('./World.js');
const SharedSettings = require('../public/js/SharedSettings.js');
const GameSettings = require('./GameSettings.js');

module.exports = class Game {
    start( io ) {
        const world = new World(io);
        let iTimeLast = Date.now();

        io.on('connection', 
            (socket) => {
                let player = world.createPlayer( socket.id );

                socket.on('resize',
                    (objBrowserSize) => {
                        player.setClientBrowserSize( objBrowserSize['width'], objBrowserSize['height'] );
                    }
                );

                socket.on('enter-the-game',
                    ( objConfig ) => {
                        if( world.setTank.size > 55 ) {
                            io.to( socket.id ).emit('crowded');
                            return;
                        }

                        console.log('enter-the-game:socket.id = %s', socket.id);
                        const nkName = objConfig.strNickName;
                        const tankTypeNum = Number(objConfig.tankTypeNum);
                        if( !nkName || nkName.length > 8 || /^\s*$/.test(nkName) ){
                            io.to( socket.id ).emit('dead');
                            return;
                        } 
                        if( !Number.isInteger(tankTypeNum) || tankTypeNum < 0 || Object.keys(SharedSettings.TANK_TYPE_INFO).length <= tankTypeNum ){
                            io.to( socket.id ).emit('dead');
                            return;
                        }

                        player.tank = world.createTank(socket.id, nkName, tankTypeNum );
                        player.isPlaying = true;
                    }
                );

                socket.on( 'change-my-movement',
                    ( objMovement ) => {
                        if( player.tank && !player.tank.isDead ) {
                            player.tank.objMovement = objMovement;
                        } else if( player && !player.isPlaying ) {
                            player.objMovement = objMovement;
                        }
                    }
                )

                socket.on('shoot',
                    () => {
                        if (!player.tank || player.tank.isDead ) return;
                        world.createBullet( player.tank );
                    }
                )

                socket.on('landmine',
                    () => {
                        if (!player.tank || player.tank.isDead || !player.tank.tankType[SharedSettings.M_6] ) return;
                        world.createMine( player.tank );
                    }
                )

                socket.on('transparent',
                    () => {
                        if (!player.tank || player.tank.isDead || !player.tank.tankType[SharedSettings.E_100] ) return;
                        player.tank.changeTransparent();
                    }
                )

                socket.on( 'disconnect', 
                    () => {
                        console.log( 'disconnect: socket.id = %s', socket.id );

                        if( player.tank ) {
                            world.destroyTank( player.tank );
                            player.tank = null;
                        }

                        world.destroyPlayer( player );
                        player = null;
                    }
                )

                console.log('connection: socket.id = %s', socket.id);
            }
        );

        setInterval(
            () => {
                const iTimeCurrent = Date.now();
                const fDeltaTime = ( iTimeCurrent - iTimeLast ) * 0.001;
                iTimeLast = iTimeCurrent;
                // const hrtime = process.hrtime();
                world.update( fDeltaTime );
                // const hrtimeDiff = process.hrtime(hrtime);
                // const iNanosecDiff = hrtimeDiff[0] * 1e9 + hrtimeDiff[1];

                Array.from( world.setPlayer ).forEach(
                    ( player ) => {
                        const rectVisibleArea = {
                            fLeft : player.fX - player.clientBrowserWidth * 0.5,
                            fBottom : player.fY - player.clientBrowserHeight * 0.5,
                            fRight : player.fX + player.clientBrowserWidth * 0.5,
                            fTop : player.fY + player.clientBrowserHeight * 0.5,
                        }

                        io.to( player.strSocketID ).emit('update',
                            player,
                            Array.from( world.setTank ).filter( tank => tank.emitFilter(player) ).map(
                                (tank) => {
                                    return tank.toJSON( rectVisibleArea );
                                }
                            ),
                            Array.from( world.setWall ).map(
                                (wall) => {
                                    return wall.toJSON( rectVisibleArea );
                                }
                            ),
                            Array.from( world.setBullet ).map(
                                (bullet) => {
                                    return bullet.toJSON( rectVisibleArea );
                                }
                            ),
                            Array.from( world.setMine ).filter( mine => mine.emitFilter(player) ).map(
                                (mine) => {
                                    return mine.toJSON( rectVisibleArea );
                                }
                            ),
                            Array.from( world.setShield ).filter( shield => shield.emitFilter(player) ).map(
                                (shield) => {
                                    return shield.toJSON( rectVisibleArea );
                                }
                            ),
                            Array.from( world.setSlowField ).filter( slowField => slowField.emitFilter(player) ).map(
                                (slowField) => {
                                    return slowField.toJSON( rectVisibleArea );
                                }
                            ),
                            Array.from( world.setItem ).filter( item => item.emitFilter(player) ).map(
                                (item) => {
                                    return item.toJSON( rectVisibleArea );
                                }
                            ),
                            Array.from( world.setExplosion ).map(
                                (explosion) => {
                                    return explosion.toJSON( rectVisibleArea );
                                }
                            ),
                            Array.from( world.setSound ).map(
                                (sound) => {
                                    return sound.toJSON( rectVisibleArea );
                                }
                            ),
                            Array.from( world.setKillLog ).map(
                                (killLog) => {
                                    return killLog.toJSON();
                                }
                            ),
                            // iNanosecDiff,
                        );
                    }
                );
                Array.from( world.setExplosion ).forEach( explosion => explosion.emitEndUpdate() );
                Array.from( world.setSound ).forEach( sound => sound.emitEndUpdate() );
            }
            ,1000 / GameSettings.FRAMERATE
        );
    }
}