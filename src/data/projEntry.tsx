import { jsx } from "features/feature";
import { createResource } from "features/resources/resource";
import type { GenericTree } from "features/trees/tree";
import { branchedResetPropagation, createTree } from "features/trees/tree";
import type { BaseLayer, GenericLayer } from "game/layers";
import { createLayer } from "game/layers";
import type { Player } from "game/player";
import player from "game/player";
import Decimal, {  } from "util/bignum";
import { render } from "util/vue";
import { computed } from "vue";
import rebirth from "./layers/rebirth";
import cash from "./layers/cash";
import { createTab } from "features/tabs/tab";
import { createTabFamily } from "features/tabs/tabFamily";
import { createHotkey } from "features/hotkey";
import { createReset } from "features/reset";
import { createCollapsibleModifierSections } from "./common";
import ResourceVue from "features/resources/Resource.vue";

/**
 * @hidden
 */
export const main: any = createLayer("main", function (this: BaseLayer) {
    const progression = createResource(0, 'progress')
    

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, any>[] => []
    }));

    const tree = createTree(() => ({
        nodes: [[cash.treeNode], [rebirth.treeNode]],
        branches: [{
            startNode: rebirth.treeNode,
            endNode: cash.treeNode,
            visibility: (cash.upgs.eight.bought.value || Decimal.gte(progression.value, 0.9))?1:0
        }],
        resetPropagation: branchedResetPropagation
    })) as GenericTree;

    const tabs = createTabFamily({
        tree: () => ({
            display: "Primary",
            tab: createTab(() => ({
                display: jsx(() => (
                    <>
                        <span></span>
                        {render(gameTabs)}
                    </>
                ))
            }))
        }),
        breakdown: () => ({
            display: "Breakdowns",
            tab: createTab(() => ({
                display: breakdowns
            }))
        }),
        currencies: () => ({
            display: "Currencies",
            tab: createTab(() => ({
                display: jsx(() => (
                    <>
                        {Decimal.gte(progression.value, -0.1) ? (<span>You have <ResourceVue resource={cash.points} color={cash.color}></ResourceVue> Cash</span>) : null}
                        {Decimal.gte(progression.value, 0.9) ? (<span><br></br>You have <ResourceVue resource={rebirth.points} color={rebirth.color}></ResourceVue> RP</span>) : null}
                    </>
                ))
            }))
        }),
    }, () => ({
        visibility: true
    }))

    const gameTabs = createTabFamily({
        cash: () => ({
            display: "Cash",
            glowColor: cash.color,
            tab: createTab(() => ({
                display: cash.display
            }))
        }),
        rebirth: () => ({
            display: "Rebirth",
            glowColor: rebirth.color,
            tab: createTab(() => ({
                display: rebirth.display
            })),
            visibility() { return (cash.upgs.eight.bought.value || Decimal.gte(main.progression.value, 0.9))?0:2 }
        }),
    }, () => ({
        visibility: true
    }))

    const [breakdowns, breakdownInfo] = createCollapsibleModifierSections(() => [
        {
            title: "Cash Gain",
            modifier: cash.effects.cash,
            base() { return cash.upgs.one.bought.value?1:0 },
            unit: "/s",
        }, {
            title: "RP Gain",
            modifier: rebirth.effects.rp,
            base() { return Decimal.div(cash.points.value, 100000).sqrt() },
            visible: cash.upgs.eight.bought.value||Decimal.gte(progression.value, 0.9),
            unit: " RP",
            subtitle: 'Amount on Reset',
            baseText: 'Amount from Cash',
        }, 
    ])

    const hotkey = createHotkey(() => ({
        description: "Toggle Pause",
        key: "/",
        onPress() {
            player.devSpeed = (player.devSpeed===1?0:1)
        },
    }));

    return {
        name: "Misc",
        links: tree.links,
        minimizable: false,
        display: jsx(() => (
            <>
                {render(tabs)}
            </>
        )),
        tree,
        tabs,
        breakdowns,
        hotkey,
        progression,
        breakdownInfo,
        gameTabs
    };
});

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<GenericLayer> => [main, rebirth, cash];

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
