import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EchoSystem, EchoEffect } from '../systems/EchoSystem';
import { Action } from '../actions/Action';
import { UIDimensions, UIFontSizes, scale } from '../utils/UIScale';

/**
 * Battle UI
 * Handles all UI elements for the battle scene
 */
export class BattleUI {
    private scene: Phaser.Scene;
    private player: Player;
    private enemy: Enemy;
    private echoSystem: EchoSystem;

    // UI Containers
    private uiContainer!: Phaser.GameObjects.Container;
    private actionButtons: Phaser.GameObjects.Container[] = [];
    private actionCallback?: (action: Action) => void;

    // UI Elements
    private playerHPBar!: Phaser.GameObjects.Graphics;
    private playerMPBar!: Phaser.GameObjects.Graphics;
    private enemyHPBar!: Phaser.GameObjects.Graphics;
    private playerStatsText!: Phaser.GameObjects.Text;
    private enemyStatsText!: Phaser.GameObjects.Text;
    private messageText!: Phaser.GameObjects.Text;
    private echoTimelineContainer!: Phaser.GameObjects.Container;
    private restartButton?: Phaser.GameObjects.Container;

    // Font styles - Inter for clean HD text
    private readonly FONT_PIXEL = '"Inter", sans-serif';
    private readonly FONT_READABLE = '"Inter", sans-serif';

    constructor(
        scene: Phaser.Scene,
        player: Player,
        enemy: Enemy,
        echoSystem: EchoSystem
    ) {
        this.scene = scene;
        this.player = player;
        this.enemy = enemy;
        this.echoSystem = echoSystem;
    }

    create(): void {
        const { width, height } = this.scene.cameras.main;

        this.uiContainer = this.scene.add.container(0, 0);

        // Create stat displays
        this.createPlayerStats(scale(20), scale(20));
        this.createEnemyStats(width - UIDimensions.statsPanel.width - scale(20), scale(20));

        // Create action menu
        this.createActionMenu(width / 2, height - scale(80));

        // Create message display
        this.createMessageDisplay(width / 2, height - scale(160));

        // Create echo timeline
        this.createEchoTimeline(width / 2, scale(80));

        // Create settings button
        this.createSettingsButton(width - scale(50), height - scale(50));
    }

    private createPlayerStats(x: number, y: number): void {
        const container = this.scene.add.container(x, y);
        const panel = UIDimensions.statsPanel;

        // Background panel
        const panelGfx = this.scene.add.graphics();
        panelGfx.fillStyle(0x000000, 0.6);
        panelGfx.fillRoundedRect(0, 0, panel.width, panel.height, panel.borderRadius);
        panelGfx.lineStyle(2, 0x4488ff, 0.8);
        panelGfx.strokeRoundedRect(0, 0, panel.width, panel.height, panel.borderRadius);
        container.add(panelGfx);

        // Name
        const nameText = this.scene.add.text(panel.padding, panel.padding, `⚔️ ${this.player.name}`, {
            fontFamily: this.FONT_PIXEL,
            fontSize: UIFontSizes.large,
            color: '#88ddff',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        container.add(nameText);

        // HP Bar
        this.playerHPBar = this.scene.add.graphics();
        container.add(this.playerHPBar);
        this.drawBar(this.playerHPBar, panel.padding, scale(30), this.player.hp, this.player.stats.maxHP, 0x44ff44, 'HP');

        // MP Bar
        this.playerMPBar = this.scene.add.graphics();
        container.add(this.playerMPBar);
        this.drawBar(this.playerMPBar, panel.padding, scale(50), this.player.mp, this.player.stats.maxMP, 0x4488ff, 'MP');

        // Stats text
        this.playerStatsText = this.scene.add.text(panel.width - scale(15), scale(30), '', {
            fontFamily: this.FONT_READABLE,
            fontSize: UIFontSizes.large,
            color: '#ffffff',
            align: 'right',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        this.playerStatsText.setOrigin(1, 0);
        container.add(this.playerStatsText);

        this.uiContainer.add(container);
    }

    private createEnemyStats(x: number, y: number): void {
        const container = this.scene.add.container(x, y);
        const panel = UIDimensions.statsPanel;

        // Background panel
        const panelGfx = this.scene.add.graphics();
        panelGfx.fillStyle(0x000000, 0.6);
        panelGfx.fillRoundedRect(0, 0, panel.width, panel.height, panel.borderRadius);
        panelGfx.lineStyle(2, 0xff4444, 0.8);
        panelGfx.strokeRoundedRect(0, 0, panel.width, panel.height, panel.borderRadius);
        container.add(panelGfx);

        // Name
        const nameText = this.scene.add.text(panel.padding, panel.padding, `👹 ${this.enemy.name}`, {
            fontFamily: this.FONT_PIXEL,
            fontSize: UIFontSizes.large,
            color: '#ff9999',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        container.add(nameText);

        // HP Bar
        this.enemyHPBar = this.scene.add.graphics();
        container.add(this.enemyHPBar);
        this.drawBar(this.enemyHPBar, panel.padding, scale(30), this.enemy.hp, this.enemy.stats.maxHP, 0xff4444, 'HP');

        // Stats text
        this.enemyStatsText = this.scene.add.text(panel.width - scale(15), scale(45), '', {
            fontFamily: this.FONT_READABLE,
            fontSize: UIFontSizes.large,
            color: '#ffffff',
            align: 'right',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        this.enemyStatsText.setOrigin(1, 0);
        container.add(this.enemyStatsText);

        this.uiContainer.add(container);
    }

    private drawBar(
        graphics: Phaser.GameObjects.Graphics,
        x: number,
        y: number,
        current: number,
        max: number,
        color: number,
        _label: string
    ): void {
        graphics.clear();
        const barWidth = UIDimensions.bars.width;
        const barHeight = UIDimensions.bars.height;
        const borderRadius = UIDimensions.bars.borderRadius;

        // Background
        graphics.fillStyle(0x333333, 1);
        graphics.fillRoundedRect(x, y, barWidth, barHeight, borderRadius);

        // Fill
        const fillWidth = Math.max(0, (current / max) * barWidth);
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(x, y, fillWidth, barHeight, borderRadius);

        // Border
        graphics.lineStyle(1, 0xffffff, 0.3);
        graphics.strokeRoundedRect(x, y, barWidth, barHeight, borderRadius);

        // Text is added separately (handled by update)
    }

    private createActionMenu(x: number, y: number): void {
        const container = this.scene.add.container(x, y);
        const skills = this.player.skills;
        const btn = UIDimensions.actionButton;
        const totalWidth = skills.length * btn.width + (skills.length - 1) * btn.spacing;
        const startX = -totalWidth / 2;

        skills.forEach((skill, index) => {
            const buttonX = startX + index * (btn.width + btn.spacing) + btn.width / 2;
            const button = this.createActionButton(buttonX, 0, btn.width, btn.height, skill);
            container.add(button);
            this.actionButtons.push(button);
        });

        this.uiContainer.add(container);
    }

    private createActionButton(
        x: number,
        y: number,
        width: number,
        height: number,
        action: Action
    ): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);
        const borderRadius = UIDimensions.actionButton.borderRadius;

        // Button background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2a2a4a, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
        bg.lineStyle(2, 0x6644aa, 1);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
        container.add(bg);

        // Icon
        const text = this.scene.add.text(0, scale(-8), `${action.icon}`, {
            fontFamily: this.FONT_READABLE,
            fontSize: UIFontSizes.xlarge,
        });
        text.setOrigin(0.5, 0.5);
        container.add(text);

        // Name
        const nameText = this.scene.add.text(0, scale(14), action.name, {
            fontFamily: this.FONT_PIXEL,
            fontSize: UIFontSizes.normal,
            color: '#dddddd',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        nameText.setOrigin(0.5, 0.5);
        container.add(nameText);

        // MP cost indicator
        if (action.mpCost > 0) {
            const mpBadgeW = scale(24);
            const mpBadgeH = scale(16);
            const mpBg = this.scene.add.graphics();
            mpBg.fillStyle(0x2244aa, 0.9);
            mpBg.fillRoundedRect(width / 2 - mpBadgeW - scale(2), -height / 2 + scale(2), mpBadgeW, mpBadgeH, scale(4));
            container.add(mpBg);

            const mpText = this.scene.add.text(width / 2 - mpBadgeW / 2 - scale(2), -height / 2 + scale(2) + mpBadgeH / 2, `${action.mpCost}`, {
                fontFamily: this.FONT_READABLE,
                fontSize: UIFontSizes.medium,
                color: '#88ccff',
                shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
            });
            mpText.setOrigin(0.5, 0.5);
            container.add(mpText);
        }

        // Interactive zone
        const hitArea = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        container.add(hitArea);

        // Hover effects
        hitArea.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x4a4a7a, 1);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
            bg.lineStyle(2, 0x8866cc, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
        });

        hitArea.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x2a2a4a, 1);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
            bg.lineStyle(2, 0x6644aa, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
        });

        hitArea.on('pointerdown', () => {
            if (action.canUse(this.player) && this.actionCallback) {
                this.actionCallback(action);
            }
        });

        // Store action reference
        (container as any).action = action;
        (container as any).hitArea = hitArea;
        (container as any).bg = bg;

        return container;
    }

    private createMessageDisplay(x: number, y: number): void {
        const msg = UIDimensions.messageBox;

        // Background panel
        const panel = this.scene.add.graphics();
        panel.fillStyle(0x000000, 0.7);
        panel.fillRoundedRect(x - msg.width / 2, y - msg.height / 2, msg.width, msg.height, msg.borderRadius);
        this.uiContainer.add(panel);

        // Message text
        this.messageText = this.scene.add.text(x, y, 'Prepare for battle!', {
            fontFamily: this.FONT_READABLE,
            fontSize: UIFontSizes.xlarge,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: msg.width - scale(20) },
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, fill: true }
        });
        this.messageText.setOrigin(0.5, 0.5);
        this.uiContainer.add(this.messageText);
    }

    private createEchoTimeline(x: number, y: number): void {
        this.echoTimelineContainer = this.scene.add.container(x, y);

        // Title
        const title = this.scene.add.text(0, scale(-20), '⚡ Active Echoes', {
            fontFamily: this.FONT_PIXEL,
            fontSize: UIFontSizes.medium,
            color: '#aaaaaa',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        title.setOrigin(0.5, 0.5);
        this.echoTimelineContainer.add(title);

        this.uiContainer.add(this.echoTimelineContainer);
    }

    private createSettingsButton(x: number, y: number): void {
        const btn = UIDimensions.settingsButton;
        const container = this.scene.add.container(x, y);

        // Button background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2a2a4a, 0.8);
        bg.fillRoundedRect(-btn.size / 2, -btn.size / 2, btn.size, btn.size, btn.borderRadius);
        bg.lineStyle(2, 0x6644aa, 0.8);
        bg.strokeRoundedRect(-btn.size / 2, -btn.size / 2, btn.size, btn.size, btn.borderRadius);
        container.add(bg);

        // Settings icon (gear emoji)
        const icon = this.scene.add.text(0, 0, '⚙️', {
            fontFamily: this.FONT_READABLE,
            fontSize: UIFontSizes.xlarge,
        });
        icon.setOrigin(0.5, 0.5);
        container.add(icon);

        // Interactive zone
        const hitArea = this.scene.add.rectangle(0, 0, btn.size, btn.size, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        container.add(hitArea);

        // Hover effects
        hitArea.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x4a4a7a, 0.9);
            bg.fillRoundedRect(-btn.size / 2, -btn.size / 2, btn.size, btn.size, btn.borderRadius);
            bg.lineStyle(2, 0x8866cc, 1);
            bg.strokeRoundedRect(-btn.size / 2, -btn.size / 2, btn.size, btn.size, btn.borderRadius);
        });

        hitArea.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x2a2a4a, 0.8);
            bg.fillRoundedRect(-btn.size / 2, -btn.size / 2, btn.size, btn.size, btn.borderRadius);
            bg.lineStyle(2, 0x6644aa, 0.8);
            bg.strokeRoundedRect(-btn.size / 2, -btn.size / 2, btn.size, btn.size, btn.borderRadius);
        });

        hitArea.on('pointerdown', () => {
            this.scene.scene.start('SettingsScene');
        });

        this.uiContainer.add(container);
    }

    onActionSelect(callback: (action: Action) => void): void {
        this.actionCallback = callback;
    }

    enableActions(enabled: boolean): void {
        for (const button of this.actionButtons) {
            const hitArea = (button as any).hitArea as Phaser.GameObjects.Rectangle;
            const action = (button as any).action as Action;

            if (enabled && action.canUse(this.player)) {
                hitArea.setInteractive({ useHandCursor: true });
                button.setAlpha(1);
            } else {
                hitArea.disableInteractive();
                button.setAlpha(0.5);
            }
        }
    }

    update(): void {
        // Update HP/MP bars
        this.drawBar(
            this.playerHPBar, 10, 30,
            this.player.hp, this.player.stats.maxHP,
            0x44ff44, 'HP'
        );
        this.drawBar(
            this.playerMPBar, 10, 50,
            this.player.mp, this.player.stats.maxMP,
            0x4488ff, 'MP'
        );
        this.drawBar(
            this.enemyHPBar, 10, 30,
            this.enemy.hp, this.enemy.stats.maxHP,
            0xff4444, 'HP'
        );

        // Update stats text
        this.playerStatsText.setText(
            `${this.player.hp}/${this.player.stats.maxHP}\n${this.player.mp}/${this.player.stats.maxMP}`
        );
        this.enemyStatsText.setText(`${this.enemy.hp}/${this.enemy.stats.maxHP}`);

        // Update echo timeline
        this.updateEchoTimeline();

        // Update button availability
        this.updateButtonStates();
    }

    private updateButtonStates(): void {
        for (const button of this.actionButtons) {
            const action = (button as any).action as Action;
            const canUse = action.canUse(this.player);
            button.setAlpha(canUse ? 1 : 0.5);
        }
    }

    private updateEchoTimeline(): void {
        // Clear existing echo displays
        this.echoTimelineContainer.removeAll(true);

        // Title
        const echoes = this.echoSystem.getAllEchoes();
        const title = this.scene.add.text(0, scale(-20), `⚡ Active Echoes (${echoes.length})`, {
            fontFamily: this.FONT_PIXEL,
            fontSize: UIFontSizes.medium,
            color: echoes.length > 0 ? '#ffcc44' : '#666666',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        title.setOrigin(0.5, 0.5);
        this.echoTimelineContainer.add(title);

        // Display echoes
        const maxDisplay = 5;
        const displayEchoes = echoes.slice(0, maxDisplay);
        const spacing = UIDimensions.echoItem.spacing;
        const startX = -(displayEchoes.length - 1) * spacing / 2;

        displayEchoes.forEach((echo, index) => {
            const echoX = startX + index * spacing;
            const echoDisplay = this.createEchoDisplay(echo, echoX, scale(10));
            this.echoTimelineContainer.add(echoDisplay);
        });
    }

    private createEchoDisplay(echo: EchoEffect, x: number, y: number): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);
        const echoItem = UIDimensions.echoItem;

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x332244, 0.8);
        bg.fillRoundedRect(-echoItem.width / 2, -echoItem.height / 2 + scale(5), echoItem.width, echoItem.height, echoItem.borderRadius);
        bg.lineStyle(1, 0x6644aa, 0.8);
        bg.strokeRoundedRect(-echoItem.width / 2, -echoItem.height / 2 + scale(5), echoItem.width, echoItem.height, echoItem.borderRadius);
        container.add(bg);

        // Icon
        const icon = this.scene.add.text(scale(-30), 0, echo.icon, {
            fontFamily: this.FONT_READABLE,
            fontSize: UIFontSizes.large,
        });
        icon.setOrigin(0.5, 0.5);
        container.add(icon);

        // Name
        const name = this.scene.add.text(scale(5), scale(-5), echo.name, {
            fontFamily: this.FONT_PIXEL,
            fontSize: UIFontSizes.small,
            color: '#ffffff',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        name.setOrigin(0, 0.5);
        container.add(name);

        // Turns remaining
        const turns = this.scene.add.text(scale(5), scale(8), `${echo.turnsRemaining}T left`, {
            fontFamily: this.FONT_READABLE,
            fontSize: UIFontSizes.small,
            color: echo.turnsRemaining <= 1 ? '#ff8844' : '#888888',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        turns.setOrigin(0, 0.5);
        container.add(turns);

        // Target indicator
        const targetIndicator = echo.targetCharacter.name === this.player.name ? '🔵' : '🔴';
        const targetText = this.scene.add.text(scale(35), 0, targetIndicator, {
            fontFamily: this.FONT_READABLE,
            fontSize: UIFontSizes.normal,
        });
        targetText.setOrigin(0.5, 0.5);
        container.add(targetText);

        return container;
    }

    showMessage(message: string): void {
        this.messageText.setText(message);
    }

    showEchoTrigger(echo: EchoEffect): void {
        const { width, height } = this.scene.cameras.main;

        // Flash effect
        const flash = this.scene.add.text(width / 2, height / 2 - scale(50), `⚡ ${echo.icon} ${echo.name}! ⚡`, {
            fontFamily: this.FONT_PIXEL,
            fontSize: UIFontSizes.xxlarge,
            color: '#ffdd00',
            stroke: '#000000',
            strokeThickness: scale(3),
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, fill: true }
        });
        flash.setOrigin(0.5, 0.5);
        flash.setAlpha(0);

        this.scene.tweens.add({
            targets: flash,
            alpha: 1,
            y: height / 2 - scale(70),
            duration: 300,
            yoyo: true,
            hold: 500,
            onComplete: () => flash.destroy(),
        });
    }

    showEchoeffects(echoes: EchoEffect[]): void {
        // Brief visual feedback for multiple echoes
        echoes.forEach((echo, index) => {
            this.scene.time.delayedCall(index * 200, () => {
                this.showEchoTrigger(echo);
            });
        });
    }

    showVictory(expReward: number): void {
        const { width, height } = this.scene.cameras.main;

        const victoryText = this.scene.add.text(width / 2, height / 2, '🎉 VICTORY! 🎉', {
            fontFamily: this.FONT_PIXEL,
            fontSize: UIFontSizes.victory,
            color: '#44ff88',
            stroke: '#000000',
            strokeThickness: scale(4),
            shadow: { offsetX: 3, offsetY: 3, color: '#115522', blur: 0, fill: true }
        });
        victoryText.setOrigin(0.5, 0.5);

        const expText = this.scene.add.text(width / 2, height / 2 + scale(50), `+${expReward} EXP`, {
            fontFamily: this.FONT_PIXEL,
            fontSize: UIFontSizes.xxlarge,
            color: '#ffdd44',
            stroke: '#000000',
            strokeThickness: scale(2),
            shadow: { offsetX: 2, offsetY: 2, color: '#554400', blur: 0, fill: true }
        });
        expText.setOrigin(0.5, 0.5);

        this.scene.tweens.add({
            targets: [victoryText, expText],
            scale: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.easeOut',
        });
    }

    showDefeat(): void {
        const { width, height } = this.scene.cameras.main;

        const defeatText = this.scene.add.text(width / 2, height / 2, '💀 DEFEAT 💀', {
            fontFamily: this.FONT_PIXEL,
            fontSize: UIFontSizes.victory,
            color: '#ff5555',
            stroke: '#000000',
            strokeThickness: scale(4),
            shadow: { offsetX: 3, offsetY: 3, color: '#551111', blur: 0, fill: true }
        });
        defeatText.setOrigin(0.5, 0.5);

        this.scene.tweens.add({
            targets: defeatText,
            scale: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.easeOut',
        });
    }

    showRestartButton(callback: () => void): void {
        const { width, height } = this.scene.cameras.main;
        const btn = UIDimensions.restartButton;

        this.restartButton = this.scene.add.container(width / 2, height / 2 + scale(100));

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x4444aa, 1);
        bg.fillRoundedRect(-btn.width / 2, -btn.height / 2, btn.width, btn.height, btn.borderRadius);
        bg.lineStyle(2, 0x6666cc, 1);
        bg.strokeRoundedRect(-btn.width / 2, -btn.height / 2, btn.width, btn.height, btn.borderRadius);
        this.restartButton.add(bg);

        const text = this.scene.add.text(0, 0, '🔄 Battle Again', {
            fontFamily: this.FONT_PIXEL,
            fontSize: UIFontSizes.large,
            color: '#ffffff',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
        });
        text.setOrigin(0.5, 0.5);
        this.restartButton.add(text);

        const hitArea = this.scene.add.rectangle(0, 0, btn.width, btn.height, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        this.restartButton.add(hitArea);

        hitArea.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x5555cc, 1);
            bg.fillRoundedRect(-btn.width / 2, -btn.height / 2, btn.width, btn.height, btn.borderRadius);
            bg.lineStyle(2, 0x8888ff, 1);
            bg.strokeRoundedRect(-btn.width / 2, -btn.height / 2, btn.width, btn.height, btn.borderRadius);
        });

        hitArea.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x4444aa, 1);
            bg.fillRoundedRect(-btn.width / 2, -btn.height / 2, btn.width, btn.height, btn.borderRadius);
            bg.lineStyle(2, 0x6666cc, 1);
            bg.strokeRoundedRect(-btn.width / 2, -btn.height / 2, btn.width, btn.height, btn.borderRadius);
        });

        hitArea.on('pointerdown', callback);

        this.restartButton.setAlpha(0);
        this.scene.tweens.add({
            targets: this.restartButton,
            alpha: 1,
            duration: 300,
        });
    }
}

