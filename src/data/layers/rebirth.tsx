import Spacer from "components/layout/Spacer.vue";
import { createLayerTreeNode, LayerTreeNode } from "data/common";
import {
    createResource,
    trackBest,
    trackOOMPS,
    trackTotal,
    Resource
} from "features/resources/resource";
import { createLayer, Layer } from "game/layers";
import { persistent, Persistent } from "game/persistence";
import { DecimalSource, formatWhole } from "util/bignum";
import { Ref } from "vue";
import { JSX } from "vue/jsx-runtime";
import { addTooltip } from "wrappers/tooltips/tooltip";
import MainDisplay from "features/resources/MainDisplay.vue";

//#region Interface
export interface LayerRebirth extends Layer {
    points: Resource<DecimalSource>;
    best: Ref<DecimalSource>;
    total: Ref<DecimalSource>;
    pinned: Persistent<boolean>;
    oomps: () => JSX.Element;
    treeNode: LayerTreeNode;
}
//#endregion Interface

//#region Layer
const color = "#ba0022";
const layer: LayerRebirth = createLayer("rebirth", () => {
    //#region Resources
    const points: Resource<DecimalSource> = createResource(0, "Rebirth Points", 0);
    const best: Ref<DecimalSource> = trackBest(points);
    const total: Ref<DecimalSource> = trackTotal(points);
    const pinned: Persistent<boolean> = persistent(false);
    //#endregion Resources
    //#region Tree Node
    const treeNode = createLayerTreeNode(() => ({
        name: "RP",
        layerID: "rebirth",
        color,
        append: false,
        display: (
            <>
                <img src="c_r.png" height="85" />
            </>
        )
    }));
    addTooltip(treeNode, () => ({
        display: () => <>{formatWhole(points.value)} Rebirth Points</>
    }));
    //#endregion Tree Node
    //#region Return Object
    const oomps: () => JSX.Element = trackOOMPS(points);
    return {
        //#region Display Function
        display: () => (
            <>
                <MainDisplay resource={points} color={color} pin={pinned} />
                {oomps()}
                <Spacer />
                <div class="row" style="align-items: start;">
                    placeholder
                </div>
            </>
        ),
        //#endregion Display Function
        points,
        best,
        total,
        pinned,
        oomps,
        treeNode,
        color
    };
    //#endregion Return Object
});

export default layer;
//#endregion Layer
