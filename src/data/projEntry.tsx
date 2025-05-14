import type { Tree } from "features/trees/tree";
import { branchedResetPropagation, createTree } from "features/trees/tree";
import { createResource, Resource } from "../features/resources/resource";
import type { Layer } from "game/layers";
import { createLayer } from "game/layers";
import player, { Player } from "game/player";
import { DecimalSource } from "util/bignum";
import { computed } from "vue";
import cash from "./layers/cash";
import { createHotkey, Hotkey } from "features/hotkey";
import settings from "game/settings";
import { noPersist } from "game/persistence";
import { render } from "util/vue";

//#region Interface
export interface LayerMain extends Layer {
    progression: Resource<DecimalSource>;
    tree: Tree;
    hotkey: Hotkey;
    hotkeyEa: Hotkey;
    hotkeyEb: Hotkey;
}

/**
 * @hidden
 */
export const main: LayerMain = createLayer("main", () => {
    //#endregion
    //#region Resources + Tree
    const progression = createResource(0, "progress");
    // Note: Casting as generic tree to avoid recursive type definitions
    const tree = createTree(() => ({
        nodes: noPersist([[cash.treeNode]]),
        branches: [],
        resetPropagation: branchedResetPropagation
    })) as Tree;
    //#endregion
    //#region Hotkeys
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
    //#endregion
    //#region Return
    return {
        name: "Tree",
        links: tree.links,
        display: () => (
            <>
                <div>{render(tree)}</div>
            </>
        ),
        tree,
        hotkey,
        progression,
        hotkeyEa,
        hotkeyEb
    };
});
//#endregion

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<Layer> => [main, cash];

/**
 * A computed ref whose value is true whenever the game is over.
 */
export const hasWon = computed(() => {
    return false;
});

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
