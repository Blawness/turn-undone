import Phaser from 'phaser';

/**
 * Boot Scene
 * Handles asset loading and initialization
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload(): void {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222244, 0.8);
        progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 10);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
        });
        loadingText.setOrigin(0.5, 0.5);

        // Loading progress
        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0x6644aa, 1);
            progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 5);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Load character sprites
        this.load.image('player', 'assets/sprites/player.png');
        this.load.image('goblin', 'assets/sprites/goblin.png');
        this.load.image('slime', 'assets/sprites/slime.png');
        this.load.image('dark_knight', 'assets/sprites/dark_knight.png');
    }

    create(): void {
        // Transition to battle scene
        this.scene.start('BattleScene');
    }
}
