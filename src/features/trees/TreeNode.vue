<template>
    <button
        :style="{
            backgroundColor: unref(color),
            boxShadow: `-4px -4px 4px rgba(0, 0, 0, 0.25) inset, 0 0 20px ${unref(
                glowColor
            )}`
        }"
        :class="{
            treeNode: true,
            can: unref(canClick)
        }"
        @click="e => emits('click', e)"
        @mousedown="start"
        @mouseleave="stop"
        @mouseup="stop"
        @touchstart.passive="start"
        @touchend.passive="stop"
        @touchcancel.passive="stop"
    >
        <Component />
    </button>
</template>

<script setup lang="tsx">
import { MaybeGetter } from "util/computed";
import { render, Renderable, setupHoldToClick } from "util/vue";
import { MaybeRef, toRef, unref } from "vue";

const props = defineProps<{
    canClick?: MaybeRef<boolean>;
    display?: MaybeGetter<Renderable>;
    color?: MaybeRef<string>;
    glowColor?: MaybeRef<string>;
}>();

const emits = defineEmits<{
    (e: "click", event?: MouseEvent | TouchEvent): void;
    (e: "hold"): void;
}>();

const Component = () => props.display == null ? <></> :
    render(props.display, el => <div>{el}</div>);

const { start, stop } = setupHoldToClick(() => emits("hold"));
</script>

<style scoped>
.treeNode {
    height: 100px;
    width: 100px;
    border: 2px solid rgba(0, 0, 0, 0.125);
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

.treeNode > * {
    pointer-events: none;
}
</style>
