<template>
    <button @click="selectTab" class="tabButton" :style="glowColorStyle" :class="{ active }">
        <Component />
    </button>
</template>

<script setup lang="ts">
import themes from "data/themes";
import { getNotifyStyle } from "game/notifications";
import settings from "game/settings";
import { MaybeGetter } from "util/computed";
import { render, Renderable } from "util/vue";
import { computed, MaybeRef, unref } from "vue";

const props = defineProps<{
    display: MaybeGetter<Renderable>;
    glowColor?: MaybeRef<string>;
    active?: boolean;
}>();

const emit = defineEmits<{
    selectTab: [];
}>();

const Component = () => render(props.display);

        const glowColorStyle = computed(() => {
            let color = unref(props.glowColor);
            if (true) {
                if (color == null || color === "") {
                    color = 'var(--highlighted)'
                }
                return { 'borderColor': `${props.active?'rgba(255, 255, 255, 0.25)':'rgba(0, 0, 0, 0.25)'}`, 'backgroundColor': `${color}` };
            }
            if (color == null || color === "") {
                return {};
            }
            return { 'borderColor': `${props.active?color:'inherit'}`, 'borderBottomColor': `${props.active?color:'transparent'}`, 'boxShadow': `${props.active?'inset 0 -15px 10px -15px '+color:'none'}` };
        });

function selectTab() {
    emit("selectTab");
}
</script>

<style scoped>
.tabButton {
    background-color: transparent;
    color: var(--foreground);
    font-size: 20px;
    cursor: pointer;
    padding: 5px 20px;
    margin: 4px;
    margin-bottom: 8px;
    border-radius: var(--border-radius);
    border: 4px solid;
    flex-shrink: 0;
    text-shadow: 0 0 4px var(--background);
}

.tabButton:hover {
    transform: scale(1.1, 1.1);
    text-shadow: 0 0 7px var(--background), 0 0 4px var(--background);
}

:not(.floating) > .tabButton {
    height: 50px;
    margin: 0;
    border-left: none;
    border-right: none;
    border-top: none;
    border-bottom-width: 4px;
    border-radius: 0;
    transform: unset;
}

:not(.floating) > .tabButton:hover {
    padding-top: 0px;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.25);
}

:not(.floating) .tabButton:not(.active) {
    border-bottom-color: transparent;
}

.tabButton > * {
    pointer-events: none;
}
</style>
