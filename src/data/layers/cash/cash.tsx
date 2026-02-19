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
import { DecimalSource, format, formatWhole } from "util/bignum";
import { renderRow } from "util/vue";
import { computed, Ref, unref } from "vue";
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
import { processGetter } from "util/computed";
import Column from "components/layout/Column.vue";

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

export enum CashPylonNames {
    A = "CPyA"
}

export enum CashRepeatableNames {
    A = "CReA",
    B = "CReB",
    C = "CReC",
    D = "CReD"
}

// #region Layer
const layer: LayerCash = createLayer("cash", () => {
    const color: string = "#0b8000";
    // #region Resources
    const points: Resource<DecimalSource> = createResource(0, "Cash", 2);
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
        })),
        createMultiplicativeModifier<MultiplicativeModifierOptions>(() => ({
            multiplier: effects[EffectNames.CReBEffect]
        })),
        createMultiplicativeModifier<MultiplicativeModifierOptions>(() => ({
            multiplier: effects[EffectNames.CReCEffect]
        }))
    ]);
    // #endregion Cash Gain

    // #region Pylons
    const pylons: Record<CashPylonNames, Pylon> = {
        [CashPylonNames.A]: createPylon<PylonOptions>(() => ({
            requirements: createCostRequirement<CostRequirementOptions>(() => ({
                resource: noPersist(points),
                cost: Formula.variable(pylons[CashPylonNames.A].amount)
                    .add(1)
                    .pow_base(2.5)
                    .mul(4)
                    .sub(10),
                cumulativeCost: false
            })),
            gain: computed(() => cashGain.apply(1)),
            target: noPersist(points),
            display: {
                title: () => <h3>Cash Printer{settings.e ? " {CPyA}" : ""}</h3>,
                description: () => (
                    <>
                        <i>
                            Generates{" "}
                            <b>{format(unref(processGetter(pylons[CashPylonNames.A].gain)))}</b>{" "}
                            every second
                        </i>
                    </>
                ),
                targetName: "Cash"
            }
        }))
    };
    // #endregion Pylons

    // #region Repeatables
    const repeatables: Record<CashRepeatableNames, Repeatable> = {
        [CashRepeatableNames.A]: createRepeatable<RepeatableOptions>(() => ({
            requirements: createCostRequirement<CostRequirementOptions>(() => ({
                resource: noPersist(points),
                cost: Formula.variable(repeatables[CashRepeatableNames.A].amount)
                    .step(20, x => x.pow(2))
                    .pow_base(5)
                    .mul(15),
                cumulativeCost: false
            })),
            display: {
                title: () => <h3>Ink Cartridges{settings.e ? " {CReA}" : ""}</h3>,
                description: () => (
                    <>
                        <i>
                            Multiplies Cash generation by{" "}
                            <b>&times;{format(effects[EffectNames.CReAEffectBase].value)}</b>{" "}
                            exponentially.
                        </i>
                    </>
                ),
                effectDisplay: () => <>&times;{format(effects[EffectNames.CReAEffect].value)}</>
            }
        })),
        [CashRepeatableNames.B]: createRepeatable<RepeatableOptions>(() => ({
            requirements: createCostRequirement<CostRequirementOptions>(() => ({
                resource: noPersist(points),
                cost: Formula.variable(repeatables[CashRepeatableNames.B].amount)
                    .step(10, x => x.pow(2.5))
                    .pow_base(100)
                    .mul(25),
                cumulativeCost: false
            })),
            display: {
                title: () => <h3>Motivation{settings.e ? " {CReB}" : ""}</h3>,
                description: () => (
                    <>
                        <i>
                            Multiplies Cash generation by{" "}
                            <b>&times;{format(effects[EffectNames.CReBEffectBase].value)}</b>.
                            Multiplier is based on current Cash amount.
                        </i>
                    </>
                ),
                effectDisplay: () => <>&times;{format(effects[EffectNames.CReBEffect].value)}</>
            }
        })),
        [CashRepeatableNames.C]: createRepeatable<RepeatableOptions>(() => ({
            requirements: createCostRequirement<CostRequirementOptions>(() => ({
                resource: noPersist(points),
                cost: Formula.variable(repeatables[CashRepeatableNames.C].amount)
                    .step(10, x => x.pow(2.5))
                    .pow_base(15)
                    .mul(100),
                cumulativeCost: false
            })),
            display: {
                title: () => <h3>Synergy{settings.e ? " {CReC}" : ""}</h3>,
                description: () => (
                    <>
                        <i>
                            Multiplies Cash generation by{" "}
                            <b>&times;{format(effects[EffectNames.CReCEffectBase].value)}</b>.
                            Multiplier is based on bought Cash Printer count.
                        </i>
                    </>
                ),
                effectDisplay: () => <>&times;{format(effects[EffectNames.CReCEffect].value)}</>
            }
        })),
        [CashRepeatableNames.D]: createRepeatable<RepeatableOptions>(() => ({
            requirements: createCostRequirement<CostRequirementOptions>(() => ({
                resource: noPersist(points),
                cost: Formula.variable(repeatables[CashRepeatableNames.D].amount)
                    .step(5, x => x.pow(3))
                    .pow_base(50)
                    .mul(1000),
                cumulativeCost: false
            })),
            display: {
                title: () => <h3>Premium Ink{settings.e ? " {CReD}" : ""}</h3>,
                description: () => (
                    <>
                        <i>
                            Increases the base multiplier for{" "}
                            <b>Ink Cartridges{settings.e ? " {CReA}" : ""}</b> by{" "}
                            <b>+{format(effects[EffectNames.CReDEffectBase].value)}</b> linearly.
                        </i>
                    </>
                ),
                effectDisplay: () => <>+{format(effects[EffectNames.CReDEffect].value)}</>
            }
        }))
    };
    // #endregion Repeatables

    // #region Return Object
    const oomps: () => JSX.Element = trackOOMPS(points, pylons[CashPylonNames.A].effect);
    return {
        // #region Display Function
        display: () => (
            <>
                <Spacer />
                <MainDisplay resource={points} color={color} />
                {oomps()}
                <Spacer />
                <Column dontMerge={true}>
                    {renderRow(pylons[CashPylonNames.A])}
                    <Spacer />{" "}
                    {renderRow(
                        repeatables[CashRepeatableNames.A],
                        repeatables[CashRepeatableNames.B],
                        repeatables[CashRepeatableNames.C],
                        repeatables[CashRepeatableNames.D]
                    )}
                </Column>
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
