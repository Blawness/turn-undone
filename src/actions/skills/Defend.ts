import { Character } from '../../entities/Character';
import { EchoSystem } from '../../systems/EchoSystem';
import { BaseAction, ActionResult } from '../Action';

/**
 * Defend
 * Reduces damage taken this turn and provides small heal
 * ECHO: Boosts defense next turn (positive echo!)
 */
export class DefendAction extends BaseAction {
    name = 'Defend';
    description = 'Guard stance. Echo: +50% defense next turn.';
    mpCost = 0;
    icon = '🛡️';

    execute(actor: Character, _target: Character, echoSystem: EchoSystem): ActionResult {
        // Small immediate heal
        const healAmount = Math.floor(actor.stats.maxHP * 0.05);
        actor.heal(healAmount);

        // Create defense boost echo on SELF (positive echo!)
        echoSystem.addEcho({
            name: 'Fortified',
            type: 'defense_boost',
            value: 0.5, // 50% boost
            turnsRemaining: 1,
            targetCharacter: actor,
            sourceCharacter: actor,
            icon: '🛡️↑',
            description: 'Defense boosted by 50%',
        });

        return {
            success: true,
            healing: healAmount,
            mpUsed: 0,
            message: `${actor.name} takes a defensive stance and recovers ${healAmount} HP! 🛡️\nEcho: Defense will be boosted next turn!`,
        };
    }
}
