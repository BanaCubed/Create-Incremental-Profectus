import Spacer from "components/layout/Spacer.vue";
import { createLayerTreeNode, LayerTreeNode, LayerTreeNodeOptions } from "data/common";
import { createPylon, Pylon, PylonOptions } from "features/clickables/pylon";
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
import { CostRequirementOptions, createCostRequirement } from "game/requirements";
import { DecimalSource, formatWhole } from "util/bignum";
import { renderCol } from "util/vue";
import { computed, Ref } from "vue";
import { JSX } from "vue/jsx-runtime";
import { addTooltip } from "wrappers/tooltips/tooltip";
import {
    createMultiplicativeModifier,
    createSequentialModifier,
    MultiplicativeModifierOptions
} from "game/modifiers";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createReset, ResetOptions } from "features/reset";
import settings from "game/settings";
import { createRepeatable, Repeatable, RepeatableOptions } from "features/clickables/repeatable";
import effects, { EffectNames } from "../effects";

// #region Interface
export interface LayerCash extends Layer {
    points: Resource<DecimalSource>;
    best: Ref<DecimalSource>;
    total: Ref<DecimalSource>;
    oomps: () => JSX.Element;
    treeNode: LayerTreeNode;
    pylons: Record<string, Pylon>;
    repeatables: Record<string, Repeatable>;
}
// #endregion Interface

// #region Layer
const layer: LayerCash = createLayer("cash", () => {
    const color: string = "#0b8000";
    // #region Resources
    const points: Resource<DecimalSource> = createResource(10, "Cash", 2);
    const best: Ref<DecimalSource> = trackBest(points);
    const total: Ref<DecimalSource> = trackTotal(points);
    // #endregion Resources

    // #region Tree Node
    const treeNode = createLayerTreeNode<LayerTreeNodeOptions>(() => ({
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
    const reset = createReset<ResetOptions>(() => ({
        thingsToReset: () => {
            const things = [points, best, total, pylons, repeatables];
            return things;
        }
    }));
    // #endregion Reset

    // #region Cash Gain
    const cashGain = createSequentialModifier(() => [
        createMultiplicativeModifier<MultiplicativeModifierOptions>(() => ({
            multiplier: effects[EffectNames.CReAEffect]
        }))
    ]);
    // #endregion Cash Gain

    // #region Pylons
    const pylons: Record<string, Pylon> = {
        CPyA: createPylon<PylonOptions>(() => ({
            requirements: createCostRequirement<CostRequirementOptions>(() => ({
                resource: noPersist(points),
                cost: Formula.variable(pylons.CPyA.amount).add(1).pow_base(2.5).mul(4)
            })),
            gain: computed(() => cashGain.apply(1)),
            target: noPersist(points),
            display: {
                title: () => <h3>Cash Printer{settings.e ? " {CPyA}" : ""}</h3>,
                description: () => (
                    <>
                        <i>Generates NaN Cash every second</i>
                    </>
                ),
                targetName: "Cash"
            }
        }))
    };
    // #endregion Pylons

    // #region Repeatables
    const repeatables: Record<string, Repeatable> = {
        CReA: createRepeatable<RepeatableOptions>(() => ({
            requirements: createCostRequirement<CostRequirementOptions>(() => ({
                resource: noPersist(points),
                cost: Formula.variable(repeatables.CReA.amount).pow_base(5).mul(15)
            })),
            display: {
                title: () => <h3>untitled{settings.e ? " {CReA}" : ""}</h3>,
                description: () => (
                    <>
                        <i>
                            Multiplies Cash generation by <b>&times;1.65</b> exponentially.
                        </i>
                    </>
                )
            }
        })),
        CReB: createRepeatable<RepeatableOptions>(() => ({
            requirements: createCostRequirement<CostRequirementOptions>(() => ({
                resource: noPersist(points),
                cost: Formula.variable(repeatables.CReA.amount).pow_base(5).mul(15)
            })),
            display: {
                title: () => <h3>untitled{settings.e ? " {CReA}" : ""}</h3>,
                description: () => (
                    <>
                        <i>
                            Multiplies Cash generation by <b>&times;1.65</b> exponentially.
                        </i>
                    </>
                )
            }
        }))
    };
    // #endregion Repeatables

    // #region Return Object
    const oomps: () => JSX.Element = trackOOMPS(points, pylons.CPyA.effect);
    return {
        // #region Display Function
        display: () => (
            <>
                <Spacer />
                <MainDisplay resource={points} color={color} />
                {oomps()}
                <Spacer />
                <div class="row" style="align-items: start;">
                    {renderCol(pylons.CPyA)}
                    <Spacer />
                    {renderCol(repeatables.CReA)}
                </div>
            </>
        ),
        // #endregion Display Function
        points,
        best,
        total,
        oomps,
        treeNode,
        color,
        pylons,
        repeatables
    };
    // #endregion Return Object
});

export default layer;
// #endregion Layer
