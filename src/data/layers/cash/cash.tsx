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
import { createCostRequirement } from "game/requirements";
import { DecimalSource, formatWhole } from "util/bignum";
import { renderCol } from "util/vue";
import { computed, Ref } from "vue";
import { JSX } from "vue/jsx-runtime";
import { addTooltip } from "wrappers/tooltips/tooltip";
import { createMultiplicativeModifier, createSequentialModifier } from "game/modifiers";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createReset } from "features/reset";
import settings from "game/settings";
import { createRepeatable, Repeatable } from "features/clickables/repeatable";
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
            const things = [points, best, total, pylons, repeatables];
            return things;
        }
    }));
    // #endregion Reset

    // #region Cash Gain
    const cashGain = createSequentialModifier(() => [
        createMultiplicativeModifier(() => ({
            multiplier: effects[EffectNames.CReAEffect]
        }))
    ]);
    // #endregion Cash Gain

    // #region Pylons
    const pylons: Record<string, Pylon> = {
        CPyA: createPylon(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: Formula.variable(pylons.CPyA.amount).add(1).pow_base(2.5).mul(4)
            })),
            gain: computed(() => cashGain.apply(1)),
            target: noPersist(points),
            display: {
                title: () => <h3>Cash Printer{settings.e ? " {CPyA}" : ""}</h3>,
                description: () => (
                    <>
                        <i>
                            Generates Cash each second
                            <br />
                            Somehow...
                        </i>
                    </>
                ),
                targetName: "Cash"
            }
        }))
    };
    // #endregion Pylons

    // #region Repeatables
    const repeatables: Record<string, Repeatable> = {
        CReA: createRepeatable(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: Formula.variable(repeatables.CReA.amount).pow_base(5).mul(15)
            })),
            display: {
                title: () => <h3>untitled{settings.e ? " {CReA}" : ""}</h3>,
                description: () => (
                    <>
                        <i>Multiplies Cash generation by &times;1.65 exponentially.</i>
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
