/**
 * @module
 * @hidden
 */
import { createReset, Reset } from "features/reset";
import {
    createResource,
    Resource,
    trackBest,
    trackOOMPS,
    trackTotal
} from "../../features/resources/resource";
import { addTooltip } from "wrappers/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { createLayer, Layer } from "game/layers";
import type { DecimalSource } from "util/bignum";
import { createLayerTreeNode, createModifierModal, LayerTreeNode } from "../common";
import { globalBus } from "game/events";
import Decimal, { format } from "util/bignum";
import { computed, ComputedRef, Ref } from "vue";
import { noPersist, Persistent, persistent } from "game/persistence";
import { JSX } from "vue/jsx-runtime";
import { createUpgrade, Upgrade } from "features/clickables/upgrade";
import { createCostRequirement } from "game/requirements";
import { main } from "data/projEntry";
import { createRepeatable, Repeatable } from "features/clickables/repeatable";
import Formula from "game/formulas/formulas";
import {
    createAdditiveModifier,
    createMultiplicativeModifier,
    createSequentialModifier,
    Modifier
} from "game/modifiers";
import { formatWhole } from "util/break_eternity";
import Spacer from "components/layout/Spacer.vue";
import Column from "components/layout/Column.vue";
import Node from "components/Node.vue";
import ResourceVue from "features/resources/Resource.vue";
import { render, renderRow } from "util/vue";
import rebirth from "./rebirth";
import { WithRequired } from "util/common";

/* eslint @typescript-eslint/no-explicit-any: 0 */

export interface LayerCash extends Layer {
    points: Resource<DecimalSource>;
    machine: Persistent<number[]>;
    best: Ref<DecimalSource>;
    total: Ref<DecimalSource>;
    pointGain: ComputedRef<DecimalSource>;
    oomps: () => JSX.Element;
    effects: Record<string, ComputedRef<DecimalSource>>;
    treeNode: LayerTreeNode;
    tooltip: void;
    reset: Reset;
    upgrades: Upgrade[];
    printers: Repeatable[];
}

const id = "cash";
const layer: LayerCash = createLayer(id, () => {
    const points = createResource<DecimalSource>(10, "Cash", 2, false);
    const machine: Persistent<number[]> = persistent([]);
    const best = trackBest(points);
    const total = trackTotal(points);

    const pointGain: ComputedRef<DecimalSource> = computed(() => {
        const gain = cashGainModifier.apply(0);
        return main.upgrades[0].bought.value ? gain : Decimal.dZero;
    });
    const oomps = trackOOMPS(points, pointGain);

    const cashGainModifier: WithRequired<Modifier, "description"> = createSequentialModifier(() => [
        createAdditiveModifier(() => ({
            addend: effects.printer_0,
            description: "Money Printers"
        })),
        createMultiplicativeModifier(() => ({
            multiplier: effects.upg_0,
            enabled: upgrades[0].bought,
            description: "Polynomial Growth"
        })),
        createMultiplicativeModifier(() => ({
            multiplier: effects.upg_2,
            enabled: upgrades[2].bought,
            description: "Exponential Growth"
        })),
        createMultiplicativeModifier(() => ({
            multiplier: rebirth.effects.rp_innate,
            enabled: main.upgrades[1].bought,
            description: "RP Effect"
        }))
    ]);

    const effects: Record<string, ComputedRef<DecimalSource>> = {
        printer_0: computed(() => printers[0].amount.value),
        upg_count: computed(() => {
            let count = 0;
            for (let i = 0; i < upgrades.length; i++) {
                const upg = upgrades[i];
                if (upg.bought.value) count++;
            }
            return count;
        }),
        upg_0: computed(() =>
            Decimal.mul(printers[0].amount.value, effects_local.upg_0_per.value).add(1)
        ),
        upg_2: computed(() =>
            Decimal.div(printers[0].amount.value, 10)
                .floor()
                .pow_base(effects_local.upg_2_per.value)
        )
    };

    const effects_local: Record<string, ComputedRef<DecimalSource>> = {
        upg_0_per: computed(() => {
            let value: DecimalSource = 0.1;
            if (rebirth.upgrades[0].bought.value)
                value = Decimal.add(value, rebirth.effects.upg_0.value);
            return value;
        }),
        upg_2_per: computed(() => {
            let value: DecimalSource = 1.5;
            if (rebirth.upgrades[2].bought.value)
                value = Decimal.add(value, rebirth.effects.upg_2.value);
            return value;
        })
    };

    globalBus.on("update", diff => {
        points.value = Decimal.add(points.value, Decimal.times(pointGain.value, diff));
    });

    const name = "Cash";
    const color = "#0b9000";

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, any>[] => [
            points,
            machine,
            best,
            total,
            upgrades,
            printers
        ]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: "cash",
        color,
        reset,
        display: "$",
        append: () => window.innerWidth >= 1000
    }));
    const tooltip = addTooltip(treeNode, () => ({
        display: createResourceTooltip(points),
        pinnable: true
    }));

    const upgrades: Upgrade[] = [
        createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                cost: 100,
                resource: noPersist(points)
            })),
            classes: {
                cash: true
            },
            display: {
                title: () => (
                    <>
                        <h3>Polynomial Growth</h3>
                    </>
                ),
                description: () => <>Printers boost Cash gain by +{format(0.1)}&times;</>,
                effectDisplay: () => <>{format(effects.upg_0.value)}&times;</>
            }
        })),
        createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                cost: 1000,
                resource: noPersist(points)
            })),
            classes: {
                cash: true
            },
            display: {
                title: () => (
                    <>
                        <h3>Coupon Code</h3>
                    </>
                ),
                description: () => (
                    <>
                        Decrease base printer cost growth from {formatWhole(10)}&times; to{" "}
                        {formatWhole(8)}&times;
                    </>
                )
            }
        })),
        createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                cost: 5000,
                resource: noPersist(points)
            })),
            classes: {
                cash: true
            },
            display: {
                title: () => (
                    <>
                        <h3>Exponential Growth</h3>
                    </>
                ),
                description: () => (
                    <>
                        Every {formatWhole(10)} printers bought boost Cash gain by {format(1.5)}
                        &times;
                    </>
                ),
                effectDisplay: () => <>{format(effects.upg_2.value)}&times;</>
            }
        })),
        createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                cost: 50000,
                resource: noPersist(points)
            })),
            classes: {
                cash: true
            },
            display: {
                title: () => (
                    <>
                        <h3>Overstocked</h3>
                    </>
                ),
                description: () => (
                    <>
                        Increase the amount of printers per price increase from {formatWhole(10)} to{" "}
                        {formatWhole(15)}
                    </>
                )
            }
        }))
    ];

    const printerScaling: ComputedRef<Decimal>[] = [
        computed(() => {
            let scaling = Decimal.dTen;
            if (upgrades[1].bought.value) {
                scaling = scaling.div(1.25);
            }
            return scaling;
        })
    ];

    const printerSteps: ComputedRef<Decimal>[] = [
        computed(() => {
            let scaling = Decimal.dTen;
            if (upgrades[3].bought.value) {
                scaling = scaling.mul(1.5);
            }
            return scaling;
        })
    ];

    const printers: Repeatable[] = [
        createRepeatable(() => ({
            requirements: createCostRequirement(() => ({
                cost: Formula.variable(printers[0].amount)
                    .div(printerSteps[0])
                    .floor()
                    .pow_base(printerScaling[0])
                    .mul(10),
                resource: noPersist(points),
                maxBulkAmount: () => 1
            })),
            classes: {
                cash: true,
                pylon: true
            },
            display: {
                title: () => <><h3>Money Printers</h3></>,
                description: () => (
                    <>
                        Each printer give +{formatWhole(1)} Cash/s
                        <br />
                        <i>You have {formatWhole(printers[0].amount.value)} printers</i>
                    </>
                ),
                showAmount: false
            }
        }))
    ];

    const modifierModal = createModifierModal("Cash Modifiers", () => [
        {
            title: "Cash Gain",
            modifier: cashGainModifier,
            base: 0,
            unit: "/s"
        }
    ]);

    return {
        name,
        color,
        tooltip,
        display: () => (
            <>
                <div style="margin-top: 0px;">+
                    You have <ResourceVue resource={points} color={"#0b9000"} /> Cash
                    {render(modifierModal)}
                    {Decimal.gt(pointGain.value, 0) ? (
                        <div>
                            ({oomps()})<br />
                            <br />
                            <Node id="oomps" />
                        </div>
                    ) : (
                        <>
                            <br />
                            <br />
                            <br />
                        </>
                    )}
                    <Spacer />
                    <div style="display: flex; width: fit-content;">
                        {render(printers[0])}
                        <Column style="margin-left: 20px; margin-top: -10px;">
                            {renderRow(upgrades[0], upgrades[1])}
                            {renderRow(upgrades[2], upgrades[3])}
                        </Column>
                    </div>
                </div>
            </>
        ),
        effects,
        treeNode,
        points,
        best,
        total,
        pointGain,
        oomps,
        reset,
        machine,
        upgrades,
        printers
    };
});

export default layer;
