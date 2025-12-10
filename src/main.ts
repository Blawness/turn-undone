import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { BattleScene } from './scenes/BattleScene';
import { SettingsScene } from './scenes/SettingsScene';

/**
 * Turn Undone: Echoes of the Last Move
 * Main game entry point
 */

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GameConfig.width,
    height: GameConfig.height,
    parent: 'game-container',
    backgroundColor: GameConfig.backgroundColor,
    pixelArt: true,
    roundPixels: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, BattleScene, SettingsScene],
};

const game = new Phaser.Game(config);

// For debugging in console
(window as any).game = game;

export default game;
