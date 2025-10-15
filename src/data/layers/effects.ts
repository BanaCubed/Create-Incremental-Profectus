import Decimal, { DecimalSource } from "util/bignum";
import { computed, ComputedRef } from "vue";
import cash from "./cash/cash";

// This *should* be safe to move around the elements within,
// as nothing here should be stored in the player data.
/**
 * Enum containing the index of certain effects within the {@link effects} object.
 */
export enum EffectNames {
    CRe1Base,
    CRe1Effect,
    CRe2Base,
    CRe2Effect,
    CRe3Base,
    CRe3Effect,
    CRe4Base,
    CRe4Effect,
    RPEffect
}

/**
 * An object containing effects and other useful numbers related to gameplay.
 *
 * Elements within should be accessed using the {@link EffectNames} enum.
 */
const effects: Record<EffectNames, ComputedRef<DecimalSource>> = {
    [EffectNames.CRe1Base]: computed(() =>
        Decimal.add(1.65, effects[EffectNames.CRe4Effect].value)
    ),
    [EffectNames.CRe1Effect]: computed(() =>
        Decimal.pow(effects[EffectNames.CRe1Base].value, cash.buyables[0].amount.value)
    ),
    [EffectNames.CRe2Base]: computed(() =>
        Decimal.max(cash.points.value, 1).log(10).add(1).log(3).add(1).mul(1.1)
    ),
    [EffectNames.CRe2Effect]: computed(() =>
        Decimal.pow(effects[EffectNames.CRe2Base].value, cash.buyables[1].amount.value)
    ),
    [EffectNames.CRe3Base]: computed(() => Decimal.div(cash.pylons[0].amount.value, 25).add(1)),
    [EffectNames.CRe3Effect]: computed(() =>
        Decimal.pow(effects[EffectNames.CRe3Base].value, cash.buyables[2].amount.value)
    ),
    [EffectNames.CRe4Base]: computed(() => 0.02),
    [EffectNames.CRe4Effect]: computed(() =>
        Decimal.mul(effects[EffectNames.CRe4Base].value, cash.buyables[3].amount.value)
    ),
    [EffectNames.RPEffect]: computed(() => 1)
};

export default effects;
