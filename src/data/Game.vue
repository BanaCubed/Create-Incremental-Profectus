<template>
    <div id="game">
        <div class="game-element">
            <!-- Tab Buttons -->
            Temporary tab selection system (bad)
            <Select :options="TEMP_selectOptions" v-model="tab" />
        </div>
        <div class="game-element">
            <!-- Game Content -->
            <LayerVue
                v-if="layerKeys.includes(tab)"
                v-bind="gatherLayerProps(layers[tab])"
                :index="0"
            />
        </div>
        <div class="game-element">
            <!-- Currencies Display -->
            <SideDisplay />
        </div>
    </div>
</template>

<script setup lang="ts">
import { type Layer, layers } from "game/layers";
import player from "game/player";
import { computed, ref, toRef } from "vue";
import Select, { SelectOption } from "components/fields/Select.vue";
import LayerVue from "components/Layer.vue";
import SideDisplay from "features/resources/SideDisplay.vue";

const wide = computed(() => window.innerWidth >= 1250);
const layerKeys = computed(() => Object.keys(layers));

const TEMP_selectOptions: SelectOption[] = [
    {
        label: "Cash",
        value: "cash"
    },
    {
        label: "\"Secret\" Tab",
        value: "main"
    }
];
const tab = toRef(player, "tab");

function gatherLayerProps(layer: Layer) {
    const { display, name, color, minimizedDisplay, nodes, forceHideGoBack } = layer;
    return {
        display,
        name,
        color,
        minimizable: ref(false),
        minimizedDisplay,
        minimized: ref(false),
        nodes,
        forceHideGoBack
    };
}
</script>

<style scoped>
#game {
    display: flex;
    height: 100%;
    width: 100%;
}

.game-element {
    height: 100%;
    width: 250px;
    box-sizing: border-box;
}

.game-element:nth-child(2) {
    flex-grow: 20;
    border: solid 4px var(--foreground);
    border-color: transparent var(--foreground);
    border-width: 0 4px;
}
</style>
