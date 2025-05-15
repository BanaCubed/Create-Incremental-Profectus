import Spacer from "components/layout/Spacer.vue";
import { createLayerTreeNode, LayerTreeNode } from "data/common";
import { createPylon, Pylon } from "ci-addons/features/pylon";
import {
    createResource,
    trackBest,
    trackOOMPS,
    trackTotal,
    Resource
} from "features/resources/resource";
import ResourceVue from "features/resources/Resource.vue";
import Formula from "game/formulas/formulas";
import { createLayer, Layer } from "game/layers";
import { noPersist } from "game/persistence";
import { createCostRequirement, displayRequirements } from "game/requirements";
import Decimal, { DecimalSource, format, formatWhole } from "util/bignum";
import { renderCol } from "util/vue";
import { computed, ComputedRef, Ref, unref } from "vue";
import { JSX } from "vue/jsx-runtime";
import { addTooltip } from "wrappers/tooltips/tooltip";
import { createRepeatable, Repeatable } from "features/clickables/repeatable";
import { createMultiplicativeModifier, createSequentialModifier } from "game/modifiers";
import { processGetter } from "util/computed";
import { Visibility } from "features/feature";

//#region Interface
export interface LayerCash extends Layer {
    points: Resource<DecimalSource>;
    best: Ref<DecimalSource>;
    total: Ref<DecimalSource>;
    oomps: () => JSX.Element;
    buyables: Repeatable[];
    treeNode: LayerTreeNode;
    pylons: Pylon[];
    effects: Record<string, ComputedRef>;
}
//#endregion Interface

//#region Setup
const color = "#0b8000";
const layer: LayerCash = createLayer("cash", () => {
    //#endregion Setup
    //#region Resources
    const points: Resource<DecimalSource> = createResource(10, "Cash", 0);
    const best: Ref<DecimalSource> = trackBest(points);
    const total: Ref<DecimalSource> = trackTotal(points);
    //#endregion Resources
    //#region Tree Node
    const treeNode = createLayerTreeNode(() => ({
        name: "$",
        layerID: "cash",
        color,
        append: false,
        display: (
            <>
                <img src="c_c.png" height="85" />
            </>
        )
    }));
    addTooltip(treeNode, () => ({
        display: () => <>{formatWhole(points.value)} Cash</>
    }));
    //#endregion Tree Node
    //#region Cash Gain
    const cashGain = createSequentialModifier(() => [
        createMultiplicativeModifier(() => ({
            multiplier: effects.buy1effect
        })),
        createMultiplicativeModifier(() => ({
            multiplier: effects.buy2effect
        })),
        createMultiplicativeModifier(() => ({
            multiplier: effects.buy3effect
        }))
    ]);
    //#endregion Cash Gain
    //#region Pylons
    const pylons: Pylon[] = [
        //#region Pylon 1
        createPylon(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: Formula.variable(pylons[0].amount).add(1).pow_base(10)
            })),
            gain: computed(() => cashGain.apply(1)),
            target: noPersist(points),
            display: {
                title: () => <h3>Cash Pylon</h3>,
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
        //#endregion Pylon 1
    ];
    //#endregion Pylons
    //#region Buyables
    const buyables: Repeatable[] = [
        //#region Buyable 1
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
                    <h3>Inflation</h3>
                    <br />
                    <i>
                        Multiplies cash gain by &times;
                        <b>{format(effects.buy1base.value)}</b> per purchase
                    </i>
                    <br />
                    <br />
                    Amount: {formatWhole(buyables[0].amount.value)}
                    <br />
                    Currently: &times;{format(effects.buy1effect.value)}
                    <br />
                    {displayRequirements(buyables[0].requirements)}
                </>
            ),
            classes: {
                repeatable: true
            },
            visibility: () =>
                Decimal.gt(pylons[0].amount.value, 0) ? Visibility.Visible : Visibility.None
        })),
        //#endregion Buyable 1
        //#region Buyable 2
        createRepeatable(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: Formula.variable(buyables[1].amount).pow(1.8).pow_base(10).mul(25),
                cumulativeCost: false
            })),
            display: () => (
                <>
                    <h3>Synergism</h3>
                    <br />
                    <i>
                        Multiplies cash gain by &times;
                        <b>{format(effects.buy2base.value)}</b> per purchase
                        <br />
                        Based on Cash
                    </i>
                    <br />
                    <br />
                    Amount: {formatWhole(buyables[1].amount.value)}
                    <br />
                    Currently: &times;{format(effects.buy2effect.value)}
                    <br />
                    {displayRequirements(buyables[1].requirements)}
                </>
            ),
            classes: {
                repeatable: true
            },
            visibility: () =>
                Decimal.gt(buyables[0].amount.value, 0) ? Visibility.Visible : Visibility.None
        })),
        //#endregion Buyable 2
        //#region Buyable 3
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
                    <h3>Overcharged</h3>
                    <br />
                    <i>
                        Multiplies cash gain by &times;
                        <b>{format(effects.buy3base.value)}</b> per purchase
                        <br />
                        Based on Cash Pylons bought
                    </i>
                    <br />
                    <br />
                    Amount: {formatWhole(buyables[2].amount.value)}
                    <br />
                    Currently: &times;{format(effects.buy3effect.value)}
                    <br />
                    {displayRequirements(buyables[2].requirements)}
                </>
            ),
            classes: {
                repeatable: true
            },
            visibility: () =>
                Decimal.gt(buyables[1].amount.value, 0) ? Visibility.Visible : Visibility.None
        }))
        //#endregion Buyable 3
    ];
    //#endregion Buyables
    //#region Effects
    const effects: Record<string, ComputedRef<DecimalSource>> = {
        buy1base: computed(() => 1.65),
        buy1effect: computed(() => Decimal.pow(effects.buy1base.value, buyables[0].amount.value)),
        buy2base: computed(() =>
            Decimal.max(points.value, 1).log(10).add(1).log(3).add(1).mul(1.1)
        ),
        buy2effect: computed(() => Decimal.pow(effects.buy2base.value, buyables[1].amount.value)),
        buy3base: computed(() => Decimal.div(pylons[0].amount.value, 25).add(1)),
        buy3effect: computed(() => Decimal.pow(effects.buy3base.value, buyables[2].amount.value))
    };
    //#endregion
    //#region Return Object
    const oomps: () => JSX.Element = trackOOMPS(points, pylons[0].effect);
    return {
        //#region Display Function
        display: () => (
            <>
                You have <ResourceVue resource={points} color={color} /> Cash
                <br />
                {oomps()}
                <Spacer />
                <div class="row" style="align-items: start;">
                    {renderCol(...pylons)}
                    <Spacer />
                    {renderCol(...buyables)}
                </div>
            </>
        ),
        //#endregion Display Function
        points,
        best,
        total,
        oomps,
        buyables,
        treeNode,
        color,
        pylons,
        effects
    };
});
//#endregion Return Object

export default layer;
