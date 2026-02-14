import Decimal, { DecimalSource } from "util/bignum";
import { computed, ComputedRef } from "vue";
import cash from "./cash/cash";

// This *should* be safe to move around the elements within,
// as nothing here should be stored in the player data.
/**
 * Enum containing the index of certain effects within the {@link effects} object.
 */
export enum EffectNames {
    RPEffect,
    CReAEffect
}

/**
 * An object containing effects and other useful numbers related to gameplay.
 *
 * Elements within should be accessed using the {@link EffectNames} enum.
 */
const effects: Record<Partial<EffectNames>, ComputedRef<DecimalSource>> = {
    [EffectNames.RPEffect]: computed(() => 1),
    [EffectNames.CReAEffect]: computed(() =>
        Decimal.pow_base(cash.repeatables.CReA.amount.value, 1.65)
    )
};

export default effects;
