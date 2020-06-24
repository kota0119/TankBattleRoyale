class SharedSettings {
    static get FIELDTILE_WIDTH() { return 256.0; }
    static get FIELDTILE_HEIGHT() { return 256.0; }

    static get FIELD_WIDTH() { return this.FIELDTILE_WIDTH * 30; }
    static get FIELD_HEIGHT() { return this.FIELDTILE_HEIGHT * 30; }

    static get WALL_WIDTH() { return 250.0; }
    static get WALL_HEIGHT() { return 84.0; }

    static get TANK_MAX_LEVEL() { return 50; }

    static get PzKpfwIV_G() { return 0; }
    static get M_6() { return 1; }
    static get VK3601h() { return 2; }
    static get KV_2() { return 3; }
    static get PzKpfwIV() { return 4; }
    static get E_100() { return 5; }
    static get Tiger_II() { return 6; }
    static get T34() { return 7; }

    static get itemTotalNumber() { return 4; }
    static get itemEffectTime() { return 60.0; }
    static get itemSpeedUpNum() { return 0; }
    static get itemRecoveryUpNum() { return 1; }
    static get itemDamegeDecreaseNum() { return 2; }
    static get itemDamegeIncreaseNum() { return 3; }

    static get TANK_TYPE_INFO(){
        return {
            [this.PzKpfwIV_G] : { sw:253, sh:129 },
            [this.M_6] : { sw:270, sh:109 },
            [this.VK3601h] : { sw:243, sh:127 },
            [this.KV_2] : { sw:254, sh:132 },
            [this.PzKpfwIV] : { sw:241, sh:123 },
            [this.E_100] : { sw:207, sh:96  },
            [this.Tiger_II] : { sw:290, sh:120 },
            [this.T34] : { sw:178, sh:90  },
        };
    }

    static get explosionSoundNum() { return 0; }
    static get levelUpSoundNum() { return 1; }
    static get itemGetSoundNum() { return 2; }
}

if( typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
    module.exports = SharedSettings;
}
