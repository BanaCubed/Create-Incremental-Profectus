import Decimal, { DecimalSource } from "util/bignum";
import { computed, ComputedRef } from "vue";
import cash, { CashPylonNames, CashRepeatableNames } from "./cash/cash";

// This *should* be safe to move around the elements within,
// as nothing here should be stored in the player data.
/**
 * Enum containing the index of certain effects within the {@link effects} object.
 */
export enum EffectNames {
    RPEffect,
    CReAEffectBase,
    CReAEffect,
    CReBEffectBase,
    CReBEffect,
    CReCEffectBase,
    CReCEffect,
    CReDEffectBase,
    CReDEffect
}

/**
 * An object containing effects and other useful numbers related to gameplay.
 *
 * Elements within should be accessed using the {@link EffectNames} enum.
 */
const effects: Record<Partial<EffectNames>, ComputedRef<DecimalSource>> = {
    [EffectNames.RPEffect]: computed(() => 1),
    [EffectNames.CReAEffectBase]: computed(() =>
        Decimal.add(1.65, effects[EffectNames.CReDEffect].value)
    ),
    [EffectNames.CReAEffect]: computed(() =>
        Decimal.pow_base(
            cash.repeatables[CashRepeatableNames.A].amount.value,
            effects[EffectNames.CReAEffectBase].value
        )
    ),
    [EffectNames.CReBEffectBase]: computed(() =>
        Decimal.max(cash.points.value, 1).log(100).pow(1.5).div(2).add(1)
    ),
    [EffectNames.CReBEffect]: computed(() =>
        Decimal.pow(
            effects[EffectNames.CReBEffectBase].value,
            cash.repeatables[CashRepeatableNames.B].amount.value
        )
    ),
    [EffectNames.CReCEffectBase]: computed(() =>
        Decimal.max(cash.pylons[CashPylonNames.A].amount.value, 1).mul(0.03).add(1.15)
    ),
    [EffectNames.CReCEffect]: computed(() =>
        Decimal.pow(
            effects[EffectNames.CReCEffectBase].value,
            cash.repeatables[CashRepeatableNames.C].amount.value
        )
    ),
    [EffectNames.CReDEffectBase]: computed(() => 0.05),
    [EffectNames.CReDEffect]: computed(() =>
        Decimal.mul(
            effects[EffectNames.CReDEffectBase].value,
            cash.repeatables[CashRepeatableNames.D].amount.value
        )
    )
};

export default effects;
