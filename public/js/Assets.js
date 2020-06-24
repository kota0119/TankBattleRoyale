class Assets {
    constructor() {
        this.imageSprite = new Image();
        this.imageSprite.src = '../images/spritesheet.png';
        this.imageSpriteRectArea = { sx:0, sy:0, sw:566, sh:4727 };

        this.sandImageRectArea = { sx: 5, sy: 3334, sw: SharedSettings.FIELDTILE_WIDTH, sh: SharedSettings.FIELDTILE_HEIGHT };
        this.bulletImageRectArea = { sx:5, sy: 2611, sw:8, sh:8 }

        this.wallType = [];
        const bronzeWall = { sx:5, sy:3052, sw:SharedSettings.WALL_WIDTH, sh:SharedSettings.WALL_HEIGHT, color:'brown' };
        this.wallType[0] = bronzeWall;

        const silverWall = { sx:5, sy:3146, sw:SharedSettings.WALL_WIDTH, sh:SharedSettings.WALL_HEIGHT, color:'rgb(110, 110, 110)' };
        this.wallType[1] = silverWall;

        const goldenWall = { sx:5, sy:3240, sw:SharedSettings.WALL_WIDTH, sh:SharedSettings.WALL_HEIGHT, color:'orange' };
        this.wallType[2] = goldenWall;

        this.tankType = [];
        const PzKpfwIV_G = Object.assign( { sx:5, sy:2105} , SharedSettings.TANK_TYPE_INFO[SharedSettings.PzKpfwIV_G] );
        this.tankType[SharedSettings.PzKpfwIV_G] = PzKpfwIV_G;

        const M_6 = Object.assign( { sx:5, sy:253} , SharedSettings.TANK_TYPE_INFO[SharedSettings.M_6] );
        this.tankType[SharedSettings.M_6] = M_6;

        const VK3601h = Object.assign( { sx:5, sy:2474} , SharedSettings.TANK_TYPE_INFO[SharedSettings.VK3601h] );
        this.tankType[SharedSettings.VK3601h] = VK3601h;

        const KV_2 = Object.assign( { sx:5, sy:111} , SharedSettings.TANK_TYPE_INFO[SharedSettings.KV_2] );
        this.tankType[SharedSettings.KV_2] = KV_2;

        const PzKpfwIV = Object.assign( { sx:5, sy:1972} , SharedSettings.TANK_TYPE_INFO[SharedSettings.PzKpfwIV] );
        this.tankType[SharedSettings.PzKpfwIV] = PzKpfwIV;

        const E_100 = Object.assign( { sx:5, sy:5} , SharedSettings.TANK_TYPE_INFO[SharedSettings.E_100] );
        this.tankType[SharedSettings.E_100] = E_100;

        const Tiger_II = Object.assign( { sx:5, sy:2344} , SharedSettings.TANK_TYPE_INFO[SharedSettings.Tiger_II] );
        this.tankType[SharedSettings.Tiger_II] = Tiger_II;

        const T34 = Object.assign( { sx:5, sy:2244} , SharedSettings.TANK_TYPE_INFO[SharedSettings.T34] ); 
        this.tankType[SharedSettings.T34] = T34;

        this.landmineImageRectArea = { sx:5, sy:2895, sw:147, sh:147 };
        this.shieldImageRectArea = { sx: 5, sy:4166, sw:556, sh:556 };
        this.slowFieldImageRectArea = { sx: 5, sy:3600, sw:556, sh:556 };

        this.itemEffect = [];
        const itemArray1 = [];
        itemArray1[0] = { sx: 5, sy:372, sw:190, sh:190 };
        itemArray1[1] = { sx: 5, sy:1172, sw:190, sh:190 };
        this.itemEffect[SharedSettings.itemSpeedUpNum] = itemArray1;

        const itemArray2 = [];
        itemArray2[0] = { sx: 5, sy:572, sw:190, sh:190 };
        itemArray2[1] = { sx: 5, sy:1372, sw:190, sh:190 };
        this.itemEffect[SharedSettings.itemRecoveryUpNum] = itemArray2;

        const itemArray3 = [];
        itemArray3[0] = { sx: 5, sy:772, sw:190, sh:190 };
        itemArray3[1] = { sx: 5, sy:1572, sw:190, sh:190 };
        this.itemEffect[SharedSettings.itemDamegeDecreaseNum] = itemArray3;

        const itemArray4 = [];
        itemArray4[0] = { sx: 5, sy:972, sw:190, sh:190 };
        itemArray4[1] = { sx: 5, sy:1772, sw:190, sh:190 };
        this.itemEffect[SharedSettings.itemDamegeIncreaseNum] = itemArray4;

        this.explosionImageRectArea = { sx: 5, sy:2629, sw:64, sh:64 };

        this.sounds = [];
        const explosionSound = new Audio();
        explosionSound.src = '../sounds/explosion.wav';
        this.sounds[SharedSettings.explosionSoundNum] = explosionSound;

        const levelUpSound = new Audio();
        levelUpSound.src = '../sounds/VOLUME_abilityLearn.wav';
        this.sounds[SharedSettings.levelUpSoundNum] = levelUpSound;

        const itemGetSound = new Audio();
        itemGetSound.src = '../sounds/VOLUME_itemPickup.wav';
        this.sounds[SharedSettings.itemGetSoundNum] = itemGetSound;
    }
}