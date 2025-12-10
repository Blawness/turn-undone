import { Character } from '../../entities/Character';
import { EchoSystem } from '../../systems/EchoSystem';
import { BaseAction, ActionResult } from '../Action';

/**
 * Basic Attack
 * Standard physical attack with no MP cost or echoes
 */
export class AttackAction extends BaseAction {
    name = 'Attack';
    description = 'A basic physical attack.';
    mpCost = 0;
    icon = '⚔️';

    execute(actor: Character, target: Character, _echoSystem: EchoSystem): ActionResult {
        const baseDamage = actor.getAttack();
        const damage = this.calculateDamage(baseDamage);
        const actualDamage = target.takeDamage(damage);

        return {
            success: true,
            damage: actualDamage,
            mpUsed: 0,
            message: `${actor.name} attacks ${target.name} for ${actualDamage} damage!`,
        };
    }
}
