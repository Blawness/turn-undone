/**
 * Game Configuration
 * Centralized settings for Turn Undone
 */

export type ResolutionPreset = 'HD' | 'FULL_HD';

export interface Resolution {
    width: number;
    height: number;
    label: string;
}

export const ResolutionPresets: Record<ResolutionPreset, Resolution> = {
    HD: {
        width: 1280,
        height: 720,
        label: 'HD (1280x720)',
    },
    FULL_HD: {
        width: 1920,
        height: 1080,
        label: 'Full HD (1920x1080)',
    },
};

// Default resolution
const DEFAULT_RESOLUTION: ResolutionPreset = 'FULL_HD';

// Get current resolution from settings or use default
function getCurrentResolution(): Resolution {
    if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('game_resolution');
        if (saved && (saved === 'HD' || saved === 'FULL_HD')) {
            return ResolutionPresets[saved as ResolutionPreset];
        }
    }
    return ResolutionPresets[DEFAULT_RESOLUTION];
}

const currentResolution = getCurrentResolution();

export const GameConfig = {
    // Display - now uses dynamic resolution
    width: currentResolution.width,
    height: currentResolution.height,
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
};

export type GameConfigType = typeof GameConfig;
