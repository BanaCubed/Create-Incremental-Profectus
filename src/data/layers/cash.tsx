/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion } from "features/conversion";
import { jsx } from "features/feature";
import { createHotkey } from "features/hotkey";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import Node from "components/Node.vue";
import { createResource, trackBest, trackOOMPS, trackTotal } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { BaseLayer, createLayer } from "game/layers";
import type { DecimalSource } from "util/bignum";
import { render, renderCol, renderRow } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../common";
import { globalBus } from "game/events";
import Decimal, { format } from "util/bignum";
import { computed } from "vue";
import { createUpgrade } from "features/upgrades/upgrade";
import { createCostRequirement } from "game/requirements";
import { noPersist } from "game/persistence";
import { createAdditiveModifier, createExponentialModifier, createModifierSection, createMultiplicativeModifier, createSequentialModifier } from "game/modifiers";
import ResourceVue from "features/resources/Resource.vue";
import Spacer from "components/layout/Spacer.vue";
import Row from "components/layout/Row.vue";
import { createBoard } from "features/boards/board";
import themes from "data/themes";
import settings from "game/settings";
import rebirth from "./rebirth";

const id = "cash";
const layer = createLayer(id, function (this: BaseLayer) {
    const points = createResource<DecimalSource>(0, "cash");
    const best = trackBest(points);
    const total = trackTotal(points);

    const pointGain = computed(() => {
        // eslint-disable-next-line prefer-const
        let gain = effects.cash.apply(0);
        return gain;
    });
    globalBus.on("update", diff => {
        points.value = Decimal.add(points.value, Decimal.times(pointGain.value, diff));
    });
    const oomps = trackOOMPS(points, pointGain);
    
    const name = "Cash";
    const color = "#0b8000";

    const treeNode = createLayerTreeNode(() => ({
        layerID: 'cash',
        color,
        reset,
        display: '$',
        append: false,
    }));
    const tooltip = addTooltip(treeNode, {
        display: createResourceTooltip(points),
        pinnable: true
    });

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, any>[] => [upgs, effects, points, best, total, oomps]
    }));

    const upgs = {
        one: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 0,
            })),
            display: {
                description: "Begin generating 1 cash/s",
                title: "The Start...",
            },
        })),
        two: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 10,
            })),
            display: {
                description: "Quadruple cash gain",
            }
        })),
        three: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 50,
            })),
            display: {
                description: "Boost cash gain based on cash",
                effectDisplay: jsx(() => (
                    <>
                    <span>x{format(Decimal.max(0, points.value).add(1).log(5).add(1))}</span>
                    </>
                ))
            }
        })),
        four: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 300,
            })),
            display: {
                description: "Quadruple cash gain again",
            }
        })),
        five: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 1600,
            })),
            display: {
                description: "Boost cash gain based on cash again",
                effectDisplay: jsx(() => (
                    <>
                    <span>x{format(Decimal.max(0, points.value).add(1).log(8).add(1).pow(0.8))}</span>
                    </>
                ))
            }
        })),
        six: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 5500,
            })),
            display: {
                description: "Boost cash gain based on cash, yet again",
                effectDisplay: jsx(() => (
                    <>
                    <span>x{format(Decimal.max(0, points.value).add(1).log(6).add(1).pow(0.6))}</span>
                    </>
                ))
            }
        })),
        seven: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 17000,
            })),
            display: {
                description: "Raise previous boosts ^1.2",
            }
        })),
        eight: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 200000,
            })),
            display: {
                description: "Unlock Rebirth",
                title: "Repitition",
            }
        })),
    }

    const effects = {
        cash: createSequentialModifier(() => [
            createAdditiveModifier(() => ({
                addend: 1,
                enabled: upgs.one.bought,
                description: "The Start...",
            })),
            createMultiplicativeModifier(() => ({
                multiplier: 4,
                enabled: upgs.two.bought,
                description: "Cash UPG 2",
            })),
            createMultiplicativeModifier(() => ({
                multiplier() {return Decimal.max(0, points.value).add(1).log(5).add(1)},
                enabled: upgs.three.bought,
                description: "Cash UPG 3",
            })),
            createMultiplicativeModifier(() => ({
                multiplier: 4,
                enabled: upgs.four.bought,
                description: "Cash UPG 4",
            })),
            createMultiplicativeModifier(() => ({
                multiplier() {return Decimal.max(0, points.value).add(1).log(8).add(1).pow(0.8)},
                enabled: upgs.five.bought,
                description: "Cash UPG 5",
            })),
            createMultiplicativeModifier(() => ({
                multiplier() {return Decimal.max(0, points.value).add(1).log(6).add(1).pow(0.6)},
                enabled: upgs.six.bought,
                description: "Cash UPG 6",
            })),
            createExponentialModifier(() => ({
                exponent: 1.2,
                enabled: upgs.seven.bought,
                description: "Cash UPG 7"
            })),
            createMultiplicativeModifier(() => ({
                multiplier(): any {return Decimal.max(rebirth.points.value, 0).add(1).log(10).add(1).pow(2)},
                enabled: upgs.eight.bought.value || Decimal.gte(main.progression.value, 0.9),
                description: "RP Effect",
            })),
        ]),
    }

    return {
        name,
        color,
        tooltip,
        display: jsx(() => (
            <>
                You have <ResourceVue resource={points} color={color} /> cash
                {Decimal.gt(pointGain.value, 0) ? (
                    <div>
                        ({oomps.value})
                        <Node id="oomps" />
                    </div>
                ) : null}
                <Spacer></Spacer>
                <Row>
                    {renderCol(upgs.one, upgs.five)}
                    {renderCol(upgs.two, upgs.six)}
                    {renderCol(upgs.three, upgs.seven)}
                    {renderCol(upgs.four, upgs.eight)}
                </Row>
            </>
        )),
        treeNode,
        points,
        best,
        total,
        pointGain,
        oomps,
        upgs,
        effects,
        reset,
    };
});

export default layer;
