/**
 * Game Configuration
 * Centralized settings for Turn Undone
 */

export const GameConfig = {
    // Display
    width: 960,
    height: 540,
    backgroundColor: 0x1a1a2e,

    // Battle settings
    battle: {
        playerStartHP: 100,
        playerStartMP: 50,
        mpRegenPerTurn: 5,
    },

    // Echo system
    echo: {
        maxActiveEchoes: 10,
        defaultDuration: 2, // turns
    },

    // Debug
    debug: {
        showHitboxes: false,
        logActions: true,
    },
} as const;

export type GameConfigType = typeof GameConfig;
