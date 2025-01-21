import type { Tree } from "features/trees/tree";
import { createTree, defaultResetPropagation } from "features/trees/tree";
import Node from "components/Node.vue";
import { createResource, Resource } from "../features/resources/resource";
import type { Layer } from "game/layers";
import { createLayer } from "game/layers";
import player, { Player } from "game/player";
import Decimal, { DecimalSource, formatWhole } from "util/bignum";
import { computed } from "vue";
import cash from "./layers/cash";
import { createHotkey, Hotkey } from "features/hotkey";
import ResourceVue from "features/resources/Resource.vue";
import settings from "game/settings";
import { noPersist } from "game/persistence";
import { render, renderRow } from "util/vue";
import { createUpgrade, Upgrade } from "features/clickables/upgrade";
import { createBooleanRequirement } from "game/requirements";
import rebirth from "./layers/rebirth";

/* eslint @typescript-eslint/no-explicit-any: 0 */

export interface LayerMain extends Layer {
    progression: Resource<DecimalSource>;
    tree: Tree;
    hotkey: Hotkey;
    hotkeyEa: Hotkey;
    hotkeyEb: Hotkey;
    upgrades: Upgrade[];
}

/**
 * @hidden
 */
export const main: LayerMain = createLayer("main", () => {
    const progression = createResource(0, "progress");

    // Note: Casting as generic tree to avoid recursive type definitions
    const tree = createTree(() => ({
        nodes: noPersist([[cash.treeNode], [rebirth.treeNode]]),
        branches: [
            {
                startNode: noPersist(rebirth.treeNode),
                endNode: noPersist(cash.treeNode)
            }
        ],
        resetPropagation: defaultResetPropagation
    })) as Tree;

    const hotkey = createHotkey(() => ({
        description: "Toggle Pause",
        key: "/",
        onPress() {
            player.devSpeed = (player.devSpeed ?? 1) <= 1e-3 ? 1 : 0;
        }
    }));

    const hotkeyEa = createHotkey(() => ({
        description: "Accelerate Time",
        key: "]",
        onPress() {
            player.devSpeed = (player.devSpeed ?? 1) * 1.5;
        },
        enabled() {
            return settings.e === true;
        }
    }));

    const hotkeyEb = createHotkey(() => ({
        description: "Decelerate Time",
        key: "[",
        onPress() {
            player.devSpeed = (player.devSpeed ?? 1) / 1.5;
        },
        enabled() {
            return settings.e === true;
        }
    }));

    const upgrades: Upgrade[] = [
        createUpgrade(() => ({
            // Cash
            requirements: createBooleanRequirement(() => true),
            classes() {
                return {
                    cash: true,
                    creation: true,
                    primaryCreation: !upgrades[0].bought.value
                };
            },
            display() {
                return (
                    <>
                        <h2>Create Cash</h2>
                        <br />
                        <i>It works as a starting point, but feels pretty meaningless</i>
                        <br />
                        <br />
                        Requires: Nothing
                    </>
                );
            }
        })),
        createUpgrade(() => ({
            // Rebirth
            requirements: createBooleanRequirement(() => Decimal.gte(cash.pointGain.value, 1e4)),
            classes() {
                return {
                    rebirth: true,
                    mystery: !upgrades[0].bought.value,
                    creation: true,
                    primaryCreation: !upgrades[1].bought.value && upgrades[0].bought.value
                };
            },
            display() {
                if (!upgrades[0].bought.value) {
                    return (
                        <>
                            <h2>???</h2>
                            <br />
                            <i>Keep playing to discover</i>
                        </>
                    );
                }
                return (
                    <>
                        <h2>Create Rebirth</h2>
                        <br />
                        <i>Wow, resetting for a boost, where have I seen that before</i>
                        <br />
                        <br />
                        Requires: {formatWhole(1e4)} Cash/s
                    </>
                );
            }
        })),
        createUpgrade(() => ({
            // Machine
            requirements: createBooleanRequirement(() => false),
            classes() {
                return {
                    rebirth: true,
                    mystery: !upgrades[1].bought.value,
                    creation: true,
                    primaryCreation: !upgrades[2].bought.value && upgrades[1].bought.value
                };
            },
            display() {
                if (!upgrades[1].bought.value) {
                    return (
                        <>
                            <h2>???</h2>
                            <br />
                            <i>Keep playing to discover</i>
                        </>
                    );
                }
                return (
                    <>
                        <h2>Create a Machine</h2>
                        <br />
                        <i>This one requires you to think - never done that before have you?</i>
                        <br />
                        <br />
                        Requires: {formatWhole(1e10)} Cash/s
                    </>
                );
            }
        })),
        createUpgrade(() => ({
            // Super Rebirth
            requirements: createBooleanRequirement(() => false),
            classes() {
                return {
                    super: true,
                    mystery: !upgrades[2].bought.value,
                    creation: true,
                    primaryCreation: !upgrades[3].bought.value && upgrades[2].bought.value
                };
            },
            display() {
                if (!upgrades[2].bought.value) {
                    return (
                        <>
                            <h2>???</h2>
                            <br />
                            <i>Keep playing to discover</i>
                        </>
                    );
                }
                return (
                    <>
                        <h2>Create Super Rebirth</h2>
                        <br />
                        <i>All that progress was for """nothing"""</i>
                        <br />
                        <br />
                        Requires: {formatWhole(1e30)} Cash/s
                    </>
                );
            }
        })),
        createUpgrade(() => ({
            // Power
            requirements: createBooleanRequirement(() => false),
            classes() {
                return {
                    super: true,
                    mystery: !upgrades[3].bought.value,
                    creation: true,
                    primaryCreation: !upgrades[4].bought.value && upgrades[3].bought.value
                };
            },
            display() {
                if (!upgrades[3].bought.value) {
                    return (
                        <>
                            <h2>???</h2>
                            <br />
                            <i>Keep playing to discover</i>
                        </>
                    );
                }
                return (
                    <>
                        <h2>Create Power</h2>
                        <br />
                        <i>Electricity, not corruption, important distinction</i>
                        <br />
                        <br />
                        Requires: {formatWhole(1e50)} Cash/s
                    </>
                );
            }
        })),
        createUpgrade(() => ({
            // Hyper Rebirth
            requirements: createBooleanRequirement(() => false),
            classes() {
                return {
                    hyper: true,
                    mystery: !upgrades[4].bought.value,
                    creation: true,
                    primaryCreation: !upgrades[5].bought.value && upgrades[4].bought.value
                };
            },
            display() {
                if (!upgrades[4].bought.value) {
                    return (
                        <>
                            <h2>???</h2>
                            <br />
                            <i>Keep playing to discover</i>
                        </>
                    );
                }
                return (
                    <>
                        <h2>Create Hyper Rebirth</h2>
                        <br />
                        <i>This naming scheme is starting to get a bit boring</i>
                        <br />
                        <br />
                        Requires: {formatWhole(1e100)} Cash/s
                    </>
                );
            }
        })),
        createUpgrade(() => ({
            // Matter & Friends
            requirements: createBooleanRequirement(() => false),
            classes() {
                return {
                    hyper: true,
                    mystery: !upgrades[5].bought.value,
                    creation: true,
                    primaryCreation: !upgrades[6].bought.value && upgrades[5].bought.value
                };
            },
            display() {
                if (!upgrades[5].bought.value) {
                    return (
                        <>
                            <h2>???</h2>
                            <br />
                            <i>Keep playing to discover</i>
                        </>
                    );
                }
                return (
                    <>
                        <h2>Create Matter&nbsp;</h2>
                        <i>& friends</i>
                        <br />
                        <i>This should have come first</i>
                        <br />
                        <br />
                        Requires: {formatWhole(1e150)} Cash/s
                    </>
                );
            }
        })),
        createUpgrade(() => ({
            // Universes
            requirements: createBooleanRequirement(() => false),
            classes() {
                return {
                    hyper: true,
                    mystery: !upgrades[6].bought.value,
                    creation: true,
                    primaryCreation: !upgrades[7].bought.value && upgrades[6].bought.value
                };
            },
            display() {
                if (!upgrades[6].bought.value) {
                    return (
                        <>
                            <h2>???</h2>
                            <br />
                            <i>Keep playing to discover</i>
                        </>
                    );
                }
                return (
                    <>
                        <h2>Create Universes</h2>
                        <br />
                        <i>The first actually quantifiable feature</i>
                        <br />
                        <br />
                        Requires: {formatWhole("1e1000")} Cash/s
                    </>
                );
            }
        }))
    ];

    const creationOffset = computed(() => {
        let count = 0;
        if (upgrades[0].bought.value) count++;
        if (upgrades[1].bought.value) count++;
        if (upgrades[2].bought.value) count++;
        if (upgrades[3].bought.value) count++;
        if (upgrades[4].bought.value) count++;
        if (upgrades[5].bought.value) count++;
        if (upgrades[6].bought.value) count++;
        if (upgrades[7].bought.value) count++;
        // if (upgrades[8].bought.value) count++;
        return count;
    });

    // Note: layers don't _need_ a reference to everything,
    //  but I'd recommend it over trying to remember what does and doesn't need to be included.
    // Officially all you need are anything with persistency or that you want to access elsewhere
    return {
        name: "Tree",
        links: tree.links,
        minimizable: true,
        display: () => (
            <>
                <div class="creationBox">
                    <div
                        style={{
                            translate: `${515 - 150 * creationOffset.value}px 0`,
                            "z-index": "-1"
                        }}
                    >
                        {renderRow(
                            upgrades[0],
                            upgrades[1],
                            upgrades[2],
                            upgrades[3],
                            upgrades[4],
                            upgrades[5],
                            upgrades[6],
                            upgrades[7],
                            upgrades[8]
                        )}
                    </div>
                </div>
                {upgrades[0].bought.value ? (
                    <div style="margin-top: -150px;">
                        You have <ResourceVue resource={cash.points} color={"#0b9000"} /> Cash
                        {Decimal.gt(cash.pointGain.value, 0) ? (
                            <div>
                                ({cash.oomps()})
                                <Node id="oomps" />
                            </div>
                        ) : (
                            <>
                                <br />
                            </>
                        )}
                        {render(tree)}
                    </div>
                ) : null}
            </>
        ),
        tree,
        hotkey,
        progression,
        hotkeyEa,
        hotkeyEb,
        upgrades
    };
});

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<Layer> => [main, cash, rebirth];

/**
 * A computed ref whose value is true whenever the game is over.
 */
export const hasWon = computed(() => {
    return false;
});

/**
 * Given a player save data object being loaded with a different version, update the save data object to match the structure of the current version.
 * @param oldVersion The version of the save being loaded in
 * @param player The save data being loaded in
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<Player>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */
