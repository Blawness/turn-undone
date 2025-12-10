import { Character } from '../../entities/Character';
import { EchoSystem } from '../../systems/EchoSystem';
import { BaseAction, ActionResult } from '../Action';

/**
 * Heal
 * Restores HP to the actor
 * ECHO: Causes fatigue - reduced attack for 2 turns
 */
export class HealAction extends BaseAction {
    name = 'Heal';
    description = 'Restore 35 HP. Echo: Fatigue reduces attack for 2 turns.';
    mpCost = 12;
    icon = '💚';

    execute(actor: Character, _target: Character, echoSystem: EchoSystem): ActionResult {
        if (!actor.useMP(this.mpCost)) {
            return {
                success: false,
                mpUsed: 0,
                message: `${actor.name} doesn't have enough MP!`,
            };
        }

        const healAmount = 35;
        const actualHeal = actor.heal(healAmount);

        // Create fatigue echo on SELF
        echoSystem.addEcho({
            name: 'Fatigue',
            type: 'fatigue',
            value: 0.25, // 25% attack reduction
            turnsRemaining: 2,
            targetCharacter: actor,
            sourceCharacter: actor,
            icon: '😩',
            description: 'Attack reduced by 25% due to fatigue',
        });

        return {
            success: true,
            healing: actualHeal,
            mpUsed: this.mpCost,
            message: `${actor.name} heals for ${actualHeal} HP! 💚\nEcho: Fatigue will reduce attack for 2 turns...`,
        };
    }
}
