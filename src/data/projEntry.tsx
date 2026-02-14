import type { Tree } from "features/trees/tree";
import { branchedResetPropagation, createTree, TreeBranch } from "features/trees/tree";
import type { Layer } from "game/layers";
import { createLayer } from "game/layers";
import player, { Player } from "game/player";
import { computed } from "vue";
import cash from "./layers/cash/cash";
import { createHotkey, Hotkey } from "features/hotkey";
import settings from "game/settings";
import { noPersist, Persistent, persistent } from "game/persistence";
import rebirth from "./layers/rebirth/rebirth";
import { createTabFamily, TabFamily } from "features/tabs/tabFamily";
import { createTab } from "features/tabs/tab";
import Behaviour from "components/options/Behaviour.vue";
import Saves from "components/options/Saves.vue";
import Options from "components/modals/Options.vue";

// #region Interface
export interface LayerMain extends Layer {
    progression: Persistent<number>;
    tree: Tree;
    hotkey: Hotkey;
    hotkeyEa: Hotkey;
    hotkeyEb: Hotkey;
}
// #endregion Interface

// #region Layer
/**
 * @hidden
 */
export const main: LayerMain = createLayer("main", () => {
    // #region Resources
    const progression = persistent<number>(0);
    // #endregion Resources

    // #region Tree
    // Note: Casting as generic tree to avoid recursive type definitions
    const tree = createTree(() => ({
        nodes: noPersist([[cash.treeNode], [rebirth.treeNode]]),
        branches: noPersist<TreeBranch[]>([
            {
                startNode: rebirth.treeNode,
                endNode: cash.treeNode
            }
        ]),
        resetPropagation: branchedResetPropagation
    })) as Tree;
    // #endregion Tree

    // #region Hotkeys
    // I've tried renaming the hotkey constants but that causes and error for some reason.
    // If someone could submit a PR that renames these to more descriptive names that would be nice

    // #region Pause Hotkey
    const hotkey = createHotkey(() => ({
        description: "Toggle Pause",
        key: "/",
        onPress() {
            player.devSpeed = (player.devSpeed ?? 1) <= 1e-3 ? 1 : 0;
        }
    }));
    // #endregion Pause Hotkey

    // #region Accelerate Hotkey
    const hotkeyEa = createHotkey(() => ({
        description: "Accelerate Time",
        key: "]",
        onPress() {
            player.devSpeed = (player.devSpeed ?? 1) * 1.5;
        },
        enabled: () => settings.e === true
    }));
    // #endregion Accelerate Hotkey

    // #region Deccelerate Hotkey
    const hotkeyEb = createHotkey(() => ({
        description: "Decelerate Time",
        key: "[",
        onPress() {
            player.devSpeed = (player.devSpeed ?? 1) / 1.5;
        },
        enabled: () => settings.e === true
    }));
    // #endregion Deccelerate Hotkey
    // #endregion Hotkeys

    // #region Return Object
    return {
        name: "Tree",
        links: tree.links,
        display: () => (
            <>
                <div style="max-width: 720px;">
                    This tab exists purely for debugging purposes.
                    <br />
                </div>
            </>
        ),
        tree,
        hotkey,
        progression,
        hotkeyEa,
        hotkeyEb,
        classes: {
            treeTab: true
        }
    };
    // #endregion Object
});
// #endregion Layer

// #region Settings Layer
// It's not worth it to make an interface for this layer's type
export const settingsLayer: Layer = createLayer("settings", () => {
    const tabFamily: TabFamily = createTabFamily({
        behaviour: () => ({
            tab: createTab(() => ({
                display: (
                    <>
                        <Behaviour />
                    </>
                )
            })),
            display: () => <>Behaviour</>
        }),
        save: () => ({
            tab: createTab(() => ({
                display: (
                    <>
                        <Saves />
                    </>
                )
            })),
            display: <>Save</>
        }),
        appearance: () => ({
            tab: createTab(() => ({
                display: <>Visual settings go here</>
            })),
            display: <>Visual</>
        })
    });

    return {
        color: "ffffff",
        display: () => <Options />,
        tabFamily
    };
});
// #endregion Settings Layer

// #region Misc
// #region Initial Layers
/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<Layer> => [main, cash, rebirth, settingsLayer];
// #endregion Initial Layers

// #region Win Condition
/**
 * A computed ref whose value is true whenever the game is over.
 */
export const hasWon = computed(() => {
    return false;
});
// #endregion Win Condition

// #region Fix Save
/**
 * Given a player save data object being loaded with a different version,
 * update the save data object to match the structure of the current version.
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
// #endregion Fix Save
// #endregion Misc
