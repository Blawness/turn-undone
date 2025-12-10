import { Character } from '../../entities/Character';
import { EchoSystem } from '../../systems/EchoSystem';
import { BaseAction, ActionResult } from '../Action';

/**
 * Power Magic
 * Powerful magical attack that ignores defense
 * ECHO: Blocks MP recovery for 2 turns
 */
export class PowerMagicAction extends BaseAction {
    name = 'Power Magic';
    description = 'Devastating magic that ignores defense. Echo: No MP regen for 2 turns.';
    mpCost = 20;
    icon = '✨';

    execute(actor: Character, target: Character, echoSystem: EchoSystem): ActionResult {
        if (!actor.useMP(this.mpCost)) {
            return {
                success: false,
                mpUsed: 0,
                message: `${actor.name} doesn't have enough MP!`,
            };
        }

        // Magic damage ignores defense, uses magic power
        const baseDamage = actor.stats.magicPower * 2.5;
        const damage = this.calculateDamage(baseDamage);

        // Direct HP damage (ignoring defense)
        target.hp = Math.max(0, target.hp - damage);
        if (target.hp <= 0) {
            target.isAlive = false;
        }

        // Create MP block echo on SELF
        echoSystem.addEcho({
            name: 'Mana Drain',
            type: 'mp_block',
            value: 1, // Full block
            turnsRemaining: 2,
            targetCharacter: actor,
            sourceCharacter: actor,
            icon: '🔮❌',
            description: 'MP regeneration is blocked',
        });

        return {
            success: true,
            damage: damage,
            mpUsed: this.mpCost,
            message: `${actor.name} casts POWER MAGIC on ${target.name} for ${damage} damage! ✨\nEcho: ${actor.name}'s MP recovery is blocked for 2 turns...`,
        };
    }
}
