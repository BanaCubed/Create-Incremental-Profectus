import Spacer from "components/layout/Spacer.vue";
import { createLayerTreeNode, LayerTreeNode } from "data/common";
import { createPylon, Pylon } from "features/clickables/pylon";
import {
    createResource,
    trackBest,
    trackOOMPS,
    trackTotal,
    Resource
} from "features/resources/resource";
import Formula from "game/formulas/formulas";
import { createLayer, Layer } from "game/layers";
import { noPersist } from "game/persistence";
import { createCostRequirement, displayRequirements } from "game/requirements";
import Decimal, { DecimalSource, format, formatWhole } from "util/bignum";
import { renderCol } from "util/vue";
import { computed, Ref, toValue, unref } from "vue";
import { JSX } from "vue/jsx-runtime";
import { addTooltip } from "wrappers/tooltips/tooltip";
import { createRepeatable, Repeatable } from "features/clickables/repeatable";
import { createMultiplicativeModifier, createSequentialModifier } from "game/modifiers";
import { processGetter } from "util/computed";
import { Visibility } from "features/feature";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createReset } from "features/reset";
import settings from "game/settings";
import effects, { EffectNames } from "../effects";

// #region Interface
export interface LayerCash extends Layer {
    points: Resource<DecimalSource>;
    best: Ref<DecimalSource>;
    total: Ref<DecimalSource>;
    oomps: () => JSX.Element;
    buyables: Repeatable[];
    treeNode: LayerTreeNode;
    pylons: Pylon[];
}
// #endregion Interface

// #region Layer
const layer: LayerCash = createLayer("cash", () => {
    const color: string = "#0b8000";
    // #region Resources
    const points: Resource<DecimalSource> = createResource(10, "Cash", 0);
    const best: Ref<DecimalSource> = trackBest(points);
    const total: Ref<DecimalSource> = trackTotal(points);
    // #endregion Resources

    // #region Tree Node
    const treeNode = createLayerTreeNode(() => ({
        name: "$",
        layerID: "cash",
        color,
        append: false,
        display: (
            <>
                <img src="currency_cash.png" height="85" />
            </>
        ),
        reset
    }));
    addTooltip(treeNode, () => ({
        display: () => <>{formatWhole(points.value)} Cash</>
    }));
    // #endregion Tree Node

    // #region Reset
    const reset = createReset(() => ({
        thingsToReset: () => {
            const things = [points, best, total, pylons, buyables];
            return things;
        }
    }));
    // #endregion Reset

    // #region Cash Gain
    const cashGain = createSequentialModifier(() => [
        createMultiplicativeModifier(() => ({
            multiplier: effects[EffectNames.CRe1Effect]
        })),
        createMultiplicativeModifier(() => ({
            multiplier: effects[EffectNames.CRe2Effect]
        })),
        createMultiplicativeModifier(() => ({
            multiplier: effects[EffectNames.CRe3Effect]
        }))
    ]);
    // #endregion Cash Gain

    // #region Pylons
    const pylons: Pylon[] = [
        // #region Pylon 1
        createPylon(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: Formula.variable(pylons[0].amount).add(1).pow_base(10)
            })),
            gain: computed(() => cashGain.apply(1)),
            target: noPersist(points),
            display: {
                title: () => <h3>Cash Pylon{settings.e ? " {CPy1}" : ""}</h3>,
                description: () => (
                    <>
                        <i>
                            Generates <b>{format(unref(processGetter(pylons[0].gain)))}</b> Cash/s
                            <br />
                            Somehow...
                        </i>
                    </>
                ),
                targetName: "Cash"
            }
        }))
        // #endregion Pylon 1
    ];
    // #endregion Pylons

    // #region Buyables
    const buyables: Repeatable[] = [
        // #region Buyable 1
        createRepeatable(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: Formula.variable(buyables[0].amount)
                    .step(10, val => val.pow(2))
                    .pow_base(5)
                    .mul(15),
                cumulativeCost: false
            })),
            display: () => (
                <>
                    <h3>Inflation{settings.e ? " {CRe1}" : ""}</h3>
                    <br />
                    <i>
                        Multiplies cash gain by &times;
                        <b>{format(effects[EffectNames.CRe1Base].value)}</b> per purchase
                    </i>
                    <br />
                    <br />
                    Amount: {formatWhole(buyables[0].amount.value)}
                    <br />
                    Currently: &times;{format(effects[EffectNames.CRe1Effect].value)}
                    <br />
                    {displayRequirements(buyables[0].requirements)}
                </>
            ),
            visibility: () =>
                Decimal.gt(pylons[0].amount.value, 0) ? Visibility.Visible : Visibility.None
        })),
        // #endregion Buyable 1
        // #region Buyable 2
        createRepeatable(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: Formula.variable(buyables[1].amount).pow(1.8).pow_base(10).mul(25),
                cumulativeCost: false
            })),
            display: () => (
                <>
                    <h3>Synergism{settings.e ? " {CRe2}" : ""}</h3>
                    <br />
                    <i>
                        Multiplies cash gain by &times;
                        <b>{format(effects[EffectNames.CRe2Base].value)}</b> per purchase
                        <br />
                        Based on Cash
                    </i>
                    <br />
                    <br />
                    Amount: {formatWhole(buyables[1].amount.value)}
                    <br />
                    Currently: &times;{format(effects[EffectNames.CRe2Effect].value)}
                    <br />
                    {displayRequirements(buyables[1].requirements)}
                </>
            ),
            visibility: () =>
                Decimal.gt(buyables[0].amount.value, 0) ? Visibility.Visible : Visibility.None
        })),
        // #endregion Buyable 2
        // #region Buyable 3
        createRepeatable(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: Formula.variable(buyables[2].amount)
                    .pow_base(1.2)
                    .pow_base(3)
                    .mul(500)
                    .div(3),
                cumulativeCost: false
            })),
            display: () => (
                <>
                    <h3>Overcharged{settings.e ? " {CRe3}" : ""}</h3>
                    <br />
                    <i>
                        Multiplies cash gain by &times;
                        <b>{format(effects[EffectNames.CRe3Base].value)}</b> per purchase
                        <br />
                        Based on Cash Pylons bought
                    </i>
                    <br />
                    <br />
                    Amount: {formatWhole(buyables[2].amount.value)}
                    <br />
                    Currently: &times;{format(effects[EffectNames.CRe3Effect].value)}
                    <br />
                    {displayRequirements(buyables[2].requirements)}
                </>
            ),
            visibility: () =>
                Decimal.gt(buyables[1].amount.value, 0) ? Visibility.Visible : Visibility.None
        })),
        // #endregion Buyable 3
        // #region Buyable 4
        createRepeatable(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: Formula.variable(buyables[3].amount)
                    .pow_base(1.5)
                    .pow_base(1.5)
                    .mul(1e6)
                    .div(1.5),
                cumulativeCost: false
            })),
            display: () => (
                <>
                    <h3>Recreation{settings.e ? " {CRe4}" : ""}</h3>
                    <br />
                    <i>
                        Adds to "Inflation"'s base effect by +
                        <b>{format(effects[EffectNames.CRe4Base].value)}</b> per purchase
                    </i>
                    <br />
                    <br />
                    Amount: {formatWhole(buyables[3].amount.value)}
                    <br />
                    Currently: +{format(effects[EffectNames.CRe4Effect].value)}
                    <br />
                    {displayRequirements(buyables[3].requirements)}
                </>
            ),
            visibility: () =>
                Decimal.gt(buyables[2].amount.value, 0) ? Visibility.Visible : Visibility.None
        }))
        // #endregion Buyable 4
    ];
    // #endregion Buyables

    // #region Return Object
    const oomps: () => JSX.Element = trackOOMPS(points, pylons[0].effect);
    return {
        // #region Display Function
        display: () => (
            <>
                <MainDisplay resource={points} color={color} />
                {oomps()}
                <Spacer />
                <div class="row" style="align-items: start;">
                    {renderCol(...pylons)}
                    <Spacer />
                    {toValue(buyables[0].visibility) === 0 ? (
                        renderCol(...buyables)
                    ) : (
                        <Spacer width="210px" />
                    )}
                </div>
            </>
        ),
        // #endregion Display Function
        points,
        best,
        total,
        oomps,
        buyables,
        treeNode,
        color,
        pylons
    };
    // #endregion Return Object
});

export default layer;
// #endregion Layer
