<template>
    <div
        v-if="isVisible(visibility)"
        :style="{ visibility: isHidden(visibility) ? 'hidden' : undefined }"
        :class="{
            treeNode: true,
            can: unref(canClick),
            ...unref(classes)
        }"
        @click="onClick"
        @mousedown="start"
        @mouseleave="stop"
        @mouseup="stop"
        @touchstart.passive="start"
        @touchend.passive="stop"
        @touchcancel.passive="stop"
    >
        <div
            :style="[
                {
                    backgroundColor: unref(color),
                    boxShadow: `-4px -4px 4px rgba(0, 0, 0, 0.25) inset, 0 0 20px ${unref(
                        glowColor
                    )}`
                },
                unref(style) ?? []
            ]"
        >
            <component :is="unref(comp)" />
        </div>
        <MarkNode :mark="unref(mark)" />
        <Node :id="id" />
    </div>
</template>

<script lang="ts">
import MarkNode from "components/MarkNode.vue";
import Node from "components/Node.vue";
import type { CoercableComponent, StyleValue } from "features/feature";
import { isHidden, isVisible, Visibility } from "features/feature";
import {
    computeOptionalComponent,
    isCoercableComponent,
    processedPropType,
    setupHoldToClick
} from "util/vue";
import type { PropType } from "vue";
import { defineComponent, toRefs, unref } from "vue";

export default defineComponent({
    props: {
        display: processedPropType<CoercableComponent>(Object, String, Function),
        visibility: {
            type: processedPropType<Visibility | boolean>(Number, Boolean),
            required: true
        },
        style: processedPropType<StyleValue>(String, Object, Array),
        classes: processedPropType<Record<string, boolean>>(Object),
        onClick: Function as PropType<(e?: MouseEvent | TouchEvent) => void>,
        onHold: Function as PropType<VoidFunction>,
        color: processedPropType<string>(String),
        glowColor: processedPropType<string>(String),
        canClick: {
            type: processedPropType<boolean>(Boolean),
            required: true
        },
        mark: processedPropType<boolean | string>(Boolean, String),
        id: {
            type: String,
            required: true
        }
    },
    components: {
        MarkNode,
        Node
    },
    setup(props) {
        const { onClick, onHold, display } = toRefs(props);

        const comp = computeOptionalComponent(display);

        const { start, stop } = setupHoldToClick(onClick, onHold);

        return {
            start,
            stop,
            comp,
            unref,
            Visibility,
            isCoercableComponent,
            isVisible,
            isHidden
        };
    }
});
</script>

<style scoped>
.treeNode {
    height: 100px;
    width: 100px;
    border-radius: 50%;
    padding: 0;
    margin: 0 10px 0 10px;
}

.treeNode:hover {
    box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.25), 0 0 10px 5px var(--background);
}

.treeNode > *:first-child {
    width: 100px;
    height: 100px;
    box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.25);
    border-radius: 50%;
    font-size: 60px;
    color: rgba(255, 255, 255, 0.25);
    display: flex;
}

.treeNode > *:first-child > * {
    pointer-events: none;
}
</style>
