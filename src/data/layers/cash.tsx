import Spacer from "components/layout/Spacer.vue";
import { createLayerTreeNode, LayerTreeNode } from "data/common";
import { createPylon, Pylon } from "features/clickables/pylon";
import { Upgrade } from "features/clickables/upgrade";
import {
    createResource,
    trackBest,
    trackOOMPS,
    trackTotal,
    Resource
} from "features/resources/resource";
import ResourceVue from "features/resources/Resource.vue";
import Formula from "game/formulas/formulas";
import { createLayer, Layer } from "game/layers";
import { createAdditiveModifier, createSequentialModifier, Modifier } from "game/modifiers";
import { noPersist } from "game/persistence";
import { createCostRequirement } from "game/requirements";
import { DecimalSource, formatWhole } from "util/bignum";
import { WithRequired } from "util/common";
import { renderRow } from "util/vue";
import { computed, ComputedRef, Ref } from "vue";
import { JSX } from "vue/jsx-runtime";
import { addTooltip } from "wrappers/tooltips/tooltip";

//#region Interface
export interface LayerCash extends Layer {
    points: Resource<DecimalSource>;
    best: Ref<DecimalSource>;
    total: Ref<DecimalSource>;
    oomps: () => JSX.Element;
    pointGain: ComputedRef<DecimalSource>;
    upgrades: Upgrade[];
    treeNode: LayerTreeNode;
    pylons: Pylon[];
}

const color = "#0b8000";
const layer: LayerCash = createLayer("cash", () => {
    //#endregion
    //#region Resources + Tree
    const points: Resource<DecimalSource> = createResource(10, "Cash", 0);
    const best: Ref<DecimalSource> = trackBest(points);
    const total: Ref<DecimalSource> = trackTotal(points);
    const oomps: () => JSX.Element = trackOOMPS(points);
    const treeNode = createLayerTreeNode(() => ({
        name: "$",
        layerID: "cash",
        color,
        display: () => <>$</>
    }));
    addTooltip(treeNode, () => ({
        display: () => <>{formatWhole(points.value)} Cash</>
    }));
    //#endregion
    //#region Point Gain
    const pointGainModifier: WithRequired<Modifier, "description"> = createSequentialModifier(
        () => [
            createAdditiveModifier(() => ({
                addend: 1,
                description: "Unknown Source",
                enabled() {
                    return upgrades[0].bought.value;
                }
            }))
        ]
    );
    const pointGain = computed(() => pointGainModifier.apply(0));
    //#endregion
    //#region Pylons
    const pylons: Pylon[] = [
        createPylon(() => ({
            requirements: createCostRequirement(() => ({
                resource: noPersist(points),
                cost: Formula.variable(pylons[0].amount).add(1).pow_base(10)
            })),
            gain: 1,
            target: noPersist(points),
            display: {
                title: () => <h3>Cash Pylon</h3>,
                description: () => (
                    <>
                        <i>Generates cash... Somehow...</i>
                    </>
                ),
                targetName: "Cash"
            }
        }))
    ];
    //#endregion
    //#region Upgrades
    const upgrades: Upgrade[] = [];
    //#endregion
    //#region Return Object
    return {
        display: () => (
            <>
                You have <ResourceVue resource={points} color={color} /> Cash
                <Spacer />
                {renderRow(...pylons)}
            </>
        ),
        points,
        best,
        total,
        oomps,
        pointGain,
        upgrades,
        treeNode,
        color,
        pylons
    };
});
//#endregion

export default layer;
