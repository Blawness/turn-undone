import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Character } from '../entities/Character';
import { EchoSystem, EchoEffect } from '../systems/EchoSystem';
import { Action } from '../actions/Action';
import { GameConfig } from '../config/GameConfig';
import { BattleUI } from '../ui/BattleUI';

/**
 * Battle States
 */
export enum BattleState {
    INTRO = 'INTRO',
    PLAYER_TURN = 'PLAYER_TURN',
    PLAYER_ACTION = 'PLAYER_ACTION',
    ENEMY_TURN = 'ENEMY_TURN',
    ECHOES_RESOLVE = 'ECHOES_RESOLVE',
    VICTORY = 'VICTORY',
    DEFEAT = 'DEFEAT',
}

/**
 * Battle Scene
 * Main turn-based combat implementation
 */
export class BattleScene extends Phaser.Scene {
    // Entities
    private player!: Player;
    private enemy!: Enemy;

    // Systems
    private echoSystem!: EchoSystem;
    private battleUI!: BattleUI;

    // State
    private currentState: BattleState = BattleState.INTRO;
    private turnCount: number = 0;
    private battleLog: string[] = [];

    // Visual elements
    private playerSprite!: Phaser.GameObjects.Container;
    private enemySprite!: Phaser.GameObjects.Container;
    private background!: Phaser.GameObjects.Graphics;

    constructor() {
        super({ key: 'BattleScene' });
    }

    create(): void {
        this.initializeBattle();
        this.createBackground();
        this.createCharacterSprites();
        this.setupUI();
        this.setupEchoCallbacks();

        // Start battle after short delay
        this.time.delayedCall(500, () => {
            this.startBattle();
        });
    }

    private initializeBattle(): void {
        // Create characters
        this.player = new Player('Hero');
        this.enemy = Enemy.createGoblin(); // Start with a Goblin

        // Initialize systems
        this.echoSystem = new EchoSystem();

        // Reset state
        this.currentState = BattleState.INTRO;
        this.turnCount = 0;
        this.battleLog = [];
    }

    private createBackground(): void {
        const { width, height } = this.cameras.main;
        this.background = this.add.graphics();

        // Gradient background
        const topColor = 0x1a1a2e;
        const bottomColor = 0x16213e;

        // Create gradient effect
        for (let y = 0; y < height; y++) {
            const ratio = y / height;
            const r = Math.floor(((topColor >> 16) & 0xff) * (1 - ratio) + ((bottomColor >> 16) & 0xff) * ratio);
            const g = Math.floor(((topColor >> 8) & 0xff) * (1 - ratio) + ((bottomColor >> 8) & 0xff) * ratio);
            const b = Math.floor((topColor & 0xff) * (1 - ratio) + (bottomColor & 0xff) * ratio);

            this.background.fillStyle((r << 16) | (g << 8) | b, 1);
            this.background.fillRect(0, y, width, 1);
        }

        // Ground
        this.background.fillStyle(0x0f0f23, 1);
        this.background.fillRect(0, height * 0.7, width, height * 0.3);

        // Ground line
        this.background.lineStyle(2, 0x4a4a6a, 1);
        this.background.lineBetween(0, height * 0.7, width, height * 0.7);
    }

    private createCharacterSprites(): void {
        const { width, height } = this.cameras.main;

        // Player sprite (left side)
        this.playerSprite = this.createCharacterVisual(
            this.player,
            width * 0.25,
            height * 0.55,
            'player'
        );

        // Enemy sprite (right side)
        this.enemySprite = this.createCharacterVisual(
            this.enemy,
            width * 0.75,
            height * 0.55,
            this.getEnemySpriteKey()
        );

        // Store references
        this.player.sprite = this.playerSprite;
        this.player.x = width * 0.25;
        this.player.y = height * 0.55;

        this.enemy.sprite = this.enemySprite;
        this.enemy.x = width * 0.75;
        this.enemy.y = height * 0.55;
    }

    private createCharacterVisual(
        character: Character,
        x: number,
        y: number,
        spriteKey: string
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        // Shadow
        const shadow = this.add.ellipse(0, 60, 100, 25, 0x000000, 0.3);
        container.add(shadow);

        // Character sprite image
        const sprite = this.add.image(0, 0, spriteKey);
        sprite.setScale(0.25); // Scale down from generated size
        container.add(sprite);

        // Name label
        const nameLabel = this.add.text(0, -80, character.name, {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, fill: true }
        });
        nameLabel.setOrigin(0.5, 0.5);
        container.add(nameLabel);

        return container;
    }

    private getEnemySpriteKey(): string {
        switch (this.enemy.name) {
            case 'Slime': return 'slime';
            case 'Goblin': return 'goblin';
            case 'Dark Knight': return 'dark_knight';
            default: return 'goblin';
        }
    }


    private setupUI(): void {
        this.battleUI = new BattleUI(this, this.player, this.enemy, this.echoSystem);
        this.battleUI.create();

        // Setup action button callbacks
        this.battleUI.onActionSelect((action: Action) => {
            this.executePlayerAction(action);
        });
    }

    private setupEchoCallbacks(): void {
        this.echoSystem.setOnTrigger((echo: EchoEffect) => {
            this.logMessage(`⚡ Echo triggered: ${echo.name} on ${echo.targetCharacter.name}`);
            this.battleUI.showEchoTrigger(echo);
        });

        this.echoSystem.setOnExpire((echo: EchoEffect) => {
            this.logMessage(`✨ Echo expired: ${echo.name}`);
        });
    }

    private startBattle(): void {
        this.logMessage(`⚔️ Battle Start! ${this.player.name} vs ${this.enemy.name}!`);
        this.turnCount = 1;
        this.startPlayerTurn();
    }

    private startPlayerTurn(): void {
        this.currentState = BattleState.PLAYER_TURN;
        this.logMessage(`\n--- Turn ${this.turnCount} ---`);

        // Process echoes at turn start
        const triggeredEchoes = this.echoSystem.processTurnStart(this.player);

        // MP regeneration
        this.player.regenerateMP(GameConfig.battle.mpRegenPerTurn);

        // Update UI
        this.battleUI.update();
        this.battleUI.showMessage(`${this.player.name}'s turn! Choose an action.`);
        this.battleUI.enableActions(true);

        // Show echo effects if any triggered
        if (triggeredEchoes.length > 0) {
            this.battleUI.showEchoeffects(triggeredEchoes);
        }
    }

    private executePlayerAction(action: Action): void {
        if (this.currentState !== BattleState.PLAYER_TURN) return;

        this.currentState = BattleState.PLAYER_ACTION;
        this.battleUI.enableActions(false);

        // Execute the action
        const result = action.execute(this.player, this.enemy, this.echoSystem);
        this.logMessage(result.message);
        this.battleUI.showMessage(result.message);

        // Animate the action
        this.animateAction(this.playerSprite, this.enemySprite, result.damage ?? 0);

        // Update UI
        this.battleUI.update();

        // Check battle end
        this.time.delayedCall(1000, () => {
            if (this.checkBattleEnd()) return;
            this.startEnemyTurn();
        });
    }

    private startEnemyTurn(): void {
        this.currentState = BattleState.ENEMY_TURN;

        // Process echoes for enemy
        this.echoSystem.processTurnStart(this.enemy);

        // Enemy MP regen
        this.enemy.regenerateMP(GameConfig.battle.mpRegenPerTurn);

        this.battleUI.showMessage(`${this.enemy.name}'s turn...`);

        // AI chooses action
        const chosenAction = this.enemy.chooseAction(this.player);

        // Delay for readability
        this.time.delayedCall(800, () => {
            const result = chosenAction.execute(this.enemy, this.player, this.echoSystem);
            this.logMessage(result.message);
            this.battleUI.showMessage(result.message);

            // Animate
            this.animateAction(this.enemySprite, this.playerSprite, result.damage ?? 0);

            // Update UI
            this.battleUI.update();

            // Check battle end and proceed
            this.time.delayedCall(1000, () => {
                if (this.checkBattleEnd()) return;
                this.turnCount++;
                this.startPlayerTurn();
            });
        });
    }

    private animateAction(
        attacker: Phaser.GameObjects.Container,
        target: Phaser.GameObjects.Container,
        damage: number
    ): void {
        // Attack lunge animation
        const originalX = attacker.x;
        const targetDirection = target.x > attacker.x ? 1 : -1;

        this.tweens.add({
            targets: attacker,
            x: originalX + (50 * targetDirection),
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut',
        });

        // Target shake on hit
        if (damage > 0) {
            this.time.delayedCall(100, () => {
                this.tweens.add({
                    targets: target,
                    x: target.x + 10,
                    duration: 50,
                    yoyo: true,
                    repeat: 3,
                    ease: 'Linear',
                });

                // Damage number popup
                this.showDamageNumber(target.x, target.y - 50, damage);
            });
        }
    }

    private showDamageNumber(x: number, y: number, damage: number): void {
        const damageText = this.add.text(x, y, `-${damage}`, {
            fontFamily: '"VT323", monospace',
            fontSize: '42px',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, fill: true }
        });
        damageText.setOrigin(0.5, 0.5);

        this.tweens.add({
            targets: damageText,
            y: y - 40,
            alpha: 0,
            duration: 800,
            ease: 'Quad.easeOut',
            onComplete: () => damageText.destroy(),
        });
    }

    private checkBattleEnd(): boolean {
        if (!this.player.isAlive) {
            this.endBattle(false);
            return true;
        }

        if (!this.enemy.isAlive) {
            this.endBattle(true);
            return true;
        }

        return false;
    }

    private endBattle(victory: boolean): void {
        this.currentState = victory ? BattleState.VICTORY : BattleState.DEFEAT;
        this.battleUI.enableActions(false);

        if (victory) {
            this.logMessage(`\n🎉 VICTORY! ${this.enemy.name} defeated!`);
            this.battleUI.showVictory(this.enemy.expReward);

            // Animate enemy defeat
            this.tweens.add({
                targets: this.enemySprite,
                alpha: 0,
                y: this.enemySprite.y + 50,
                duration: 500,
                ease: 'Quad.easeIn',
            });
        } else {
            this.logMessage(`\n💀 DEFEAT! ${this.player.name} has fallen...`);
            this.battleUI.showDefeat();
        }

        // Restart option after delay
        this.time.delayedCall(3000, () => {
            this.battleUI.showRestartButton(() => {
                this.scene.restart();
            });
        });
    }

    private logMessage(message: string): void {
        this.battleLog.push(message);
        if (GameConfig.debug.logActions) {
            console.log(message);
        }
    }

    update(_time: number, _delta: number): void {
        // Reserved for real-time updates if needed
    }
}
