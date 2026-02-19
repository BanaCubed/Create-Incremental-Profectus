<template>
    <div class="settings-tab">
        <Toggle :title="unthrottledTitle" v-model="unthrottled" />
        <Toggle :title="showTPSTitle" v-model="showTPS" />
        <Toggle v-if="projInfo.enablePausing" :title="isPausedTitle" v-model="isPaused" />
        <Toggle :title="offlineProdTitle" v-model="offlineProd" />
    </div>
</template>

<script setup lang="tsx">
import Toggle from "../fields/Toggle.vue";
import projInfo from "data/projInfo.json";
import settings from "game/settings";
import player from "game/player";
import Tooltip from "wrappers/tooltips/Tooltip.vue";
import Hotkey from "../Hotkey.vue";
import { Direction } from "util/common";
import { toRefs, computed } from "vue";
import { main } from "data/projEntry";

const { unthrottled, showTPS } = toRefs(settings);
const { offlineProd } = toRefs(player);

const isPaused = computed({
    get() {
        return player.devSpeed === 0;
    },
    set(value: boolean) {
        player.devSpeed = value ? 0 : null;
    }
});

const unthrottledTitle = (
    <span class="option-title">
        Unthrottled
        <desc>Allow the game to run as fast as possible. Not battery friendly.</desc>
    </span>
);

const showTPSTitle = (
    <span class="option-title">
        Show TPS
        <desc>Toggle display of ticks-per-second counter in the UI.</desc>
    </span>
);

const offlineProdTitle = (
    <span class="option-title">
        Offline Production
        <Tooltip display="Save-specific" direction={Direction.Right}>
            *
        </Tooltip>
        <desc>Simulate production that occurs while the game is closed.</desc>
    </span>
);

const isPausedTitle = (
    <span class="option-title">
        Pause game
        <Tooltip display="Save-specific" direction={Direction.Right}>
            *
        </Tooltip>
        <desc>
            Stop everything from moving.
            <br />
            Pressing <Hotkey hotkey={main.hotkey} /> toggles this.
        </desc>
    </span>
);
</script>

<style lang="css" scoped>
.settings-tab > * {
    max-width: 600px;
}

.settings-tab {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
</style>