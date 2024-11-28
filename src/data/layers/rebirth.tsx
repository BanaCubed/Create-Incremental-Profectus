/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion } from "features/conversion";
import { jsx } from "features/feature";
import { createHotkey } from "features/hotkey";
import { createReset } from "features/reset";
import { createResource, trackOOMPS } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { BaseLayer, createLayer } from "game/layers";
import type { DecimalSource } from "util/bignum";
import { render, renderCol, renderRow } from "util/vue";
import { createLayerTreeNode, createModifierModal, createResetButton } from "../common";
import cash from "./cash";
import { noPersist } from "game/persistence";
import Decimal, { format, formatWhole } from "util/bignum";
import { createSequentialModifier, createMultiplicativeModifier } from "game/modifiers";
import { computed, unref } from "vue";
import ResourceVue from "features/resources/Resource.vue";
import Spacer from "components/layout/Spacer.vue";
import { createUpgrade, setupAutoPurchase } from "features/upgrades/upgrade";
import { createCostRequirement } from "game/requirements";
import Row from "components/layout/Row.vue";
import settings from "game/settings";
import { createRepeatable } from "features/repeatable";
import Formula from "game/formulas/formulas";
import Column from "components/layout/Column.vue";

/* eslint-disable @typescript-eslint/no-explicit-any */

const id = "rebirth";
const layer = createLayer(id, function (this: BaseLayer) {
    const name = "Rebirth";
    const color = "#c60029";
    const points = createResource<DecimalSource>(0, "RP", 0, false);
    const oomps = trackOOMPS(points);

    const pointGain = computed(() => {
        // eslint-disable-next-line prefer-const
        let gain = effects.rp.apply(1);
        return gain;
    });

    const conversion = createCumulativeConversion(() => ({
        formula: x => x.div(100000).sqrt().mul(pointGain),
        baseResource: cash.points,
        gainResource: noPersist(points)
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, any>[] => [layer]
    }));

    const upgs: any = {
        one: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 1
            })),
            display: {
                description: "Double cash generation for each Rebirth upgrade owned"
            },
            classes: computed(() => {
                return {
                    rebirth: true,
                    right: true
                };
            })
        })),
        two: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 3
            })),
            display: {
                description: "Automate the first four Cash upgrades"
            },
            classes: computed(() => {
                return {
                    rebirth: true,
                    right: true,
                    left: true
                };
            })
        })),
        three: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 10
            })),
            display: {
                description: "Automate the next four Cash upgrades"
            },
            classes: computed(() => {
                return {
                    rebirth: true,
                    right: true,
                    left: true
                };
            })
        })),
        four: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 50
            })),
            display: {
                description: "Unlock the next four Cash upgrades"
            },
            classes: computed(() => {
                return {
                    rebirth: true,
                    left: true
                };
            }),
            style() {
                return {
                    "border-top-right-radius": "var(--border-radius)",
                    "border-bottom-right-radius":
                        upgs.six.bought.value === true ? "0" : "var(--border-radius)"
                };
            }
        })),
        five: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 2000
            })),
            display: {
                description: "Unlock Auto Machine"
            },
            classes: computed(() => {
                return {
                    rebirth: true,
                    right: true
                };
            }),
            onPurchase() {
                main.progression.value = Decimal.max(main.progression.value, 3);
            }
        })),
        six: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 25000
            })),
            display: {
                description: "Unlock Rebirth Buyables"
            },
            classes: computed(() => {
                return {
                    rebirth: true,
                    right: upgs.five.bought.value,
                    left: true
                };
            })
        })),
        seven: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 250000
            })),
            display: {
                description: "Increase maximum machine modes by 1"
            },
            classes: computed(() => {
                return {
                    rebirth: true,
                    right: true
                };
            })
        })),
        eight: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 1.5e6
            })),
            display: {
                description: "Automate cash upgrades 9-12"
            },
            classes: computed(() => {
                return {
                    rebirth: true,
                    right: true,
                    left: true
                };
            })
        }))
    };

    const buys: any = {
        one: createRepeatable(() => ({
            requirements: [
                createCostRequirement(() => ({
                    resource: noPersist(points),
                    cost: Formula.variable(buys.one.amount)
                        .step(1e5, c => c.pow(2))
                        .pow_base(2)
                        .mul(15000)
                }))
            ],
            display: {
                description: "Boost RP gain",
                showAmount: false,
                effectDisplay: jsx(() => (
                    <>
                        ×
                        {format(
                            Decimal.pow(
                                Decimal.add(Decimal.mul(0.05, buys.two.amount.value), 1.25),
                                buys.one.amount.value
                            )
                        )}
                        <br />
                        Amount: {formatWhole(buys.one.amount.value)}
                    </>
                ))
            },
            visibility() {
                return upgs.six.bought.value === true ? 0 : 2;
            },
            classes: {
                rebirth: true,
                left: true,
                wide: true
            }
        })),
        two: createRepeatable(() => ({
            requirements: [
                createCostRequirement(() => ({
                    resource: noPersist(points),
                    cost: Formula.variable(buys.two.amount)
                        .step(10, c => c.pow(5))
                        .pow_base(8)
                        .mul(100000)
                }))
            ],
            display: {
                description: "Increase previous buyable's effect base",
                showAmount: false,
                effectDisplay: jsx(() => (
                    <>
                        +{format(Decimal.mul(0.05, buys.two.amount.value))}
                        <br />
                        Amount: {formatWhole(buys.two.amount.value)}
                    </>
                ))
            },
            visibility() {
                return upgs.six.bought.value === true ? 0 : 2;
            },
            classes: {
                rebirth: true,
                left: true,
                wide: true
            },
            style() {
                return {
                    "border-bottom-right-radius": "var(--border-radius)"
                };
            }
        }))
    };

    setupAutoPurchase(cash, upgs.two.bought, [
        cash.upgs.one,
        cash.upgs.two,
        cash.upgs.three,
        cash.upgs.four
    ]);

    setupAutoPurchase(cash, upgs.three.bought, [
        cash.upgs.five,
        cash.upgs.six,
        cash.upgs.seven,
        cash.upgs.eight
    ]);

    setupAutoPurchase(cash, upgs.eight.bought, [
        cash.upgs.nine,
        cash.upgs.ten,
        cash.upgs.eleven,
        cash.upgs.twelve
    ]);

    const effects = {
        rp: createSequentialModifier(() => [
            createMultiplicativeModifier(() => ({
                multiplier: 2,
                description: "Cash UPG 11",
                enabled: cash.upgs.eleven.bought
            })),
            createMultiplicativeModifier(() => ({
                multiplier(): any {
                    return cash.effects.machine.neut.rp.apply(2);
                },
                enabled() {
                    return cash.machine.value.includes(1);
                },
                description: "Machine Neutral Mode"
            })),
            createMultiplicativeModifier(() => ({
                multiplier(): any {
                    return cash.effects.machine.rp.rp.apply(4);
                },
                enabled() {
                    return cash.machine.value.includes(2);
                },
                description: "Machine Rebirth Mode"
            })),
            createMultiplicativeModifier(() => ({
                multiplier() {
                    return Decimal.pow(
                        Decimal.add(Decimal.mul(0.05, buys.two.amount.value), 1.25),
                        buys.one.amount.value
                    );
                },
                description: "Rebirth BUY 1",
                enabled: upgs.six.bought
            })),
            createMultiplicativeModifier(() => ({
                multiplier: 0,
                description: "Unable to Rebirth",
                enabled() {
                    return cash.upgs.eight.bought.value !== true;
                }
            }))
        ]),
        rpCash: createSequentialModifier(() => [
            createMultiplicativeModifier(() => ({
                multiplier() {
                    return Decimal.max(points.value, 0).add(1).log(10).add(1).pow(2);
                },
                description: "Initial Amount"
            }))
        ])
    };

    const treeNode = createLayerTreeNode(() => ({
        layerID: "rebirth",
        color,
        reset,
        display: "R",
        append: computed(() => {
            return unref(settings.appendLayers);
        }),
        visibility() {
            return cash.upgs.eight.bought.value === true || Decimal.gte(main.progression.value, 0.9)
                ? 0
                : 2;
        }
    }));
    const tooltip = addTooltip(treeNode, {
        display: createResourceTooltip(points),
        pinnable: true
    });

    const resetButton = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode,
        display: jsx(() => (
            <>
                {cash.upgs.eight.bought.value === true
                    ? Decimal.gte(cash.points.value, 100000)
                        ? `Rebirth for ${formatWhole(conversion.actualGain.value)} RP,
                    next at ${formatWhole(conversion.nextAt.value)} cash`
                        : `Reach ${formatWhole(100000)} cash to Rebirth`
                    : 'Purchase Cash UPG 8 "Repitition" to Rebirth'}
            </>
        )),
        onClick() {
            main.progression.value = Decimal.max(main.progression.value, 1);
        },
        canClick(): boolean {
            return Decimal.gte(conversion.actualGain.value, 1) && cash.upgs.eight.bought.value;
        },
        classes: computed(() => {
            return {
                rebirth: true
            };
        })
    }));

    const hotkey = createHotkey(() => ({
        description: "Rebirth for RP",
        key: "r",
        onPress: resetButton.onClick,
        enabled() {
            return Decimal.gte(main.progression.value, 0.9);
        }
    }));

    const modals = {
        rpGain: createModifierModal("Rebirth", () => [
            {
                title: "RP Gain",
                modifier: effects.rp,
                base() {
                    return Decimal.div(cash.points.value, 1e5).sqrt();
                }
            }
        ])
    };

    return {
        name,
        color,
        points,
        tooltip,
        effects,
        display: jsx(() => (
            <>
                <br></br>
                You have <ResourceVue resource={points} color={color} /> RP{render(modals.rpGain)}
                <br></br>Multiplying cash gain by x
                {format(Decimal.max(points.value, 0).add(1).log(10).add(1).pow(2))}
                {Decimal.gt(pointGain.value, "1e1000") ? <div>({oomps.value})</div> : null}
                <Spacer></Spacer>
                {render(resetButton)}
                <Row>
                    {renderCol(upgs.one, upgs.five, upgs.seven)}
                    {renderCol(upgs.two, upgs.six, upgs.eight)}
                    <Column>
                        {renderRow(upgs.three, upgs.four)}
                        {render(buys.one)}
                        {render(buys.two)}
                    </Column>
                </Row>
            </>
        )),
        treeNode,
        hotkey,
        upgs,
        buys,
        minimizable: false
    };
});

export default layer;
