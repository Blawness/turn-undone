import { Character, CharacterStats } from './Character';
import { Action } from '../actions/Action';
import { AttackAction } from '../actions/skills/Attack';
import { HeavyAttackAction } from '../actions/skills/HeavyAttack';
import { HealAction } from '../actions/skills/Heal';
import { PowerMagicAction } from '../actions/skills/PowerMagic';
import { DefendAction } from '../actions/skills/Defend';

/**
 * Player Character
 * Controlled by the player with selectable skills
 */
export class Player extends Character {
    public skills: Action[];
    public experience: number = 0;
    public level: number = 1;

    constructor(name: string = 'Hero') {
        const baseStats: CharacterStats = {
            maxHP: 100,
            maxMP: 50,
            attack: 15,
            defense: 8,
            speed: 10,
            magicPower: 12,
        };

        super(name, baseStats);

        // Initialize player skills
        this.skills = [
            new AttackAction(),
            new HeavyAttackAction(),
            new HealAction(),
            new PowerMagicAction(),
            new DefendAction(),
        ];
    }

    /**
     * Get available skills (enough MP)
     */
    getAvailableSkills(): Action[] {
        return this.skills.filter(skill => skill.canUse(this));
    }

    /**
     * Gain experience
     */
    gainExp(amount: number): boolean {
        this.experience += amount;
        const expNeeded = this.level * 100;

        if (this.experience >= expNeeded) {
            this.levelUp();
            return true;
        }
        return false;
    }

    /**
     * Level up and increase stats
     */
    private levelUp(): void {
        this.level++;
        this.experience = 0;

        // Stat growth
        this.stats.maxHP += 10;
        this.stats.maxMP += 5;
        this.stats.attack += 2;
        this.stats.defense += 1;
        this.stats.magicPower += 2;

        // Full heal on level up
        this.hp = this.stats.maxHP;
        this.mp = this.stats.maxMP;
    }
}
