import { jsx } from "features/feature";
import type { GenericTree } from "features/trees/tree";
import { branchedResetPropagation, createTree } from "features/trees/tree";
import Node from "components/Node.vue";
import { createResource } from "features/resources/resource";
import type { BaseLayer, GenericLayer } from "game/layers";
import { createLayer } from "game/layers";
import type { Player } from "game/player";
import player from "game/player";
import Decimal, { format, formatTime } from "util/bignum";
import { render } from "util/vue";
import { computed } from "vue";
import rebirth from "./layers/rebirth";
import cash from "./layers/cash";
import { createHotkey } from "features/hotkey";
import ResourceVue from "features/resources/Resource.vue";
import srebirth from "./layers/super";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @hidden
 */
export const main: any = createLayer("main", function (this: BaseLayer) {
    const progression = createResource(0, "progress");

    const tree = createTree(() => ({
        nodes: [[cash.treeNode], [rebirth.treeNode], [srebirth.treeNode]],
        branches: [
            {
                startNode: rebirth.treeNode,
                endNode: cash.treeNode,
                visibility:
                    cash.upgs.eight.bought.value === true || Decimal.gte(progression.value, 0.9)
                        ? 1
                        : 0
            },
            {
                startNode: srebirth.treeNode,
                endNode: rebirth.treeNode,
                visibility:
                    rebirth.upgs.eleven.bought.value === true || Decimal.gte(progression.value, 3.9)
                        ? 1
                        : 0
            }
        ],
        resetPropagation: branchedResetPropagation
    })) as GenericTree;

    const hotkey = createHotkey(() => ({
        description: "Toggle Pause",
        key: "/",
        onPress() {
            player.devSpeed = player.devSpeed === 1 ? 0 : 1;
        }
    }));

    return {
        name: "Tree",
        links: tree.links,
        minimizable: true,
        display: jsx(() => (
            <>
                {player.devSpeed != null && player.devSpeed !== 0 && player.devSpeed !== 1 ? (
                    <div>
                        Dev Speed: {format(player.devSpeed)}x
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
                        ({cash.oomps.value})
                        <Node id="oomps" />
                    </div>
                ) : null}
                {render(tree)}
            </>
        )),
        tree,
        hotkey,
        progression
    };
});

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<GenericLayer> => [main, rebirth, cash, srebirth];

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
