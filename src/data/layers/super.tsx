/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion } from "features/conversion";
import { createHotkey } from "features/hotkey";
import { createReset } from "features/reset";
import { createResource, trackBest, trackOOMPS } from "features/resources/resource";
import { addTooltip } from "wrappers/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { createLayer } from "game/layers";
import type { DecimalSource } from "util/bignum";
import { render } from "util/vue";
import { createCollapsibleAchievements, createLayerTreeNode, createResetButton } from "../common";
import { noPersist } from "game/persistence";
import Decimal, { format, formatWhole } from "util/bignum";
import { computed, unref } from "vue";
import ResourceVue from "features/resources/Resource.vue";
import Spacer from "components/layout/Spacer.vue";
import { createBooleanRequirement } from "game/requirements";
import settings from "game/settings";
import rebirth from "./rebirth";
import { createAchievement } from "features/achievements/achievement";
import { setupAutoPurchase } from "features/clickables/upgrade";

/* eslint @typescript-eslint/no-explicit-any: 0 */

const id = "super";
const layer: any = createLayer(id, () => {
    const name = "Super";
    const color = "#d65029";
    const points = createResource<DecimalSource>(0, "SRP", 0, false);
    const oomps = trackOOMPS(points);
    const best = trackBest(points);

    const pointGain = computed(() => {
        // eslint-disable-next-line prefer-const
        let gain = Decimal.dOne;
        return gain;
    });

    const conversion = createCumulativeConversion(() => ({
        formula: x => x.div(1e14).log(100).pow(2.4).mul(pointGain),
        baseResource: rebirth.points,
        gainResource: noPersist(points)
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, any>[] => [layer]
    }));

    const effects = {};

    setupAutoPurchase(rebirth, () => {
        return achs.one.earned.value === true;
    }, [rebirth.upgs.one]);
    setupAutoPurchase(rebirth, () => {
        return achs.two.earned.value === true;
    }, [rebirth.upgs.two]);
    setupAutoPurchase(rebirth, () => {
        return achs.three.earned.value === true;
    }, [rebirth.upgs.three]);

    const achs = {
        one: createAchievement(() => ({
            display: {
                effectDisplay:
                    "Automate an RP upgrade for each SRP milestone, and pre-SR upgrades no longer spend currencies",
                requirement: "1 SRP"
            },
            requirements: [
                createBooleanRequirement(() => {
                    return Decimal.gte(points.value, 1);
                })
            ]
        })),
        two: createAchievement(() => ({
            display: {
                effectDisplay: "RP buyables no longer spend RP",
                requirement: "3 SRP"
            },
            requirements: [
                createBooleanRequirement(() => {
                    return Decimal.gte(points.value, 3);
                })
            ]
        })),
        three: createAchievement(() => ({
            display: {
                effectDisplay:
                    "Cash upgrades are no longer reset on Rebirth, keep a Cash Upgrade on SR per SRP milestone, and keep one RP upgrade per milestone after this one",
                requirement: "10 SRP"
            },
            requirements: [
                createBooleanRequirement(() => {
                    return Decimal.gte(points.value, 10);
                })
            ],
            visibility(): any {
                return achs.one.earned.value === true;
            }
        })),
        four: createAchievement(() => ({
            display: {
                effectDisplay:
                    "Unlock a Cash Buyable, and automate an RP buyable for each milestone after this one",
                requirement: "25 SRP"
            },
            requirements: [
                createBooleanRequirement(() => {
                    return Decimal.gte(points.value, 25);
                })
            ],
            visibility(): any {
                return achs.two.earned.value === true;
            }
        })),
        five: createAchievement(() => ({
            display: {
                effectDisplay: "Unlock the first SR challenge",
                requirement: "50 SRP"
            },
            requirements: [
                createBooleanRequirement(() => {
                    return Decimal.gte(points.value, 50);
                })
            ],
            onComplete() {
                main.progression.value = Decimal.max(main.progression.value, 5);
            },
            visibility(): any {
                return achs.three.earned.value === true;
            }
        }))
    };

    const treeNode = createLayerTreeNode(() => ({
        layerID: "super",
        color,
        reset,
        display: "SR",
        append: computed(() => {
            return unref(settings.appendLayers);
        }),
        visibility() {
            return rebirth.upgs.eleven.bought.value === true ||
                Decimal.gte(main.progression.value, 3.9)
                ? 0
                : 2;
        }
    }));
    const tooltip = addTooltip(treeNode, () => ({
        display: createResourceTooltip(points),
        pinnable: true
    }));

    const resetButton = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode,
        display: () => (
            <>
                {rebirth.upgs.eleven.bought.value === true
                    ? Decimal.gte(rebirth.points.value, 1e16)
                        ? `Super Rebirth for ${formatWhole(unref(conversion.actualGain))} SRP` +
                          (Decimal.gte(unref(conversion.actualGain), 1e3)
                              ? ""
                              : `, next at ${formatWhole(unref(conversion.nextAt))} RP`)
                        : `Reach ${formatWhole(1e16)} cash to Super Rebirth`
                    : 'Purchase RP UPG 11 "Continuity" to Super Rebirth'}
            </>
        ),
        onClick() {
            main.progression.value = Decimal.max(main.progression.value, 4);
        },
        canClick(): boolean {
            return Decimal.gte(unref(conversion.actualGain), 1) && rebirth.upgs.eleven.bought.value;
        },
        classes: computed(() => {
            return {
                super: true,
                halfwide: true
            };
        })
    }));

    const hotkey = createHotkey(() => ({
        description: "Super Rebirth",
        key: "s",
        onPress() {
            resetButton.onClick?.();
        },
        enabled() {
            return Decimal.gte(main.progression.value, 3.9);
        }
    }));

    const achDisp = createCollapsibleAchievements(achs);

    return {
        name,
        color,
        points,
        tooltip,
        effects,
        display: () => (
            <>
                <br />
                You have <ResourceVue resource={points} color={color} /> SRP, multiplying:
                <br /> Cash gain ×{format(Decimal.max(points.value, 0).add(1).pow(1.75))}
                <br />
                RP gain ×{format(Decimal.max(points.value, 0).add(1).pow(1.25))}
                {Decimal.gt(pointGain.value, "1e1000") ? <div>({oomps.value})</div> : null}
                <Spacer />
                {render(resetButton)}
                <Spacer />
                {render(unref(achDisp.display))}
            </>
        ),
        treeNode,
        hotkey,
        minimizable: false,
        achs,
        best,
        achDisp
    };
});

export default layer;
