module.exports = class GameSettings {
    static get FRAMERATE() { return 30; }

    // static get TANK_SPEED() { return 350.0; }
    static get TANK_SPEED() { return 250.0; }
    //static get TANK_ROTATION_SPEED() { return 3.0; }
    static get TANK_ROTATION_SPEED() { return 2.0; }
    static get TANK_WAIT_FOR_NEW_BULLET() { return 1000.0 * 0.4; }
    static get TANK_LIFE_MAX() { return 135.0; }
    static get TANK_OFFENSIVE_POWER() { return 10.0; }
    static get TANK_KILL_REWARD_PROPORTION() { return 0.1; }
    static get TANK_STARTING_MIN_DISTANCE() { return 700.0; }

    static get WALL_COUNT() { return 30; }
    static get WALL_LIFE_MAX() { return 300.0; }
    static get WALL_WAIT_FOR_NEW_WALL() { return 1000.0 * 10.0 }

    static get BULLET_WIDTH() { return 10.0; }
    static get BULLET_HEIGHT() { return 10.0; }
    //static get BULLET_SPEED() { return 500.0; }
    static get BULLET_SPEED() { return 350.0; }
    static get BULLET_LIFETIME_MAX() { return 3.0; }

    static get ITEM_SPEEDUP_RATE() { return 1.5; }
    static get ITEM_RECOVERYUP_RATE() { return 0.02; }
    static get ITEM_DAMEGEDECREASE_RATE() { return 0.5; }
    static get ITEM_DAMEGEINCREASE_RATE() { return 1.5; }

    static get BOTTANK_COUNT() { return 15; }
    static get BOTTANK_SHOOT_PROBABILITY_PER_SEC() { return 3.0; }
    static get BOTTANK_WAIT_FOR_NEW_BOT() { return 1000.0 * 30.0 }
    static get BOTTANK_TARGET_RESET() { return 900.0; }
    static get BOTTANK_NEAREST_ENEMY() { return 450.0; }
    static get BOTTANK_STOP_DISTANCE() { return 450.0; }
    static get BOTTANK_LAYMINE_PROBABILITY_PER_SEC() { return 0.2; }
    static get BOTTANK_NEAREST_ITEM() { return 200.0; }
    static get BOTTANK_NEAREST_ITEM_NONTARGET() { return 450.0; }

    static get MINE_RADIUS() { return 15.0; }
    static get MINE_NUM_MAX() { return 20; }

    static get SLOWFIELD_RADIUS() { return 350; }

    static get TRANSPARENT_BASE_TIME() { return 50; }
    static get TRANSPARENT_LEVELUP_GAUGE_INCREASE() { return 1; }

    static get EXPLOSION_WIDTH() { return 48.0; }
    static get EXPLOSION_HEIGHT() { return 48.0; }
}
