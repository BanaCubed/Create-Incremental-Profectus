/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { jsx } from "features/feature";
import { createReset } from "features/reset";
import Node from "components/Node.vue";
import { createResource, trackBest, trackOOMPS, trackTotal } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { BaseLayer, createLayer } from "game/layers";
import type { DecimalSource } from "util/bignum";
import { render, renderRow } from "util/vue";
import { createLayerTreeNode, createModifierModal } from "../common";
import { globalBus } from "game/events";
import Decimal, { format, formatWhole } from "util/bignum";
import { computed, unref } from "vue";
import { createUpgrade } from "features/upgrades/upgrade";
import { createCostRequirement } from "game/requirements";
import { noPersist, persistent } from "game/persistence";
import {
    createExponentialModifier,
    createMultiplicativeModifier,
    createSequentialModifier
} from "game/modifiers";
import ResourceVue from "features/resources/Resource.vue";
import Spacer from "components/layout/Spacer.vue";
import rebirth from "./rebirth";
import { createTab } from "features/tabs/tab";
import { createTabFamily } from "features/tabs/tabFamily";
import { createClickable } from "features/clickables/clickable";
import settings from "game/settings";
import Column from "components/layout/Column.vue";
import srebirth from "./super";
import { createRepeatable } from "features/repeatable";
import Formula from "game/formulas/formulas";

/**
 * Util function for display of dynamic portion of subtitle for The Machine
 * @returns {string} To be used in the subtitle
 */
export function machineDisplay(): string {
    // Inactive case, also handles negative lengths if that happens
    if (layer.machine.value.length < 1) {
        return (
            "Inactive // " + layer.machine.value.length + "/" + layer.machineUtils.maxModes.value
        );
    }

    const modeNames = ["Cash", "Neutral", "Rebirth"];
    let text = "in ";

    // Single mode case
    if (layer.machine.value.length < 2) {
        text = text + modeNames[layer.machine.value[0]] + " Mode";
    } else {
        text = text + " the ";
        for (let index = 0; index < layer.machine.value.length; index++) {
            const mode = layer.machine.value[index];

            text = text + modeNames[mode] + ", ";
        }
        text = text.substring(0, text.length - 2) + " Modes";
    }
    return text + ` // ${layer.machine.value.length}/${layer.machineUtils.maxModes.value}`;
}

const id = "cash";
const layer: any = createLayer(id, function (this: BaseLayer) {
    const points = createResource<DecimalSource>(0, "Cash", 2, false);
    const machine: any = persistent([]);
    const best = trackBest(points);
    const total = trackTotal(points);

    const pointGain = computed(() => {
        // eslint-disable-next-line prefer-const
        let gain = effects.cash.apply(upgs.one.bought.value ? 1 : 0);
        return gain;
    });
    globalBus.on("update", diff => {
        points.value = Decimal.add(points.value, Decimal.times(pointGain.value, diff));
        if (
            Decimal.gt(autoMachine.c.value, 0.5) &&
            machine.value.includes(0) !== true &&
            rebirth.upgs.five.bought.value === true
        ) {
            machineClickables.cash.onClick();
        }
        if (
            Decimal.gt(autoMachine.n.value, 0.5) &&
            machine.value.includes(1) !== true &&
            rebirth.upgs.five.bought.value === true
        ) {
            machineClickables.neut.onClick();
        }
        if (
            Decimal.gt(autoMachine.r.value, 0.5) &&
            machine.value.includes(2) !== true &&
            rebirth.upgs.five.bought.value === true
        ) {
            machineClickables.rp.onClick();
        }
    });
    const oomps = trackOOMPS(points, pointGain);

    const machineUtils = {
        canDisable: computed(() => {
            return false;
        }),
        maxModes: computed(() => {
            let n = 0;
            if (upgs.twelve.bought.value) {
                n++;
            }
            if (rebirth.upgs.seven.bought.value === true) {
                n++;
            }
            if (rebirth.upgs.eleven.bought.value === true) {
                n++;
            }
            return n;
        })
    };

    const autoMachine: any = {
        c: persistent(0, false),
        n: persistent(0, false),
        r: persistent(0, false)
    };

    const name = "Cash";
    const color = "#0b9000";

    const treeNode = createLayerTreeNode(() => ({
        layerID: "cash",
        color,
        reset,
        display: "$",
        append: computed(() => {
            return unref(settings.appendLayers);
        })
    }));
    const tooltip = addTooltip(treeNode, {
        display: createResourceTooltip(points),
        pinnable: true
    });

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, any>[] => [
            effects,
            points,
            best,
            total,
            oomps,
            machine,
            srebirth.achs.three.earned.value === true
                ? Decimal.gt(rebirth.points.value, 0)
                    ? null
                    : [
                          upgs.four,
                          upgs.five,
                          upgs.six,
                          upgs.seven,
                          upgs.eight,
                          upgs.nine,
                          upgs.ten,
                          upgs.eleven,
                          upgs.twelve
                      ]
                : upgs
        ]
    }));

    const upgs = {
        one: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 0,
                requiresPay() {
                    return srebirth.achs.one.earned.value !== true;
                }
            })),
            display: {
                description: "Begin generating 1 cash/s",
                title: "The Start..."
            },
            classes: computed(() => {
                return {
                    cash: true
                };
            })
        })),
        two: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 10,
                requiresPay() {
                    return srebirth.achs.one.earned.value !== true;
                }
            })),
            display: {
                description: "Quadruple cash gain"
            },
            classes: computed(() => {
                return {
                    cash: true
                };
            })
        })),
        three: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 50,
                requiresPay() {
                    return srebirth.achs.one.earned.value !== true;
                }
            })),
            display: {
                description: "Boost cash gain based on cash",
                effectDisplay: jsx(() => (
                    <>
                        <span>×{format(Decimal.max(0, points.value).add(1).log(5).add(1))}</span>
                    </>
                ))
            },
            classes: computed(() => {
                return {
                    cash: true
                };
            })
        })),
        four: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 300,
                requiresPay() {
                    return srebirth.achs.one.earned.value !== true;
                }
            })),
            display: {
                description: "Quadruple cash gain again"
            },
            classes: computed(() => {
                return {
                    cash: true
                };
            })
        })),
        five: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 1600,
                requiresPay() {
                    return srebirth.achs.one.earned.value !== true;
                }
            })),
            display: {
                description: "Boost cash gain based on cash again",
                effectDisplay: jsx(() => (
                    <>
                        <span>
                            ×{format(Decimal.max(0, points.value).add(1).log(8).add(1).pow(0.8))}
                        </span>
                    </>
                ))
            },
            classes: computed(() => {
                return {
                    cash: true
                };
            }),
            style: computed(() => {
                return {
                    "border-bottom-left-radius":
                        rebirth.upgs.four.bought.value === true
                            ? "0"
                            : "var(--border-radius) !important"
                };
            })
        })),
        six: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 5500,
                requiresPay() {
                    return srebirth.achs.one.earned.value !== true;
                }
            })),
            display: {
                description: "Boost cash gain based on cash, yet again",
                effectDisplay: jsx(() => (
                    <>
                        <span>
                            ×{format(Decimal.max(0, points.value).add(1).log(6).add(1).pow(0.6))}
                        </span>
                    </>
                ))
            },
            classes: computed(() => {
                return {
                    cash: true
                };
            })
        })),
        seven: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 17000,
                requiresPay() {
                    return srebirth.achs.one.earned.value !== true;
                }
            })),
            display: {
                description: "Raise previous boosts ^1.2"
            },
            classes: computed(() => {
                return {
                    cash: true
                };
            })
        })),
        eight: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 200000,
                requiresPay() {
                    return srebirth.achs.one.earned.value !== true;
                }
            })),
            display: {
                description: "Unlock Rebirth",
                title: "Repitition"
            },
            classes: computed(() => {
                return {
                    cash: true
                };
            }),
            style: computed(() => {
                return {
                    "border-bottom-right-radius":
                        rebirth.upgs.four.bought.value === true
                            ? "0"
                            : "var(--border-radius) !important"
                };
            })
        })),
        nine: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 80e6,
                requiresPay() {
                    return srebirth.achs.one.earned.value !== true;
                }
            })),
            display: {
                description: "Boost cash gain based on cash, yet another time",
                effectDisplay: jsx(() => (
                    <>
                        <span>
                            ×{format(Decimal.max(0, points.value).add(1).log(1e5).add(1).pow(1.5))}
                        </span>
                    </>
                ))
            },
            visibility() {
                return rebirth.upgs.four.bought.value;
            },
            classes: computed(() => {
                return {
                    cash: true
                };
            })
        })),
        ten: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 7e8,
                requiresPay() {
                    return srebirth.achs.one.earned.value !== true;
                }
            })),
            display: {
                description: "Boost cash gain based on cash, for the last time",
                effectDisplay: jsx(() => (
                    <>
                        <span>×{format(Decimal.max(0, points.value).add(1).log(1e2).add(1))}</span>
                    </>
                ))
            },
            visibility() {
                return rebirth.upgs.four.bought.value;
            },
            classes: computed(() => {
                return {
                    cash: true
                };
            })
        })),
        eleven: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 1e10,
                requiresPay() {
                    return srebirth.achs.one.earned.value !== true;
                }
            })),
            display: {
                description: "Double RP gain"
            },
            visibility() {
                return rebirth.upgs.four.bought.value;
            },
            classes: computed(() => {
                return {
                    cash: true
                };
            })
        })),
        twelve: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 2.5e10,
                requiresPay() {
                    return srebirth.achs.one.earned.value !== true;
                }
            })),
            display: {
                description: "Unlock The Machine",
                title: "Beep Boop"
            },
            visibility() {
                return rebirth.upgs.four.bought.value;
            },
            classes: computed(() => {
                return {
                    cash: true
                };
            }),
            onPurchase() {
                main.progression.value = Decimal.max(main.progression.value, 2);
            }
        }))
    };

    const buys: any = {
        one: createRepeatable(() => ({
            requirements: [
                createCostRequirement(() => ({
                    resource: noPersist(points),
                    cost: Formula.variable(buys.one.amount)
                        .step(100, c => c.pow(2))
                        .pow_base(10)
                        .mul(1000)
                }))
            ],
            display: {
                description: "Boost RP gain slightly",
                showAmount: false,
                effectDisplay: jsx(() => (
                    <>
                        ×{format(Decimal.pow(1.1, buys.one.amount.value))}
                        <br />
                        Amount: {formatWhole(buys.one.amount.value)}
                    </>
                ))
            },
            visibility() {
                return srebirth.achs.four.earned.value === true ? 0 : 2;
            },
            classes: {
                cash: true,
                wide: true
            }
        }))
    };

    const effects: any = {
        cash: createSequentialModifier(() => [
            createMultiplicativeModifier(() => ({
                multiplier: 4,
                enabled: upgs.two.bought,
                description: "Cash UPG 2"
            })),
            createMultiplicativeModifier(() => ({
                multiplier() {
                    return Decimal.max(0, points.value).add(1).log(5).add(1);
                },
                enabled: upgs.three.bought,
                description: "Cash UPG 3"
            })),
            createMultiplicativeModifier(() => ({
                multiplier: 4,
                enabled: upgs.four.bought,
                description: "Cash UPG 4"
            })),
            createMultiplicativeModifier(() => ({
                multiplier() {
                    return Decimal.max(0, points.value).add(1).log(8).add(1).pow(0.8);
                },
                enabled: upgs.five.bought,
                description: "Cash UPG 5"
            })),
            createMultiplicativeModifier(() => ({
                multiplier() {
                    return Decimal.max(0, points.value).add(1).log(6).add(1).pow(0.6);
                },
                enabled: upgs.six.bought,
                description: "Cash UPG 6"
            })),
            createExponentialModifier(() => ({
                exponent: 1.2,
                enabled: upgs.seven.bought,
                description: "Cash UPG 7"
            })),
            createMultiplicativeModifier(() => ({
                multiplier() {
                    return Decimal.max(0, points.value).add(1).log(1e5).add(1).pow(1.5);
                },
                enabled: upgs.nine.bought,
                description: "Cash UPG 9"
            })),
            createMultiplicativeModifier(() => ({
                multiplier() {
                    return Decimal.max(0, points.value).add(1).log(1e2).add(1);
                },
                enabled: upgs.ten.bought,
                description: "Cash UPG 10"
            })),
            createMultiplicativeModifier(() => ({
                multiplier(): any {
                    return effects.machine.cash.cash.apply(8);
                },
                enabled() {
                    return machine.value.includes(0);
                },
                description: "Machine Cash Mode"
            })),
            createMultiplicativeModifier(() => ({
                multiplier(): any {
                    return effects.machine.neut.cash.apply(3);
                },
                enabled() {
                    return machine.value.includes(1);
                },
                description: "Machine Neutral Mode"
            })),
            createMultiplicativeModifier(() => ({
                multiplier(): any {
                    return Decimal.max(rebirth.points.value, 0).add(1).log(10).add(1).pow(2);
                },
                enabled() {
                    return Decimal.gte(main.progression.value, 0.9);
                },
                description: "RP Effect"
            })),
            createMultiplicativeModifier(() => ({
                multiplier(): any {
                    let upgs = Decimal.dZero;
                    if (rebirth.upgs.one.bought.value === true) {
                        upgs = upgs.add(1);
                    }
                    if (rebirth.upgs.two.bought.value === true) {
                        upgs = upgs.add(1);
                    }
                    if (rebirth.upgs.three.bought.value === true) {
                        upgs = upgs.add(1);
                    }
                    if (rebirth.upgs.four.bought.value === true) {
                        upgs = upgs.add(1);
                    }
                    if (rebirth.upgs.five.bought.value === true) {
                        upgs = upgs.add(1);
                    }
                    if (rebirth.upgs.six.bought.value === true) {
                        upgs = upgs.add(1);
                    }
                    if (rebirth.upgs.seven.bought.value === true) {
                        upgs = upgs.add(1);
                    }
                    return Decimal.pow(2, upgs).min(100);
                },
                enabled: rebirth.upgs.one.bought,
                description: "RP UPG 1"
            })),
            createMultiplicativeModifier(() => ({
                multiplier(): any {
                    return Decimal.max(rebirth.points.value, 0).add(1).log(3).add(1);
                },
                enabled: rebirth.upgs.nine.bought,
                description: "RP UPG 9"
            })),
            createMultiplicativeModifier(() => ({
                multiplier(): any {
                    return Decimal.max(srebirth.points.value, 0).add(1).pow(1.75);
                },
                enabled() {
                    return Decimal.gte(main.progression.value, 3.9);
                },
                description: "SRP Effect"
            }))
        ]),
        machine: {
            overall: {
                cash: createSequentialModifier(() => [
                    createMultiplicativeModifier(() => ({
                        multiplier() {
                            return effects.machine.cash.cash.apply(8);
                        },
                        enabled() {
                            return machine.value.includes(0);
                        },
                        description: "Cash Mode"
                    })),
                    createMultiplicativeModifier(() => ({
                        multiplier() {
                            return effects.machine.neut.cash.apply(3);
                        },
                        enabled() {
                            return machine.value.includes(1);
                        },
                        description: "Neutral Mode"
                    }))
                ]),
                rp: createSequentialModifier(() => [
                    createMultiplicativeModifier(() => ({
                        multiplier() {
                            return effects.machine.neut.rp.apply(2);
                        },
                        enabled() {
                            return machine.value.includes(1);
                        },
                        description: "Neutral Mode"
                    })),
                    createMultiplicativeModifier(() => ({
                        multiplier() {
                            return effects.machine.rp.rp.apply(4);
                        },
                        enabled() {
                            return machine.value.includes(2);
                        },
                        description: "Rebirth Mode"
                    }))
                ])
            },
            cash: {
                cash: createSequentialModifier(() => [
                    createMultiplicativeModifier(() => ({
                        multiplier: 2.25,
                        enabled: rebirth.upgs.eleven.bought,
                        description: "RP UPG 11"
                    }))
                ])
            },
            neut: {
                cash: createSequentialModifier(() => [
                    createMultiplicativeModifier(() => ({
                        multiplier: 1.5,
                        enabled: rebirth.upgs.eleven.bought,
                        description: "RP UPG 11"
                    }))
                ]),
                rp: createSequentialModifier(() => [
                    createMultiplicativeModifier(() => ({
                        multiplier: 1.5,
                        enabled: rebirth.upgs.eleven.bought,
                        description: "RP UPG 11"
                    }))
                ])
            },
            rp: {
                rp: createSequentialModifier(() => [
                    createMultiplicativeModifier(() => ({
                        multiplier: 2.25,
                        enabled: rebirth.upgs.eleven.bought,
                        description: "RP UPG 11"
                    }))
                ])
            }
        }
    };

    const machineAutos: any = {
        c: createClickable(() => ({
            onClick() {
                autoMachine.c.value = Decimal.lte(autoMachine.c.value, 0.5) ? 1 : 0;
            },
            canClick() {
                return Decimal.gte(main.progression.value, 2.9);
            },
            style() {
                return {
                    "min-height": "50px",
                    width: "50px",
                    "background-color": Decimal.gt(autoMachine.c.value, 0.5)
                        ? "var(--accent2)"
                        : "var(--danger)"
                };
            },
            visibility() {
                return Decimal.gte(main.progression.value, 2.9) ? 0 : 1;
            },
            display: {
                description: jsx(() => (
                    <>
                        AUTO
                        <br />
                        {Decimal.gt(autoMachine.c.value, 0.5) ? "ON" : "OFF"}
                    </>
                ))
            }
        })),
        n: createClickable(() => ({
            onClick() {
                autoMachine.n.value = Decimal.lte(autoMachine.n.value, 0.5) ? 1 : 0;
            },
            canClick() {
                return Decimal.gte(main.progression.value, 2.9);
            },
            style() {
                return {
                    "min-height": "50px",
                    width: "50px",
                    "background-color": Decimal.gt(autoMachine.n.value, 0.5)
                        ? "var(--accent2)"
                        : "var(--danger)"
                };
            },
            visibility() {
                return Decimal.gte(main.progression.value, 2.9) ? 0 : 1;
            },
            display: {
                description: jsx(() => (
                    <>
                        AUTO
                        <br />
                        {Decimal.gt(autoMachine.n.value, 0.5) ? "ON" : "OFF"}
                    </>
                ))
            }
        })),
        r: createClickable(() => ({
            onClick() {
                autoMachine.r.value = Decimal.lte(autoMachine.r.value, 0.5) ? 1 : 0;
            },
            canClick() {
                return Decimal.gte(main.progression.value, 2.9);
            },
            style() {
                return {
                    "min-height": "50px",
                    width: "50px",
                    "background-color": Decimal.gt(autoMachine.r.value, 0.5)
                        ? "var(--accent2)"
                        : "var(--danger)"
                };
            },
            visibility() {
                return Decimal.gte(main.progression.value, 2.9) ? 0 : 1;
            },
            display: {
                description: jsx(() => (
                    <>
                        AUTO
                        <br />
                        {Decimal.gt(autoMachine.r.value, 0.5) ? "ON" : "OFF"}
                    </>
                ))
            }
        }))
    };

    const machineClickables = {
        cash: createClickable(() => ({
            onClick() {
                if (machine.value.includes(0) === true) {
                    machine.value = machine.value.filter((n: number) => n !== 0);
                } else if (machine.value.length < machineUtils.maxModes.value) {
                    machine.value.push(0);
                }
            },
            canClick() {
                return machine.value.includes(0) === true
                    ? machineUtils.canDisable.value
                        ? machine.value.length <= machineUtils.maxModes.value
                        : false
                    : machine.value.length < machineUtils.maxModes.value;
            },
            display: jsx(() => (
                <>
                    <h2>{machine.value.includes(0) === true ? "Disable" : "Enable"}</h2>
                </>
            )),
            style: {
                "min-height": "50px"
            }
        })),
        neut: createClickable(() => ({
            onClick() {
                if (machine.value.includes(1) === true) {
                    machine.value = machine.value.filter((n: number) => n !== 1);
                } else if (machine.value.length < machineUtils.maxModes.value) {
                    machine.value.push(1);
                }
            },
            canClick() {
                return machine.value.includes(1) === true
                    ? machineUtils.canDisable.value
                        ? machine.value.length <= machineUtils.maxModes.value
                        : false
                    : machine.value.length < machineUtils.maxModes.value;
            },
            display: jsx(() => (
                <>
                    <h2>{machine.value.includes(1) === true ? "Disable" : "Enable"}</h2>
                </>
            )),
            style: {
                "min-height": "50px"
            }
        })),
        rp: createClickable(() => ({
            onClick() {
                if (machine.value.includes(2) === true) {
                    machine.value = machine.value.filter((n: number) => n !== 2);
                } else if (machine.value.length < machineUtils.maxModes.value) {
                    machine.value.push(2);
                }
            },
            canClick() {
                return machine.value.includes(2) === true
                    ? machineUtils.canDisable.value
                        ? machine.value.length <= machineUtils.maxModes.value
                        : false
                    : machine.value.length < machineUtils.maxModes.value;
            },
            display: jsx(() => (
                <>
                    <h2>{machine.value.includes(2) === true ? "Disable" : "Enable"}</h2>
                </>
            )),
            style: {
                "min-height": "50px"
            }
        }))
    };

    const tabs = createTabFamily(
        {
            cash: () => ({
                display: "Cash",
                glowColor: color,
                tab: createTab(() => ({
                    display: jsx(() => (
                        <>
                            <br />
                            You have <ResourceVue resource={points} color={color} /> Cash
                            {render(modals.cashGain)}
                            {Decimal.gt(pointGain.value, 0) ? (
                                <div>
                                    ({oomps.value})
                                    <Node id="oomps" />
                                </div>
                            ) : null}
                            <Spacer />
                            <Column>
                                {renderRow(upgs.one, upgs.two, upgs.three, upgs.four)}
                                {renderRow(upgs.five, upgs.six, upgs.seven, upgs.eight)}
                                {renderRow(upgs.nine, upgs.ten, upgs.eleven, upgs.twelve)}
                            </Column>
                        </>
                    ))
                }))
            }),
            machine: () => ({
                display: "Machine",
                glowColor: "#666",
                visibility() {
                    return Decimal.gte(main.progression.value, 1.9) ? 0 : 2;
                },
                tab: createTab(() => ({
                    display: jsx(() => (
                        <>
                            <br />
                            You have <ResourceVue resource={points} color={color} /> Cash
                            {render(modals.cashGain)}
                            {Decimal.gt(pointGain.value, 0) ? (
                                <div>
                                    ({oomps.value})
                                    <Node id="oomps" />
                                </div>
                            ) : null}
                            <Spacer />
                            <h2>The Machine</h2>
                            {render(modals.machine)}
                            <br />
                            <sup style="opacity: 0.5;">Currently {machineDisplay()}</sup>
                            <div style="background-color: rgba(102, 102, 102, 25%); width: 470px; min-height: 50px; border-radius: var(--border-radius); padding: 10px; border: 4px solid rgba(0, 0, 0, 0.25);">
                                <table>
                                    <tr>
                                        <td style="width: 270px;">
                                            <h3>Cash Mode</h3>
                                            {render(modals.machineC)}
                                            <br />
                                            <sup style="opacity: 0.5;">
                                                {machine.value.includes(0) === true
                                                    ? "Enabled"
                                                    : "Disabled"}
                                            </sup>
                                            <br />
                                            <h5>
                                                ×{format(effects.machine.cash.cash.apply(8))} Cash
                                            </h5>
                                            <br />
                                        </td>
                                        <td style="width: 150px;">
                                            {render(machineClickables.cash)}
                                        </td>
                                        <td style="width: 50px;">{render(machineAutos.c)}</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h3>Neutral Mode</h3>
                                            {render(modals.machineN)}
                                            <br />
                                            <sup style="opacity: 0.5;">
                                                {machine.value.includes(1) === true
                                                    ? "Enabled"
                                                    : "Disabled"}
                                            </sup>
                                            <br />
                                            <h5>
                                                ×{format(effects.machine.neut.cash.apply(3))} Cash,
                                                ×{format(effects.machine.neut.rp.apply(2))} RP
                                            </h5>
                                            <br />
                                        </td>
                                        <td>{render(machineClickables.neut)}</td>
                                        <td style="width: 50px;">{render(machineAutos.n)}</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h3>Rebirth Mode</h3>
                                            {render(modals.machineR)}
                                            <br />
                                            <sup style="opacity: 0.5;">
                                                {machine.value.includes(2) === true
                                                    ? "Enabled"
                                                    : "Disabled"}
                                            </sup>
                                            <br />
                                            <h5>×{format(effects.machine.rp.rp.apply(4))} RP</h5>
                                            <br />
                                        </td>
                                        <td>{render(machineClickables.rp)}</td>
                                        <td style="width: 50px;">{render(machineAutos.r)}</td>
                                    </tr>
                                </table>
                            </div>
                        </>
                    ))
                }))
            })
        },
        () => ({
            visibility: true
        })
    );

    const modals = {
        cashGain: createModifierModal("Cash", () => [
            {
                title: "Cash Gain",
                modifier: effects.cash,
                base() {
                    return upgs.one.bought.value === true ? 1 : 0;
                }
            }
        ]),
        machine: createModifierModal("The Machine", () => [
            {
                title: "Cash Bonus",
                modifier: effects.machine.overall.cash,
                base: 1
            },
            {
                title: "RP Bonus",
                modifier: effects.machine.overall.rp,
                base: 1
            }
        ]),
        machineC: createModifierModal("Cash Mode", () => [
            {
                title: "Cash Bonus",
                modifier: effects.machine.cash.cash,
                base: 8
            }
        ]),
        machineN: createModifierModal("Neutral Mode", () => [
            {
                title: "Cash Bonus",
                modifier: effects.machine.neut.cash,
                base: 3
            },
            {
                title: "RP Bonus",
                modifier: effects.machine.neut.rp,
                base: 2
            }
        ]),
        machineR: createModifierModal("Rebirth Mode", () => [
            {
                title: "RP Bonus",
                modifier: effects.machine.rp.rp,
                base: 4
            }
        ])
    };

    return {
        name,
        color,
        tooltip,
        display: jsx(() => (
            <>
                {Decimal.gte(main.progression.value, 1.9)
                    ? render(tabs)
                    : render(unref(tabs.tabs.cash.tab))}
            </>
        )),
        treeNode,
        points,
        best,
        tabs,
        total,
        pointGain,
        oomps,
        upgs,
        effects,
        reset,
        machine,
        machineClickables,
        machineUtils,
        minimizable: false,
        autoMachine,
        buys
    };
});

export default layer;
