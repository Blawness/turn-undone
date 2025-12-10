import { EchoEffect } from '../systems/EchoSystem';

/**
 * Character Stats Interface
 */
export interface CharacterStats {
    maxHP: number;
    maxMP: number;
    attack: number;
    defense: number;
    speed: number;
    magicPower: number;
}

/**
 * Base Character Class
 * Foundation for Player and Enemy entities
 */
export class Character {
    public name: string;
    public hp: number;
    public mp: number;
    public stats: CharacterStats;
    public activeEffects: EchoEffect[] = [];
    public isAlive: boolean = true;

    // Visual representation
    public sprite: Phaser.GameObjects.Container | null = null;
    public x: number = 0;
    public y: number = 0;

    constructor(name: string, stats: CharacterStats) {
        this.name = name;
        this.stats = { ...stats };
        this.hp = stats.maxHP;
        this.mp = stats.maxMP;
    }

    /**
     * Get current defense (modified by echoes)
     */
    getDefense(): number {
        let defense = this.stats.defense;

        for (const effect of this.activeEffects) {
            if (effect.type === 'defense_reduction') {
                defense *= (1 - effect.value);
            }
        }

        return Math.max(0, Math.floor(defense));
    }

    /**
     * Get current attack power (modified by echoes)
     */
    getAttack(): number {
        let attack = this.stats.attack;

        for (const effect of this.activeEffects) {
            if (effect.type === 'attack_boost') {
                attack *= (1 + effect.value);
            } else if (effect.type === 'fatigue') {
                attack *= (1 - effect.value * 0.5);
            }
        }

        return Math.max(1, Math.floor(attack));
    }

    /**
     * Take damage (after defense calculation)
     */
    takeDamage(rawDamage: number): number {
        const defense = this.getDefense();
        const actualDamage = Math.max(1, rawDamage - defense);

        this.hp = Math.max(0, this.hp - actualDamage);

        if (this.hp <= 0) {
            this.isAlive = false;
        }

        return actualDamage;
    }

    /**
     * Heal HP
     */
    heal(amount: number): number {
        const actualHeal = Math.min(amount, this.stats.maxHP - this.hp);
        this.hp += actualHeal;
        return actualHeal;
    }

    /**
     * Use MP
     */
    useMP(amount: number): boolean {
        if (this.mp < amount) return false;
        this.mp -= amount;
        return true;
    }

    /**
     * Regenerate MP (called at turn start)
     */
    regenerateMP(amount: number): void {
        // Check for MP recovery block
        const blocked = this.activeEffects.some(e => e.type === 'mp_block');
        if (blocked) return;

        this.mp = Math.min(this.stats.maxMP, this.mp + amount);
    }

    /**
     * Check if character can act (not stunned/fatigued heavily)
     */
    canAct(): boolean {
        return this.isAlive && !this.activeEffects.some(e => e.type === 'stun');
    }

    /**
     * Add an echo effect to this character
     */
    addEffect(effect: EchoEffect): void {
        this.activeEffects.push(effect);
    }

    /**
     * Remove expired effects
     */
    removeEffect(effectId: string): void {
        this.activeEffects = this.activeEffects.filter(e => e.id !== effectId);
    }

    /**
     * Reset for new battle
     */
    reset(): void {
        this.hp = this.stats.maxHP;
        this.mp = this.stats.maxMP;
        this.activeEffects = [];
        this.isAlive = true;
    }
}
