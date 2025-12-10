import { Character } from '../entities/Character';
import { EchoEffect, EchoSystem } from '../systems/EchoSystem';

/**
 * Action Result
 * Contains the outcome of an action
 */
export interface ActionResult {
    success: boolean;
    damage?: number;
    healing?: number;
    mpUsed: number;
    message: string;
    echo?: Omit<EchoEffect, 'id'>;
}

/**
 * Base Action Interface
 * All skills and abilities implement this
 */
export interface Action {
    name: string;
    description: string;
    mpCost: number;
    icon: string;

    /**
     * Check if the action can be used
     */
    canUse(actor: Character): boolean;

    /**
     * Execute the action
     */
    execute(actor: Character, target: Character, echoSystem: EchoSystem): ActionResult;
}

/**
 * Base Action Class
 * Common functionality for all actions
 */
export abstract class BaseAction implements Action {
    abstract name: string;
    abstract description: string;
    abstract mpCost: number;
    abstract icon: string;

    canUse(actor: Character): boolean {
        return actor.mp >= this.mpCost && actor.canAct();
    }

    abstract execute(actor: Character, target: Character, echoSystem: EchoSystem): ActionResult;

    /**
     * Calculate damage with variance
     */
    protected calculateDamage(base: number, variance: number = 0.1): number {
        const min = base * (1 - variance);
        const max = base * (1 + variance);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
