/**
 * UI Scale Utility
 * Provides consistent UI scaling across different resolutions
 */

import { GameConfig } from '../config/GameConfig';

// Base resolution for UI design (HD as reference)
const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;

/**
 * Calculate scale factor based on current resolution
 */
export function getUIScale(): number {
    const widthScale = GameConfig.width / BASE_WIDTH;
    const heightScale = GameConfig.height / BASE_HEIGHT;
    // Use the smaller scale to ensure UI fits
    return Math.min(widthScale, heightScale);
}

/**
 * Scale a value based on current resolution
 */
export function scale(value: number): number {
    return Math.round(value * getUIScale());
}

/**
 * Scale font size and return as string with 'px'
 */
export function scaleFontSize(baseSize: number): string {
    return `${scale(baseSize)}px`;
}

/**
 * UI Dimensions - all values are scaled automatically
 */
export const UIDimensions = {
    // Stats panel
    statsPanel: {
        get width() { return scale(180); },
        get height() { return scale(70); },
        get padding() { return scale(10); },
        get borderRadius() { return scale(8); },
    },

    // HP/MP bars
    bars: {
        get width() { return scale(150); },
        get height() { return scale(18); },
        get borderRadius() { return scale(4); },
    },

    // Action buttons
    actionButton: {
        get width() { return scale(110); },
        get height() { return scale(50); },
        get spacing() { return scale(8); },
        get borderRadius() { return scale(6); },
    },

    // Message display
    messageBox: {
        get width() { return scale(600); },
        get height() { return scale(50); },
        get borderRadius() { return scale(8); },
    },

    // Echo display
    echoItem: {
        get width() { return scale(80); },
        get height() { return scale(40); },
        get spacing() { return scale(100); },
        get borderRadius() { return scale(6); },
    },

    // Settings button
    settingsButton: {
        get size() { return scale(44); },
        get borderRadius() { return scale(8); },
    },

    // Restart button
    restartButton: {
        get width() { return scale(160); },
        get height() { return scale(50); },
        get borderRadius() { return scale(8); },
    },

    // General spacing
    spacing: {
        get small() { return scale(8); },
        get medium() { return scale(16); },
        get large() { return scale(24); },
    },
};

/**
 * UI Font Sizes - all values are scaled automatically
 */
export const UIFontSizes = {
    get tiny() { return scaleFontSize(12); },
    get small() { return scaleFontSize(14); },
    get normal() { return scaleFontSize(16); },
    get medium() { return scaleFontSize(18); },
    get large() { return scaleFontSize(20); },
    get xlarge() { return scaleFontSize(24); },
    get xxlarge() { return scaleFontSize(28); },
    get title() { return scaleFontSize(32); },
    get huge() { return scaleFontSize(42); },
    get victory() { return scaleFontSize(48); },
};

/**
 * Character sprite scaling
 */
export const SpriteScale = {
    get character() { return 0.25 * getUIScale(); },
    get shadow() { return scale(100); },
    get shadowHeight() { return scale(25); },
    get nameOffset() { return scale(-80); },
};
