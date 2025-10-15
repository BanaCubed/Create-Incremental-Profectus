import Spacer from "components/layout/Spacer.vue";
import { createLayerTreeNode, createResetButton, LayerTreeNode } from "data/common";
import {
    createResource,
    trackBest,
    trackOOMPS,
    trackTotal,
    Resource
} from "features/resources/resource";
import { createLayer, Layer } from "game/layers";
import { noPersist } from "game/persistence";
import Decimal, { DecimalSource, formatWhole } from "util/bignum";
import { Ref } from "vue";
import { JSX } from "vue/jsx-runtime";
import { addTooltip } from "wrappers/tooltips/tooltip";
import MainDisplay from "features/resources/MainDisplay.vue";
import cash from "../cash/cash";
import { Visibility } from "features/feature";
import { createCumulativeConversion } from "features/conversion";
import { main } from "data/projEntry";
import { render } from "util/vue";

// #region Interface
export interface LayerRebirth extends Layer {
    points: Resource<DecimalSource>;
    best: Ref<DecimalSource>;
    total: Ref<DecimalSource>;
    oomps: () => JSX.Element;
    treeNode: LayerTreeNode;
}
// #endregion Interface

// #region Layer
const color = "#ba0022";
const layer: LayerRebirth = createLayer("rebirth", () => {
    // #region Resources
    const points: Resource<DecimalSource> = createResource(0, "Rebirth Points", 0);
    const best: Ref<DecimalSource> = trackBest(points);
    const total: Ref<DecimalSource> = trackTotal(points);
    // #endregion Resources

    // #region Tree Node
    const treeNode = createLayerTreeNode(() => ({
        name: "R",
        layerID: "rebirth",
        color,
        append: false,
        display: (
            <>
                <img src="c_r.png" height="85" />
            </>
        ),
        visibility: () =>
            Decimal.gte(cash.buyables[3].amount.value, 1) ? Visibility.Visible : Visibility.None
    }));
    addTooltip(treeNode, () => ({
        display: () => <>{formatWhole(points.value)} Rebirth Points</>
    }));
    // #endregion Tree Node

    // #region Reset
    // #region Conversion
    const conversion = createCumulativeConversion(() => ({
        baseResource: noPersist(cash.points),
        gainResource: noPersist(points),
        formula: x => x.max(1).div(1e9).log(3)
    }));
    // #endregion Conversion

    // #region Reset Button
    const resetButton = createResetButton(() => ({
        conversion,
        treeNode,
        tree: main.tree
    }));
    // #endregion Reset Button

    // #region Actual Reset
    // #endregion Actual Reset
    // #endregion Reset

    // #region Return Object
    const oomps: () => JSX.Element = trackOOMPS(points);
    return {
        // #region Display Function
        display: () => (
            <>
                <MainDisplay resource={points} color={color} />
                {oomps()}
                <Spacer />
                {render(resetButton)}
                <Spacer />
                <div class="row" style="align-items: start;">
                    placeholder
                </div>
            </>
        ),
        // #endregion Display Function
        points,
        best,
        total,
        oomps,
        treeNode,
        color
    };
    // #endregion Return Object
});

export default layer;
// #endregion Layer
