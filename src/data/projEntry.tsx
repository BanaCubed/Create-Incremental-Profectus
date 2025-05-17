import type { Tree } from "features/trees/tree";
import { branchedResetPropagation, createTree } from "features/trees/tree";
import { createResource, Resource } from "../features/resources/resource";
import type { Layer } from "game/layers";
import { createLayer } from "game/layers";
import player, { Player } from "game/player";
import { DecimalSource } from "util/bignum";
import { computed, unref } from "vue";
import cash from "./layers/cash";
import { createHotkey, Hotkey } from "features/hotkey";
import settings from "game/settings";
import { noPersist } from "game/persistence";
import { render } from "util/vue";
import Spacer from "components/layout/Spacer.vue";
import MainDisplay from "features/resources/MainDisplay.vue";
import rebirth from "./layers/rebirth";

//#region Interface
export interface LayerMain extends Layer {
    progression: Resource<DecimalSource>;
    tree: Tree;
    hotkey: Hotkey;
    hotkeyEa: Hotkey;
    hotkeyEb: Hotkey;
}
//#endregion Interface

//#region Layer
/**
 * @hidden
 */
export const main: LayerMain = createLayer("main", () => {
    //#region Resources
    const progression = createResource<DecimalSource>(0, "progress");
    //#endregion Resources
    //#region Tree
    // Note: Casting as generic tree to avoid recursive type definitions
    const tree = createTree(() => ({
        nodes: noPersist([[cash.treeNode], [rebirth.treeNode]]),
        branches: [],
        resetPropagation: branchedResetPropagation
    })) as Tree;
    //#endregion Tree
    //#region Hotkeys
    // I've tried renaming the hotkeys but that causes and error for some reason.
    // If someone could submit a MR that renames these to more descriptive names that would be nice
    //#region Pause Hotkey
    const hotkey = createHotkey(() => ({
        description: "Toggle Pause",
        key: "/",
        onPress() {
            player.devSpeed = (player.devSpeed ?? 1) <= 1e-3 ? 1 : 0;
        }
    }));
    //#endregion Pause Hotkey
    //#region Accelerate Hotkey
    const hotkeyEa = createHotkey(() => ({
        description: "Accelerate Time",
        key: "]",
        onPress() {
            player.devSpeed = (player.devSpeed ?? 1) * 1.5;
        },
        enabled: () => settings.e === true
    }));
    //#endregion Accelerate Hotkey
    //#region Deccelerate Hotkey
    const hotkeyEb = createHotkey(() => ({
        description: "Decelerate Time",
        key: "[",
        onPress() {
            player.devSpeed = (player.devSpeed ?? 1) / 1.5;
        },
        enabled: () => settings.e === true
    }));
    //#endregion Deccelerate Hotkey
    //#endregion Hotkeys
    //#region Return Object
    return {
        name: "Tree",
        links: tree.links,
        display: () => (
            <>
                <div class="pin-trans">
                    {/* <TransitionGroup name="pins"> */}
                    {cash.pinned.value === true ? (
                        <>
                            <div key="0">
                                <MainDisplay resource={cash.points} color={unref(cash.color)} />
                                {cash.oomps()}
                            </div>
                        </>
                    ) : null}
                    {rebirth.pinned.value === true ? (
                        <>
                            <div key="1">
                                <MainDisplay
                                    resource={rebirth.points}
                                    color={unref(rebirth.color)}
                                />
                                {rebirth.oomps()}
                            </div>
                        </>
                    ) : null}
                    {/* </TransitionGroup> */}
                </div>
                <Spacer />
                {render(tree)}
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
    //#endregion Object
});
//#endregion Layer

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
