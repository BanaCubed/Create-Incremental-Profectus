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
import { render, renderCol } from "util/vue";
import { createLayerTreeNode, createModifierModal } from "../common";
import { globalBus } from "game/events";
import Decimal, { format } from "util/bignum";
import { computed } from "vue";
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
import Row from "components/layout/Row.vue";
import rebirth from "./rebirth";
import { createTab } from "features/tabs/tab";
import { createTabFamily } from "features/tabs/tabFamily";
import { createClickable } from "features/clickables/clickable";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Util function for display of dynamic portion of subtitle for The Machine
 * @returns string, to be used in the subtitle
 */
function machineDisplay() {
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
            return n;
        })
    };

    const name = "Cash";
    const color = "#0b9000";

    const treeNode = createLayerTreeNode(() => ({
        layerID: "cash",
        color,
        reset,
        display: "$",
        append: true
    }));
    const tooltip = addTooltip(treeNode, {
        display: createResourceTooltip(points),
        pinnable: true
    });

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, any>[] => [
            upgs,
            effects,
            points,
            best,
            total,
            oomps,
            machine
        ]
    }));

    const upgs = {
        one: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 0
            })),
            display: {
                description: "Begin generating 1 cash/s",
                title: "The Start..."
            },
            classes: computed(() => {
                return {
                    cash: true,
                    right: true
                };
            })
        })),
        two: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 10
            })),
            display: {
                description: "Quadruple cash gain"
            },
            classes: computed(() => {
                return {
                    cash: true,
                    right: true,
                    left: true
                };
            })
        })),
        three: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 50
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
                    cash: true,
                    right: true,
                    left: true
                };
            })
        })),
        four: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 300
            })),
            display: {
                description: "Quadruple cash gain again"
            },
            classes: computed(() => {
                return {
                    cash: true,
                    left: true
                };
            })
        })),
        five: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 1600
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
                    cash: true,
                    right: true
                };
            })
        })),
        six: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 5500
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
                    cash: true,
                    right: true,
                    left: true
                };
            })
        })),
        seven: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 17000
            })),
            display: {
                description: "Raise previous boosts ^1.2"
            },
            classes: computed(() => {
                return {
                    cash: true,
                    right: true,
                    left: true
                };
            })
        })),
        eight: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 200000
            })),
            display: {
                description: "Unlock Rebirth",
                title: "Repitition"
            },
            classes: computed(() => {
                return {
                    cash: true,
                    right: true,
                    left: true
                };
            })
        })),
        nine: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 80e6
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
                    cash: true,
                    right: true
                };
            })
        })),
        ten: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 7e8
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
                    cash: true,
                    right: true,
                    left: true
                };
            })
        })),
        eleven: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 1e10
            })),
            display: {
                description: "Double RP gain"
            },
            visibility() {
                return rebirth.upgs.four.bought.value;
            },
            classes: computed(() => {
                return {
                    cash: true,
                    right: true,
                    left: true
                };
            })
        })),
        twelve: createUpgrade(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: 2.5e10
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
                    cash: true,
                    left: true
                };
            }),
            onPurchase() {
                main.progression.value = Decimal.max(main.progression.value, 2);
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
                    return upgs.eight.bought.value || Decimal.gte(main.progression.value, 0.9);
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
                    return Decimal.pow(2, upgs);
                },
                enabled: rebirth.upgs.one.bought,
                description: "RP UPG 1"
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
                cash: createSequentialModifier(() => [])
            },
            neut: {
                cash: createSequentialModifier(() => []),
                rp: createSequentialModifier(() => [])
            },
            rp: {
                rp: createSequentialModifier(() => [])
            }
        }
    };

    const machineClickables = {
        auto: {
            c: createClickable(() => ({
                onClick() {
                    main.autoMachine.c.value = main.autoMachine.c.value !== true;
                },
                canClick() {
                    return Decimal.gte(main.progression.value, 2.9);
                },
                style() {
                    return {
                        "min-height": "50px",
                        width: "50px",
                        "background-color":
                            main.autoMachine.c.value === true ? "var(--bought)" : "var(--danger)"
                    };
                },
                visibility() {
                    return Decimal.gte(main.progression.value, 2.9) ? 0 : 1;
                }
            })),
            n: createClickable(() => ({
                onClick() {
                    main.autoMachine.n.value = main.autoMachine.n.value !== true;
                },
                canClick() {
                    return Decimal.gte(main.progression.value, 2.9);
                },
                style() {
                    return {
                        "min-height": "50px",
                        width: "50px",
                        "background-color":
                            main.autoMachine.n.value === true ? "var(--bought)" : "var(--danger)"
                    };
                },
                visibility() {
                    return Decimal.gte(main.progression.value, 2.9) ? 0 : 1;
                }
            })),
            r: createClickable(() => ({
                onClick() {
                    main.autoMachine.r.value = main.autoMachine.r.value !== true;
                },
                canClick() {
                    return Decimal.gte(main.progression.value, 2.9);
                },
                style() {
                    return {
                        "min-height": "50px",
                        width: "50px",
                        "background-color":
                            main.autoMachine.r.value === true ? "var(--bought)" : "var(--danger)"
                    };
                },
                visibility() {
                    return Decimal.gte(main.progression.value, 2.9) ? 0 : 1;
                }
            }))
        },
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
                            <br></br>
                            You have <ResourceVue resource={points} color={color} /> Cash
                            {render(modals.cashGain)}
                            {Decimal.gt(pointGain.value, 0) ? (
                                <div>
                                    ({oomps.value})
                                    <Node id="oomps" />
                                </div>
                            ) : null}
                            <Spacer></Spacer>
                            <Row>
                                {renderCol(upgs.one, upgs.five, upgs.nine)}
                                {renderCol(upgs.two, upgs.six, upgs.ten)}
                                {renderCol(upgs.three, upgs.seven, upgs.eleven)}
                                {renderCol(upgs.four, upgs.eight, upgs.twelve)}
                            </Row>
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
                            <br></br>
                            You have <ResourceVue resource={points} color={color} /> Cash
                            {render(modals.cashGain)}
                            {Decimal.gt(pointGain.value, 0) ? (
                                <div>
                                    ({oomps.value})
                                    <Node id="oomps" />
                                </div>
                            ) : null}
                            <Spacer></Spacer>
                            <h2>The Machine</h2>
                            {render(modals.machine)}
                            <br></br>
                            <sup style="color: var(--highlighted)">
                                Currently {machineDisplay()}
                            </sup>
                            <div style="background-color: rgba(102, 102, 102, 25%); width: 470px; min-height: 50px; border-radius: var(--border-radius); padding: 10px; border: 4px solid rgba(0, 0, 0, 0.25);">
                                <table>
                                    <tr>
                                        <td style="width: 270px;">
                                            <h3>Cash Mode</h3>
                                            {render(modals.machineC)}
                                            <br />
                                            <sup style="color: var(--highlighted)">
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
                                        <td style="width: 50px;">
                                            {render(machineClickables.auto.c)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h3>Neutral Mode</h3>
                                            {render(modals.machineN)}
                                            <br />
                                            <sup style="color: var(--highlighted)">
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
                                        <td style="width: 50px;">
                                            {render(machineClickables.auto.n)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h3>Rebirth Mode</h3>
                                            {render(modals.machineR)}
                                            <br />
                                            <sup style="color: var(--highlighted)">
                                                {machine.value.includes(2) === true
                                                    ? "Enabled"
                                                    : "Disabled"}
                                            </sup>
                                            <br />
                                            <h5>×{format(effects.machine.rp.rp.apply(4))} RP</h5>
                                            <br />
                                        </td>
                                        <td>{render(machineClickables.rp)}</td>
                                        <td style="width: 50px;">
                                            {render(machineClickables.auto.r)}
                                        </td>
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
                {Decimal.gte(main.progression.value, 1.9) ? (
                    render(tabs)
                ) : (
                    <>
                        You have <ResourceVue resource={points} color={color} /> Cash
                        {render(modals.cashGain)}
                        {Decimal.gt(pointGain.value, 0) ? (
                            <div>
                                ({oomps.value})
                                <Node id="oomps" />
                            </div>
                        ) : null}
                        <Spacer></Spacer>
                        <Row>
                            {renderCol(upgs.one, upgs.five, upgs.nine)}
                            {renderCol(upgs.two, upgs.six, upgs.ten)}
                            {renderCol(upgs.three, upgs.seven, upgs.eleven)}
                            {renderCol(upgs.four, upgs.eight, upgs.twelve)}
                        </Row>
                    </>
                )}
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
        machineUtils
    };
});

export default layer;
