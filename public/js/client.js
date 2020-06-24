'use strict';

const socket = io.connect();
const canvas = document.querySelector('#canvas-2d');
const assets = new Assets();
const screen = new Screen( socket, canvas, assets );
screen.animate(0);

const muteButton = $('#muteIcon');
const volumeOnButton = $('#volumeOnIcon');
muteButton.on('click', function(){
    muteButton.css('display', "none");
    volumeOnButton.css('display', "inline");
    screen.isMute = false;
})
volumeOnButton.on('click', function(){
    muteButton.css('display', "inline");
    volumeOnButton.css('display', "none");
    screen.isMute = true;
})


for( let i = 0; i < SharedSettings.itemTotalNumber; i++ ) {
    const itemImage = assets.itemEffect[i][0];

    const div = $('<div></div>').css({
        'width': '16px',
        'height': '16px',
        'overflow': 'hidden',
        'object-fit':'contain',
        'position': 'relative',
        'display':'inline-block',
        'margin-bottom': '-2px',
    })
    const sx = itemImage.sx;
    const sy = itemImage.sy;    
    const sw = itemImage.sx + itemImage.sw;
    const sh = itemImage.sy + itemImage.sh;
    const img = $('<img />').attr({'src':assets.imageSprite.src,}).css({
        'display':'inline-block',
        'position': 'absolute',
        'left':(-sx) + "px",
        'top':(-sy) + "px",
        'vertical-align':'top',
        'clip': 'rect('+sy+'px '+sw+'px '+sh+'px '+sx+'px)',
        'zoom':16/itemImage.sh,
    })
    div.append(img);
    $('#item' + (i+1)).prepend(div);
}

const single = $(".single");
for( let i = 0; i < Object.keys(SharedSettings.TANK_TYPE_INFO).length; i++ ) {
    const tankDescription = RenderingSettings.TANK_DESCRIPTION[i];
    const tankImg = assets.tankType[i];
    const tankName = $("<div></div>").addClass('tankName').text( tankDescription.name );
    const tankHeight = 500 * 0.2;
    const tankWidth = tankImg.sw * (tankHeight / tankImg.sh);
    const div = $('<div></div>').css({
        'height': tankHeight + 'px',
        'width': tankWidth + 'px',
        'margin':'6% auto 6%',
        'overflow': 'hidden',
        'object-fit':'contain',
        'position': 'relative',
    })
    const sx = tankImg.sx;
    const sy = tankImg.sy;    
    const sw = tankImg.sx + tankImg.sw;
    const sh = tankImg.sy + tankImg.sh;
    const img = $('<img />').attr({'src':assets.imageSprite.src,}).css({
        'display':'inline-block',
        'position': 'absolute',
        'left':(-sx) + "px",
        'top':(-sy) + "px",
        'vertical-align':'top',
        'clip': 'rect('+sy+'px '+sw+'px '+sh+'px '+sx+'px)',
        'zoom':tankHeight/tankImg.sh,
    })
    div.append(img);

    const ability = $("<div></div>").addClass('ability').text( "【能力】" + tankDescription.ability );
    const abilityDescription = $("<p></p").addClass('abilityDescription').html( tankDescription.description );
    const button = $('<button></button').addClass('tankSelect').text('決定');
    const content = $("<li></li>").addClass('content');
    content.append(tankName).append(div).append(ability).append(abilityDescription).append(button);
    single.append(content);
}

const thumb = $('.thumb');
for( let i = 0; i < Object.keys(SharedSettings.TANK_TYPE_INFO).length; i++ ) {
    const tankImg = assets.tankType[i];
    const tankWidth = 70;
    const tankHeight = 28;
    const div = $('<div></div>').css({
        'height': tankHeight + 'px',
        'width': tankWidth + 'px',
        'overflow': 'hidden',
        'object-fit':'contain',
        'position': 'relative',
        'margin': 'auto',
    })
    const sx = tankImg.sx;
    const sy = tankImg.sy;    
    const sw = tankImg.sx + tankImg.sw;
    const sh = tankImg.sy + tankImg.sh;

    const widthSpace = (tankWidth - tankImg.sw * (tankHeight / tankImg.sh)) * (tankImg.sh/tankHeight) / 2;
    const img = $('<img />').attr({'src':assets.imageSprite.src,}).css({
        'display':'inline-block',
        'position': 'absolute',
        'left':(-sx + widthSpace) + "px",
        'top':(-sy) + "px",
        'vertical-align':'top',
        'clip': 'rect('+sy+'px '+sw+'px '+sh+'px '+sx+'px)',
        'zoom':tankHeight/tankImg.sh,
    })
    div.append(img);

    const thumbImg = $("<li></li>").addClass('thumbImg');
    thumbImg.append(div);
    thumb.append(thumbImg);
}

single.slick({
    accessibility: true,
    infinite:false,
    asNavFor: thumb,
});
thumb.slick({
    accessibility: true,
    infinite:false,
    slidesToShow: 8,
    slidesToScroll: 8,
    asNavFor:single,
    focusOnSelect: true,
    arrows: false,
    draggable: false,
    initialSlide: 0,
});

$('#showTankType').on('click',function () {
    single.css('opacity', 0);
    single.animate({'z-index':1}, 300, function(){
        single.slick('setPosition');
        thumb.slick('setPosition');
        single.animate({'opacity':1})
    })
});

$('.modal').modaal({
    content_source: '#modal',
    background: '#222',
    width: 640,
    height:500, 
});

$('.helpModal').modaal({
    content_source: '#helpModal',
    background: '#222',
    width: 450,
    height:550, 
});

let selectedTankTypeNum = null;
$('.tankSelect').on('click', function(){
    const tankType = $(this).siblings('.tankName').text();
    $('#showTankType').text(tankType);
    selectedTankTypeNum = $(this).parents('.slick-slide').attr("data-slick-index");
    $('.modal').modaal('close');
})

window.onbeforeunload = function(e){
    e.returnValue = "このページを離れますか？";
}

$(window).on(
    'unload',
    (event) => {
        socket.disconnect();
    }
)

let objMovement = {};

$( document ).on('keydown keyup',
    (event) => {
        if( event.type === 'keydown' && document.activeElement === document.querySelector('#nickname') ) return;

        const keyToCommand = {
            'ArrowUp': 'forward',
            'ArrowDown': 'back',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'forward',
            's': 'back',
            'a': 'left',
            'd': 'right',
        }
        const command = keyToCommand[event.key];
        if ( command ) {
            if( event.type === 'keydown' ) {
                objMovement[command] = true;
            } else {// if (event.type === 'keyup')
                objMovement[command] = false;
            }
        }
        
        socket.emit('change-my-movement', objMovement);
        if( event.key === 'p' && event.type === 'keydown'){
            screen.renderMapFlag = !screen.renderMapFlag;
        }
        if( event.key === 'i' && event.type === 'keydown'){
            screen.renderInfoFlag = !screen.renderInfoFlag;
        }

        if (!screen.tankSelf || screen.tankSelf.isDead ) return;

        if( event.key === ' ' && event.type === 'keydown' ) {
            socket.emit('shoot');
        }

        if( event.key === 'm' && event.type === 'keydown' && screen.tankSelf.tankType[SharedSettings.M_6] ) {
            socket.emit('landmine');
        }

        if( event.key === 't' && event.type === 'keydown' && screen.tankSelf.tankType[SharedSettings.E_100] ) {
            socket.emit('transparent');
        }
    }
);

function playStart() {
    const nkName = $('#nickname').val();
    const tankType = $('#showTankType').text();

    let checkOK = true;
    if( nkName.length > 8 ) {
        $('#errorMsg-Nickname').text('　ニックネームは8文字以内にしてください。');
        checkOK = false;
    } else if( /^\s*$/.test(nkName) ){
        $('#errorMsg-Nickname').text('　ニックネームを入力してください。');
        checkOK = false;
    } else {
        $('#errorMsg-Nickname').text('');
    }

    if( tankType === 'タンク選択' || selectedTankTypeNum === null ) {
        $('#errorMsg-tankType').text('　タンクを選択してください。');
        checkOK = false;
    } else {
        $('#errorMsg-tankType').text('');
    }

    if( !checkOK ) return;

    screen.tankSelf = null;
    const objConfig = { 
        strNickName: nkName,
        tankTypeNum: selectedTankTypeNum,
    };
    socket.emit('enter-the-game', objConfig );
    $('#start-screen').hide();
}

$('#start-button').on('click',
    () => {
        playStart();
    }
)

$('#canvas-2d').on('touchstart', 
    (event) => {
        if( !screen.tankSelf ) return;
        event.preventDefault();
        socket.emit('shoot');
        objMovement['forward'] = true;
        Array.from( event.originalEvent.changedTouches ).forEach(
            ( touch ) => {
                let x = (touch.pageX - canvas.offsetLeft) - canvas.clientWidth * 0.5;
                let y = (touch.pageY - canvas.offsetTop) - canvas.clientHeight * 0.5;
                objMovement['changeAngle'] = Math.atan2( y, x );
            }
        );
        socket.emit( 'change-my-movement', objMovement );
    }
);

$('#canvas-2d').on('touchmove',
    (event) => {
        if( !screen.tankSelf ) return;
        event.preventDefault();
        objMovement['forward'] = true;
        Array.from( event.originalEvent.changedTouches ).forEach(
            ( touch ) => {
                let x = (touch.pageX - canvas.offsetLeft) - canvas.clientWidth * 0.5;
                let y = (touch.pageY - canvas.offsetTop) - canvas.clientHeight * 0.5;
                objMovement['changeAngle'] = Math.atan2( y, x );
            }
        );
        socket.emit( 'change-my-movement', objMovement );
    }
);

$('#canvas-2d').on('touchend',
    (event) => {
        if( !screen.tankSelf ) return;
        event.preventDefault();
        objMovement = {};
        socket.emit( 'change-my-movement', objMovement );
    }
)

$(window).resize( 
    () => {
        screen.browserResize();
    }
)

document.oncontextmenu = function () { return false; }