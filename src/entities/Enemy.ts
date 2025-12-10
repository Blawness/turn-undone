import { Character, CharacterStats } from './Character';
import { Action } from '../actions/Action';
import { AttackAction } from '../actions/skills/Attack';
import { HeavyAttackAction } from '../actions/skills/HeavyAttack';

/**
 * Enemy AI Behavior Types
 */
export type EnemyBehavior = 'aggressive' | 'defensive' | 'balanced' | 'random';

/**
 * Enemy Character
 * AI-controlled opponent
 */
export class Enemy extends Character {
    public behavior: EnemyBehavior;
    public skills: Action[];
    public expReward: number;
    public spriteKey: string;

    constructor(
        name: string,
        stats: CharacterStats,
        behavior: EnemyBehavior = 'balanced',
        expReward: number = 50,
        spriteKey: string = 'enemy_default'
    ) {
        super(name, stats);
        this.behavior = behavior;
        this.expReward = expReward;
        this.spriteKey = spriteKey;

        // Basic enemy skills
        this.skills = [
            new AttackAction(),
            new HeavyAttackAction(),
        ];
    }

    /**
     * AI: Choose an action based on behavior
     */
    chooseAction(_target: Character): Action {
        const availableSkills = this.skills.filter(s => s.canUse(this));

        if (availableSkills.length === 0) {
            return new AttackAction(); // Fallback to basic attack
        }

        switch (this.behavior) {
            case 'aggressive':
                // Prefer highest damage skill
                return this.pickStrongestAttack(availableSkills);

            case 'defensive':
                // Use basic attacks, conserve resources
                return availableSkills[0];

            case 'balanced':
                // Mix of attacks, use heavy attack if HP is healthy
                if (this.hp > this.stats.maxHP * 0.5 && availableSkills.length > 1) {
                    return Math.random() > 0.5 ? availableSkills[1] : availableSkills[0];
                }
                return availableSkills[0];

            case 'random':
            default:
                return availableSkills[Math.floor(Math.random() * availableSkills.length)];
        }
    }

    private pickStrongestAttack(skills: Action[]): Action {
        // Simple: pick the skill with highest base damage (last in list for now)
        return skills[skills.length - 1];
    }

    /**
     * Factory: Create a Slime enemy
     */
    static createSlime(): Enemy {
        return new Enemy(
            'Slime',
            {
                maxHP: 40,
                maxMP: 10,
                attack: 8,
                defense: 3,
                speed: 5,
                magicPower: 2,
            },
            'random',
            30,
            'enemy_slime'
        );
    }

    /**
     * Factory: Create a Goblin enemy
     */
    static createGoblin(): Enemy {
        return new Enemy(
            'Goblin',
            {
                maxHP: 60,
                maxMP: 20,
                attack: 12,
                defense: 5,
                speed: 8,
                magicPower: 5,
            },
            'aggressive',
            50,
            'enemy_goblin'
        );
    }

    /**
     * Factory: Create a Dark Knight enemy
     */
    static createDarkKnight(): Enemy {
        return new Enemy(
            'Dark Knight',
            {
                maxHP: 120,
                maxMP: 40,
                attack: 18,
                defense: 12,
                speed: 6,
                magicPower: 8,
            },
            'balanced',
            100,
            'enemy_knight'
        );
    }
}
