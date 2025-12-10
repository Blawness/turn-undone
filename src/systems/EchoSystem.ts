import { Character } from '../entities/Character';

/**
 * Echo Effect Types
 * Different categories of delayed effects
 */
export type EchoType =
    | 'defense_reduction'
    | 'attack_boost'
    | 'mp_block'
    | 'fatigue'
    | 'poison'
    | 'stun'
    | 'regen'
    | 'defense_boost';

/**
 * Echo Effect Interface
 * Represents a delayed effect that triggers on future turns
 */
export interface EchoEffect {
    id: string;
    name: string;
    type: EchoType;
    value: number; // Effect magnitude (0-1 for percentages, or flat values)
    turnsRemaining: number;
    targetCharacter: Character;
    sourceCharacter: Character;
    onTrigger?: () => void;
    onExpire?: () => void;
    icon: string; // Emoji or sprite key for UI
    description: string;
}

/**
 * Echo System
 * Core mechanic - manages delayed effects from actions
 */
export class EchoSystem {
    private echoes: EchoEffect[] = [];
    private echoIdCounter: number = 0;
    private onEchoTrigger?: (echo: EchoEffect) => void;
    private onEchoExpire?: (echo: EchoEffect) => void;

    constructor() {
        this.echoes = [];
    }

    /**
     * Set callback for when echo triggers
     */
    setOnTrigger(callback: (echo: EchoEffect) => void): void {
        this.onEchoTrigger = callback;
    }

    /**
     * Set callback for when echo expires
     */
    setOnExpire(callback: (echo: EchoEffect) => void): void {
        this.onEchoExpire = callback;
    }

    /**
     * Generate unique echo ID
     */
    private generateId(): string {
        return `echo_${++this.echoIdCounter}_${Date.now()}`;
    }

    /**
     * Add a new echo effect
     */
    addEcho(echoData: Omit<EchoEffect, 'id'>): EchoEffect {
        const echo: EchoEffect = {
            ...echoData,
            id: this.generateId(),
        };

        this.echoes.push(echo);

        // Also add to target character's active effects
        echo.targetCharacter.addEffect(echo);

        return echo;
    }

    /**
     * Process turn start - tick down timers and trigger effects
     */
    processTurnStart(currentCharacter: Character): EchoEffect[] {
        const triggeredEchoes: EchoEffect[] = [];

        // Find echoes that affect this character
        const characterEchoes = this.echoes.filter(
            e => e.targetCharacter === currentCharacter
        );

        for (const echo of characterEchoes) {
            echo.turnsRemaining--;

            // Trigger the effect
            if (echo.onTrigger) {
                echo.onTrigger();
            }

            if (this.onEchoTrigger) {
                this.onEchoTrigger(echo);
            }

            triggeredEchoes.push(echo);

            // Check if expired
            if (echo.turnsRemaining <= 0) {
                this.removeEcho(echo.id);
            }
        }

        return triggeredEchoes;
    }

    /**
     * Remove an echo by ID
     */
    removeEcho(echoId: string): void {
        const echo = this.echoes.find(e => e.id === echoId);

        if (echo) {
            // Remove from character's effects
            echo.targetCharacter.removeEffect(echoId);

            // Call expire callback
            if (echo.onExpire) {
                echo.onExpire();
            }

            if (this.onEchoExpire) {
                this.onEchoExpire(echo);
            }

            // Remove from system
            this.echoes = this.echoes.filter(e => e.id !== echoId);
        }
    }

    /**
     * Get all active echoes
     */
    getAllEchoes(): EchoEffect[] {
        return [...this.echoes];
    }

    /**
     * Get echoes affecting a specific character
     */
    getEchoesForCharacter(character: Character): EchoEffect[] {
        return this.echoes.filter(e => e.targetCharacter === character);
    }

    /**
     * Get echoes created by a specific character
     */
    getEchoesBySource(character: Character): EchoEffect[] {
        return this.echoes.filter(e => e.sourceCharacter === character);
    }

    /**
     * Clear all echoes (for battle reset)
     */
    clear(): void {
        // Clean up all character effects
        for (const echo of this.echoes) {
            echo.targetCharacter.removeEffect(echo.id);
        }
        this.echoes = [];
        this.echoIdCounter = 0;
    }

    /**
     * Get echo timeline for UI display
     * Returns echoes grouped by turns remaining
     */
    getTimeline(): Map<number, EchoEffect[]> {
        const timeline = new Map<number, EchoEffect[]>();

        for (const echo of this.echoes) {
            const turn = echo.turnsRemaining;
            if (!timeline.has(turn)) {
                timeline.set(turn, []);
            }
            timeline.get(turn)!.push(echo);
        }

        return timeline;
    }
}
