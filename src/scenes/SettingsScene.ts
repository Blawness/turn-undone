import Phaser from 'phaser';
import { settingsManager } from '../systems/SettingsManager';
import { ResolutionPreset } from '../config/GameConfig';
import { UIFontSizes, scale } from '../utils/UIScale';

/**
 * Settings Scene
 * Allows players to configure game settings
 */
export class SettingsScene extends Phaser.Scene {
    private readonly FONT_FAMILY = '"Inter", sans-serif';

    constructor() {
        super({ key: 'SettingsScene' });
    }

    create(): void {
        const { width, height } = this.cameras.main;

        this.createBackground(width, height);
        this.createTitle(width);
        this.createResolutionSettings(width, height);
        this.createBackButton(width, height);
    }

    private createBackground(width: number, height: number): void {
        // Dark overlay background
        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a0f, 0.95);
        bg.fillRect(0, 0, width, height);

        // Decorative border
        bg.lineStyle(2, 0x6644aa, 0.5);
        bg.strokeRect(scale(50), scale(50), width - scale(100), height - scale(100));
    }

    private createTitle(width: number): void {
        const title = this.add.text(width / 2, scale(100), '⚙️ Settings', {
            fontFamily: this.FONT_FAMILY,
            fontSize: UIFontSizes.victory,
            fontStyle: 'bold',
            color: '#ffffff',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, fill: true }
        });
        title.setOrigin(0.5, 0.5);
    }

    private createResolutionSettings(width: number, height: number): void {
        const centerY = height / 2 - scale(50);

        // Section title
        const sectionTitle = this.add.text(width / 2, centerY - scale(80), 'Display Resolution', {
            fontFamily: this.FONT_FAMILY,
            fontSize: UIFontSizes.xxlarge,
            fontStyle: 'bold',
            color: '#88ccff',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        sectionTitle.setOrigin(0.5, 0.5);

        // Get current and available resolutions
        const currentPreset = settingsManager.getResolutionPreset();
        const resolutions = settingsManager.getAvailableResolutions();

        // Create resolution buttons
        const buttonWidth = scale(280);
        const buttonHeight = scale(60);
        const spacing = scale(30);
        const totalWidth = resolutions.length * buttonWidth + (resolutions.length - 1) * spacing;
        const startX = width / 2 - totalWidth / 2 + buttonWidth / 2;

        resolutions.forEach((item, index) => {
            const x = startX + index * (buttonWidth + spacing);
            const isSelected = item.preset === currentPreset;

            this.createResolutionButton(
                x,
                centerY,
                buttonWidth,
                buttonHeight,
                item.resolution.label,
                item.preset,
                isSelected
            );
        });

        // Info text
        const infoText = this.add.text(width / 2, centerY + scale(80), 'Changing resolution will restart the game', {
            fontFamily: this.FONT_FAMILY,
            fontSize: UIFontSizes.normal,
            color: '#888888',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        infoText.setOrigin(0.5, 0.5);
    }

    private createResolutionButton(
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        preset: ResolutionPreset,
        isSelected: boolean
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const borderRadius = scale(10);

        // Button background
        const bg = this.add.graphics();
        const bgColor = isSelected ? 0x4444aa : 0x2a2a4a;
        const borderColor = isSelected ? 0x88aaff : 0x6644aa;

        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
        bg.lineStyle(3, borderColor, 1);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
        container.add(bg);

        // Selected indicator
        if (isSelected) {
            const checkmark = this.add.text(-width / 2 + scale(20), 0, '✓', {
                fontFamily: this.FONT_FAMILY,
                fontSize: UIFontSizes.xlarge,
                color: '#44ff88',
            });
            checkmark.setOrigin(0.5, 0.5);
            container.add(checkmark);
        }

        // Label
        const text = this.add.text(isSelected ? scale(10) : 0, 0, label, {
            fontFamily: this.FONT_FAMILY,
            fontSize: UIFontSizes.large,
            fontStyle: isSelected ? 'bold' : 'normal',
            color: isSelected ? '#ffffff' : '#cccccc',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        text.setOrigin(0.5, 0.5);
        container.add(text);

        // Interactive zone
        const hitArea = this.add.rectangle(0, 0, width, height, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        container.add(hitArea);

        // Hover effects (only if not selected)
        if (!isSelected) {
            hitArea.on('pointerover', () => {
                bg.clear();
                bg.fillStyle(0x3a3a6a, 1);
                bg.fillRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
                bg.lineStyle(3, 0x8866cc, 1);
                bg.strokeRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
            });

            hitArea.on('pointerout', () => {
                bg.clear();
                bg.fillStyle(0x2a2a4a, 1);
                bg.fillRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
                bg.lineStyle(3, 0x6644aa, 1);
                bg.strokeRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
            });

            hitArea.on('pointerdown', () => {
                settingsManager.setResolution(preset);
            });
        }

        return container;
    }

    private createBackButton(width: number, height: number): void {
        const buttonWidth = scale(160);
        const buttonHeight = scale(50);
        const borderRadius = scale(8);
        const x = width / 2;
        const y = height - scale(100);

        const container = this.add.container(x, y);

        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(0x2a2a4a, 1);
        bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        bg.lineStyle(2, 0x6644aa, 1);
        bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        container.add(bg);

        // Label
        const text = this.add.text(0, 0, '← Back', {
            fontFamily: this.FONT_FAMILY,
            fontSize: UIFontSizes.large,
            fontStyle: 'bold',
            color: '#ffffff',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        text.setOrigin(0.5, 0.5);
        container.add(text);

        // Interactive
        const hitArea = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        container.add(hitArea);

        hitArea.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x4a4a7a, 1);
            bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
            bg.lineStyle(2, 0x8866cc, 1);
            bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        });

        hitArea.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x2a2a4a, 1);
            bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
            bg.lineStyle(2, 0x6644aa, 1);
            bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        });

        hitArea.on('pointerdown', () => {
            this.scene.start('BattleScene');
        });
    }
}
