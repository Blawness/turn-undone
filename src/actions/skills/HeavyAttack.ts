import { Character } from '../../entities/Character';
import { EchoSystem } from '../../systems/EchoSystem';
import { BaseAction, ActionResult } from '../Action';

/**
 * Heavy Attack
 * Powerful strike that deals 1.8x damage
 * ECHO: Reduces YOUR defense by 30% next turn
 */
export class HeavyAttackAction extends BaseAction {
    name = 'Heavy Attack';
    description = 'A devastating blow. Echo: -30% defense next turn.';
    mpCost = 8;
    icon = '🔨';

    execute(actor: Character, target: Character, echoSystem: EchoSystem): ActionResult {
        if (!actor.useMP(this.mpCost)) {
            return {
                success: false,
                mpUsed: 0,
                message: `${actor.name} doesn't have enough MP!`,
            };
        }

        const baseDamage = actor.getAttack() * 1.8;
        const damage = this.calculateDamage(baseDamage);
        const actualDamage = target.takeDamage(damage);

        // Create defense reduction echo on SELF
        echoSystem.addEcho({
            name: 'Vulnerability',
            type: 'defense_reduction',
            value: 0.3, // 30% reduction
            turnsRemaining: 1,
            targetCharacter: actor, // Affects the attacker
            sourceCharacter: actor,
            icon: '🛡️↓',
            description: 'Defense reduced by 30%',
        });

        return {
            success: true,
            damage: actualDamage,
            mpUsed: this.mpCost,
            message: `${actor.name} unleashes a HEAVY ATTACK on ${target.name} for ${actualDamage} damage! 🔨\nEcho: ${actor.name}'s defense will drop next turn...`,
        };
    }
}
