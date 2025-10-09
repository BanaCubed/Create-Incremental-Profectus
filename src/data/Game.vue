<template>
    <div id="game">
        <div class="gameElement">
            <!-- Tab Buttons -->
        </div>
        <div class="gameElement">
            <!-- Game Content -->
        </div>
        <div class="gameElement">
            <!-- Currencies Display -->
        </div>
    </div>
</template>

<script setup lang="ts">
import projInfo from "data/projInfo.json";
import { type Layer, layers } from "game/layers";
import player from "game/player";
import { computed, toRefs } from "vue";

const wide = computed(() => window.innerWidth >= 1250);
const layerKeys = computed(() => Object.keys(layers));
const useHeader = projInfo.useHeader;

function gatherLayerProps(layer: Layer) {
    const {
        display,
        name,
        color,
        minimizable,
        minimizedDisplay,
        minimized,
        nodes,
        forceHideGoBack 
     } = layer;
    return {
        display,
        name,
        color,
        minimizable,
        minimizedDisplay,
        minimized,
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

.gameElement {
    height: 100%;
    width: 250px;
    box-sizing: border-box;
}

.gameElement:nth-child(2) {
    flex-grow: 20;
    border: solid 4px white;
    border-color: transparent white;
    border-width: 0 4px;
}
</style>
