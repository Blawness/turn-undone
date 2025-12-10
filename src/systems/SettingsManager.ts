/**
 * Settings Manager
 * Handles game settings persistence and application
 */

import { ResolutionPreset, ResolutionPresets, Resolution } from '../config/GameConfig';

const STORAGE_KEYS = {
    RESOLUTION: 'game_resolution',
} as const;

export class SettingsManager {
    private static instance: SettingsManager;

    private constructor() { }

    static getInstance(): SettingsManager {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }

    /**
     * Get current resolution preset
     */
    getResolutionPreset(): ResolutionPreset {
        const saved = localStorage.getItem(STORAGE_KEYS.RESOLUTION);
        if (saved === 'HD' || saved === 'FULL_HD') {
            return saved;
        }
        return 'FULL_HD'; // Default
    }

    /**
     * Get current resolution details
     */
    getResolution(): Resolution {
        return ResolutionPresets[this.getResolutionPreset()];
    }

    /**
     * Set resolution and reload game to apply
     */
    setResolution(preset: ResolutionPreset): void {
        const currentPreset = this.getResolutionPreset();

        if (currentPreset !== preset) {
            localStorage.setItem(STORAGE_KEYS.RESOLUTION, preset);
            // Reload to apply new resolution
            window.location.reload();
        }
    }

    /**
     * Get all available resolution presets
     */
    getAvailableResolutions(): { preset: ResolutionPreset; resolution: Resolution }[] {
        return [
            { preset: 'HD', resolution: ResolutionPresets.HD },
            { preset: 'FULL_HD', resolution: ResolutionPresets.FULL_HD },
        ];
    }
}

// Export singleton instance
export const settingsManager = SettingsManager.getInstance();
