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
import { createLayerTreeNode, createResetButton, LayerTreeNode, ResetButton } from "../common";
import { globalBus } from "game/events";
import Decimal, { format, formatWhole } from "util/bignum";
import { computed, ComputedRef, Ref, unref } from "vue";
import { noPersist, Persistent, persistent } from "game/persistence";
import { JSX } from "vue/jsx-runtime";
import { createUpgrade, Upgrade } from "features/clickables/upgrade";
import { main } from "data/projEntry";
import { createSequentialModifier } from "game/modifiers";
import Spacer from "components/layout/Spacer.vue";
import Node from "components/Node.vue";
import ResourceVue from "features/resources/Resource.vue";
import { Conversion, createCumulativeConversion } from "features/conversion";
import cash from "./cash";
import { createBooleanRequirement, createCostRequirement } from "game/requirements";
import { render, renderRow } from "util/vue";
import Fraction from "components/math/Fraction.vue";
import Column from "components/layout/Column.vue";
import { createHotkey, Hotkey } from "features/hotkey";
import Tooltip from "wrappers/tooltips/Tooltip.vue";
import { Direction } from "util/common";

/* eslint @typescript-eslint/no-explicit-any: 0 */

export interface LayerRebirth extends Layer {
    points: Resource<DecimalSource>;
    machine: Persistent<number[]>;
    best: Ref<DecimalSource>;
    total: Ref<DecimalSource>;
    passiveGen: ComputedRef<DecimalSource>;
    oomps: () => JSX.Element;
    hotkey: Hotkey;
    effects: Record<string, ComputedRef<DecimalSource>>;
    treeNode: LayerTreeNode;
    tooltip: void;
    conversion: Conversion;
    reset: Reset;
    upgrades: Upgrade[];
    resetButton: ResetButton;
}

const id = "rebirth";
const layer: LayerRebirth = createLayer(id, () => {
    const points = createResource<DecimalSource>(0, "RP", 0, false);
    const machine: Persistent<number[]> = persistent([]);
    const best = trackBest(points);
    const total = trackTotal(points);

    const passiveGen = computed(() => {
        const gain = Decimal.dZero;
        return main.upgrades[0].bought.value ? gain : Decimal.dZero;
    });
    const oomps = trackOOMPS(points, passiveGen);

    // const rpGainModifier = createSequentialModifier(() => []);

    const hotkey = createHotkey(() => ({
        key: "r",
        description: "Perform a Rebirth",
        onPress() {
            resetButton.onClick?.();
        }
    }));

    const effects: Record<string, ComputedRef<DecimalSource>> = {
        rp_innate: computed(() => Decimal.max(total.value, 0).mul(12).add(1).log10().add(1)),
        upg_count: computed(() => {
            let count = 0;
            for (let i = 0; i < upgrades.length; i++) {
                const upg = upgrades[i];
                if (upg.bought.value) count++;
            }
            return count;
        }),
        upg_0: computed(() => Decimal.mul(0.02, effects.upg_count.value)),
        upg_1: computed(() => Decimal.pow(1.1, effects.upg_count.value).recip()),
        upg_2: computed(() => Decimal.mul(0.05, effects.upg_count.value)),
        upg_3: computed(() => Decimal.mul(5, effects.upg_count.value))
    };

    globalBus.on("update", diff => {
        points.value = Decimal.add(points.value, Decimal.times(passiveGen.value, diff));
    });

    const name = "Rebirth";
    const color = "#c60029";

    const treeNode = createLayerTreeNode(() => ({
        layerID: "rebirth",
        color,
        reset,
        display: "R",
        append: () => window.innerWidth >= 1000,
        visibility: () => main.upgrades[1].bought.value
    }));
    const tooltip = addTooltip(treeNode, () => ({
        display: createResourceTooltip(points),
        pinnable: true
    }));

    const conversion: Conversion = createCumulativeConversion(() => ({
        baseResource: noPersist(cash.points),
        gainResource: noPersist(points),
        formula: x => x.div(500000).pow(0.3)
    }));

    const resetButton: ResetButton = createResetButton(() => ({
        requirements: createBooleanRequirement(() => Decimal.gt(unref(conversion.actualGain), 0)),
        display: () => (
            <>
                <span style="font-size: 10.9512px;">Rebirth</span>
                <br />
                {unref<boolean>(resetButton.canClick) ? (
                    <>
                        Rebirth for {formatWhole(unref(conversion.actualGain))} Rebirth Points
                        {Decimal.gte(unref(conversion.actualGain), 100) ? (
                            <></>
                        ) : (
                            <>, next at {formatWhole(unref(conversion.nextAt))} Cash</>
                        )}
                    </>
                ) : (
                    <>Reach {formatWhole(500000)} Cash to Rebirth</>
                )}
            </>
        ),
        conversion,
        treeNode,
        tree: main.tree,
        classes: {
            // halfwide: true,
            pylon: true
        }
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, any>[] => []
    }));

    const upgrades: Upgrade[] = [
        createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                cost: 3,
                resource: noPersist(points)
            })),
            classes: {
                rebirth: true
            },
            display: {
                title: () => (
                    <>
                        <h3>Polyhedron</h3>
                    </>
                ),
                description: () => (
                    <>Improve "Polynomial Growth" by +{format(0.02)}&times; per rebirth upgrade</>
                ),
                effectDisplay: () => <>+{format(effects.upg_0.value)}&times;</>
            }
        })),
        createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                cost: 3,
                resource: noPersist(points)
            })),
            classes: {
                rebirth: true
            },
            display: {
                title: () => (
                    <>
                        <h3>Bulk Buying</h3>
                    </>
                ),
                description: () => (
                    <>
                        Multiply base printer cost growth by{" "}
                        <Fraction>{{ denominator: () => <>{format(1.1)}</> }}</Fraction> per rebirth
                        upgrade
                    </>
                ),
                effectDisplay: () => <>{format(effects.upg_1.value)}&times;</>
            }
        })),
        createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                cost: 3,
                resource: noPersist(points)
            })),
            classes: {
                rebirth: true
            },
            display: {
                title: () => (
                    <>
                        <h3>Indices</h3>
                    </>
                ),
                description: () => (
                    <>Improve "Exponential Growth" by +{format(0.05)}&times; per rebirth upgrade</>
                ),
                effectDisplay: () => <>+{format(effects.upg_2.value)}&times;</>
            }
        })),
        createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                cost: 3,
                resource: noPersist(points)
            })),
            classes: {
                rebirth: true
            },
            display: {
                title: () => (
                    <>
                        <h3>Family Heirloom</h3>
                    </>
                ),
                description: () => <>Gives +{formatWhole(5)} free printers per rebirth upgrade</>,
                effectDisplay: () => <>+{formatWhole(effects.upg_3.value)}</>
            }
        }))
    ];

    return {
        name,
        color,
        tooltip,
        display: () => (
            <>
                <div style="margin-top: -000px;">
                    You have <ResourceVue resource={points} color={"#c60029"} /> Rebirth Points,
                    boosting:
                    <br />
                    <span class="inline-tooltip"><Tooltip direction={Direction.Up} display={"Based on total"}><span class="material-icons">vertical_align_top</span></Tooltip></span>Cash gain {format(effects.rp_innate.value)}&times;
                    {Decimal.gt(passiveGen.value, 0) ? (
                        <div>
                            ({oomps()})
                            <br />
                            <Node id="oomps" />
                        </div>
                    ) : (
                        <>
                            <br />
                            <br />
                        </>
                    )}
                    <Spacer />
                    <div style="display: flex; width: fit-content;">
                        {render(resetButton)}
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
        passiveGen,
        oomps,
        reset,
        machine,
        upgrades,
        conversion,
        resetButton,
        hotkey
    };
});

export default layer;
