import Spacer from "components/layout/Spacer.vue";
import { createLayerTreeNode, LayerTreeNode } from "data/common";
import { createPylon, Pylon } from "create-addons/features/pylon";
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
import { noPersist } from "game/persistence";
import { createCostRequirement } from "game/requirements";
import { DecimalSource, formatWhole } from "util/bignum";
import { renderRow } from "util/vue";
import { Ref } from "vue";
import { JSX } from "vue/jsx-runtime";
import { addTooltip } from "wrappers/tooltips/tooltip";

//#region Interface
export interface LayerCash extends Layer {
    points: Resource<DecimalSource>;
    best: Ref<DecimalSource>;
    total: Ref<DecimalSource>;
    oomps: () => JSX.Element;
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
    const treeNode = createLayerTreeNode(() => ({
        name: "$",
        layerID: "cash",
        color,
        display: () => <>$</>,
        append: false
    }));
    addTooltip(treeNode, () => ({
        display: () => <>{formatWhole(points.value)} Cash</>
    }));
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
    const oomps: () => JSX.Element = trackOOMPS(points, pylons[0].effect);
    return {
        display: () => (
            <>
                You have <ResourceVue resource={points} color={color} /> Cash
                <br />
                {oomps()}
                <Spacer />
                {renderRow(...pylons)}
            </>
        ),
        points,
        best,
        total,
        oomps,
        upgrades,
        treeNode,
        color,
        pylons
    };
});
//#endregion

export default layer;
