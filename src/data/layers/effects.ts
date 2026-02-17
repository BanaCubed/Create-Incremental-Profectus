import Decimal, { DecimalSource } from "util/bignum";
import { computed, ComputedRef } from "vue";
import cash, { CashRepeatableNames } from "./cash/cash";

// This *should* be safe to move around the elements within,
// as nothing here should be stored in the player data.
/**
 * Enum containing the index of certain effects within the {@link effects} object.
 */
export enum EffectNames {
    RPEffect,
    CReAEffect,
    CReBEffect,
    CReAEffectBase,
    CReBEffectBase
}

/**
 * An object containing effects and other useful numbers related to gameplay.
 *
 * Elements within should be accessed using the {@link EffectNames} enum.
 */
const effects: Record<Partial<EffectNames>, ComputedRef<DecimalSource>> = {
    [EffectNames.RPEffect]: computed(() => 1),
    [EffectNames.CReAEffectBase]: computed(() => 1.65),
    [EffectNames.CReAEffect]: computed(() =>
        Decimal.pow_base(
            cash.repeatables[CashRepeatableNames.A].amount.value,
            effects[EffectNames.CReAEffectBase].value
        )
    ),
    [EffectNames.CReBEffectBase]: computed(() =>
        Decimal.max(cash.points.value, 1).log(150).add(1).pow(2)
    ),
    [EffectNames.CReBEffect]: computed(() =>
        Decimal.pow(
            effects[EffectNames.CReBEffectBase].value,
            cash.repeatables[CashRepeatableNames.B].amount.value
        )
    )
};

export default effects;
