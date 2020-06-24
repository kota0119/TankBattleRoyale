class RenderingSettings {
    static get FIELD_LINECOLOR() {return '#222'; }
    static get FIELD_LINEWIDTH() { return 2; }

    static get INFO_BACKGROUND_COLOR() { return '#FCA'; }

    static get LIFE_REMAINING_COLOR() { return 'green'; }
    static get LIFE_MISSING_COLOR() { return 'red'; }

    static get LEVELUP_ACQUIRED_SCORE_COLOR() { return 'darkblue'; }
    static get LEVELUP_REQUIRED_SCORE_COLOR() { return 'lightblue'; }

    static get SCORE_FONT() { return '40px Bold Arial'; }
    static get SCORE_COLOR() { return 'black'; }

    static get NICKNAME_FONT() { return '30px Bold Arial'; }
    static get NICKNAME_COLOR_ME() { return 'blue'; }
    static get NICKNAME_COLOR_BOT() { return '#111'; }
    static get NICKNAME_COLOR_OTHER_PLAYER() { return '#FC6828'; }

    static get SKILL_SHIELD_ACQUIRED_COLOR() { return '#FF8C00'; }
    static get SKILL_SHIELD_REQUIRED_COLOR() { return '#FFEBCD'; }
    static get SKILL_TRANSPARENT_ACQUIRED_COLOR(){ return '#800080'; }
    static get SKILL_TRANSPARENT_REQUIRED_COLOR(){ return '#FFE5FF'; } 

    static get ITEM_ICON_SIZE() { return 35; }

    static get MAP_WIDTH_HEIGHT() { return 400.0; }
    static get MAP_OFFSET_HEIGHT() { return 25.0 }

    static get SCREEN_EXPANSION_RATE_FOR_PC(){ return 1.5; }
    static get SCREEN_EXPANSION_RATE_FOR_TABLET(){ return 1.8; }
    static get SCREEN_EXPANSION_RATE_FOR_MEDIUM_SMARTPHONE(){ return 3.0; }
    static get SCREEN_EXPANSION_RATE_FOR_SMALL_SMARTPHONE(){ return 3.3; }

    static get TANK_DESCRIPTION(){
        return {
            [SharedSettings.PzKpfwIV_G] : { 
                name : "PzKpfwIV_G", 
                ability : "貫通ミサイル",
                description : "障害物を貫通するミサイルを発射できる。",
            },
            [SharedSettings.M_6] : { 
                name : "M_6",
                ability : "地雷",
                description : "敵からは見えない地雷を設置できる。",
            },
            [SharedSettings.VK3601h] : { 
                name : "VK3601h",
                ability : "スロウフィールド",
                description : "自分の周りの速度を減少させるスロウフィールドを展開できる。",
            },
            [SharedSettings.KV_2] : { 
                name : "KV_2",
                ability : "シールド",
                description : "自身を守る強固なシールドを展開できる。",
            },
            [SharedSettings.PzKpfwIV] : { 
                name : "PzKpfwIV",
                ability : "追尾ミサイル",
                description : "敵を追尾するミサイルを発射できる。",
            },
            [SharedSettings.E_100] : { 
                name : "E_100",
                ability : "ステルス",
                description : "自分をステルス状態にすることができる。<br />ステルス状態のタンクは敵からは見えない。",
            },
            [SharedSettings.Tiger_II] : { 
                name : "Tiger_II",
                ability : "透視",
                description : "ステルス状態のタンク、地雷、壁に埋まったアイテムを透視できる。",
            },
            [SharedSettings.T34] : { 
                name : "T34",
                ability : "スキルハンター",
                description : "自分が超強大な敵を倒した時、敵の能力を奪う。",
            },
        };
    }
}