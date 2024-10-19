/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion } from "features/conversion";
import { jsx } from "features/feature";
import { createHotkey } from "features/hotkey";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource, trackOOMPS } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { BaseLayer, createLayer } from "game/layers";
import type { DecimalSource } from "util/bignum";
import { render } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../common";
import cash from "./cash"
import { NonPersistent, noPersist, PersistentState } from "game/persistence";
import Decimal, { format, formatWhole } from "util/bignum";
import { createSequentialModifier, createAdditiveModifier, createMultiplicativeModifier, createExponentialModifier } from "game/modifiers";
import { computed } from "vue";
import ResourceVue from "features/resources/Resource.vue";
import Spacer from "components/layout/Spacer.vue";

const id = "rebirth";
const layer = createLayer(id, function (this: BaseLayer) {
    const name = "Rebirth";
    const color = "#e60039";
    const points = createResource<DecimalSource>(0, "RP");
    const oomps = trackOOMPS(points)

    const pointGain = computed(() => {
        // eslint-disable-next-line prefer-const
        let gain = effects.rp.apply(1);
        return gain;
    });

    const conversion = createCumulativeConversion(() => ({
        formula: x => x.div(100000).sqrt().mul(pointGain),
        baseResource: cash.points,
        gainResource: noPersist(points),
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, any>[] => [layer]
    }));

    const effects = {
        rp: createSequentialModifier(() => [
            createAdditiveModifier(() => ({
                addend: 0,
                description: "huh",
                enabled: false,
            }))
        ]),
        rpCash: createSequentialModifier(() => [
            createMultiplicativeModifier(() => ({
                multiplier() { return Decimal.max(points.value, 0).add(1).log(10).add(1).pow(2) },
                description: "Initial Amount"
            }))
        ])
    }

    const treeNode = createLayerTreeNode(() => ({
        layerID: 'rebirth',
        color,
        reset,
        display: 'R',
        append: false,
        visibility() { return (cash.upgs.eight.bought.value || Decimal.gte(main.progression.value, 0.9))?0:2 }
    }));
    const tooltip = addTooltip(treeNode, {
        display: createResourceTooltip(points),
        pinnable: true
    });

    const resetButton = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode,
        display: jsx(() => (
            <>
            {
                cash.upgs.eight.bought.value ? (Decimal.gte(cash.points.value, 100000) ? `Rebirth for ${formatWhole(conversion.actualGain.value)} RP
                Next at ${formatWhole(conversion.nextAt.value)} cash` : `Reach ${formatWhole(conversion.nextAt.value)} cash to Rebirth`) : "Purchase Cash UPG 8 \"Repitition\" to Rebirth"
            }
            </>
        )),
        onClick() {
            main.progression.value = Decimal.max(main.progression.value, 1)
        },
        canClick(): boolean {
            return (Decimal.gte(conversion.actualGain.value, 1) && cash.upgs.eight.bought.value)
        }
    }));

    const hotkey = createHotkey(() => ({
        description: "Rebirth for RP",
        key: "r",
        onPress: resetButton.onClick,
        enabled() {
            return false
        },
    }));

    return {
        name,
        color,
        points,
        tooltip,
        effects,
        display: jsx(() => (
            <>
                You have <ResourceVue resource={points} color={color} /> RP,<br></br>multiplying cash gain by x{format(Decimal.max(points.value, 0).add(1).log(10).add(1).pow(2))}
                {Decimal.gt(pointGain.value, '1e1000') ? (
                    <div>
                        ({oomps.value})
                    </div>
                ) : null}
                <Spacer></Spacer>
                {render(resetButton)}
            </>
        )),
        treeNode,
        hotkey
    };
});

export default layer;
