import type { Tree } from "features/trees/tree";
import { branchedResetPropagation, createTree } from "features/trees/tree";
import Node from "components/Node.vue";
import { createResource } from "../features/resources/resource";
import type { Layer } from "game/layers";
import { createLayer } from "game/layers";
import player, { Player } from "game/player";
import Decimal, { format, formatTime } from "util/bignum";
import { render } from "util/vue";
import { computed } from "vue";
import rebirth from "./layers/rebirth";
import cash from "./layers/cash";
import { createHotkey } from "features/hotkey";
import ResourceVue from "features/resources/Resource.vue";
import srebirth from "./layers/super";
import settings from "game/settings";
import { noPersist } from "game/persistence";

/* eslint @typescript-eslint/no-explicit-any: 0 */

/**
 * @hidden
 */
export const main: any = createLayer("main", () => {
    const progression = createResource(0, "progress");

    // Note: Casting as generic tree to avoid recursive type definitions
    const tree = createTree(() => ({
        nodes: [
            [noPersist(cash.treeNode)],
            [noPersist(rebirth.treeNode)],
            [noPersist(srebirth.treeNode)]
        ],
        branches: [
            {
                startNode: noPersist(rebirth.treeNode),
                endNode: noPersist(cash.treeNode),
                visibility:
                    cash.upgs.eight.bought.value === true || Decimal.gte(progression.value, 0.9)
                        ? 1
                        : 0
            },
            {
                startNode: noPersist(srebirth.treeNode),
                endNode: noPersist(rebirth.treeNode),
                visibility:
                    rebirth.upgs.eleven.bought.value === true || Decimal.gte(progression.value, 3.9)
                        ? 1
                        : 0
            }
        ],
        resetPropagation: branchedResetPropagation
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

    // Note: layers don't _need_ a reference to everything,
    //  but I'd recommend it over trying to remember what does and doesn't need to be included.
    // Officially all you need are anything with persistency or that you want to access elsewhere
    return {
        name: "Tree",
        links: tree.links,
        minimizable: true,
        display: () => (
            <>
                {player.devSpeed != null && player.devSpeed !== 0 && player.devSpeed !== 1 ? (
                    <div>
                        Dev Speed: {format(player.devSpeed)}&times;
                        <Node id="devspeed" />
                    </div>
                ) : player.devSpeed === 0 ? (
                    <div>
                        Game Paused
                        <Node id="paused" />
                    </div>
                ) : (
                    <br />
                )}
                {player.offlineTime != null && player.offlineTime !== 0 ? (
                    <div>
                        Offline Time: {formatTime(player.offlineTime)}
                        <Node id="offline" />
                    </div>
                ) : (
                    <br />
                )}
                You have <ResourceVue resource={cash.points} color={cash.color} /> Cash
                {Decimal.gt(cash.pointGain.value, 0) ? (
                    <div>
                        ({cash.oomps()})
                        <Node id="oomps" />
                    </div>
                ) : null}
                {render(tree)}
            </>
        ),
        tree,
        hotkey,
        progression,
        hotkeyEa,
        hotkeyEb
    };
});

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<Layer> => [main, rebirth, cash, srebirth];

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
