<template>
    <Modal v-model="isOpen">
        <template v-slot:header>
            <div class="header">
                <h2>Settings</h2>
                <div class="option-tabs">
                    <button :class="{selected: isTab('behaviour')}" @click="setTab('behaviour')">Behaviour</button>
                    <button :class="{selected: isTab('appearance')}" @click="setTab('appearance')">Appearance</button>
                </div>
            </div>
        </template>
        <template v-slot:body>
            <div v-if="isTab('behaviour')">
                <Toggle :title="unthrottledTitle" v-model="unthrottled" />
                <!-- <Toggle :title="appendTitle" v-model="appendLayers" /> --> <!-- I can't get this to work -->
                <Toggle v-if="projInfo.enablePausing" :title="isPausedTitle" v-model="isPaused" />
                <Toggle :title="offlineProdTitle" v-model="offlineProd" />
                <Toggle :title="autosaveTitle" v-model="autosave" />
                <FeedbackButton v-if="!autosave" class="button save-button" @click="save()">Manually save</FeedbackButton>
            </div>
            <div v-if="isTab('appearance')">
                <Select :title="notationTitle" :options="notationsOptions" v-model="notation" />
                <!-- <Select :title="langTitle" :options="langOptions" v-model="language" /> -->
                <component :is="settingFieldsComponent" />
                <Toggle :title="showTPSTitle" v-model="showTPS" />
                <Toggle :title="alignModifierUnitsTitle" v-model="alignUnits" />
            </div>
        </template>
    </Modal>
</template>

<script setup lang="tsx">
import Modal from "./Modal.vue";
import projInfo from "data/projInfo.json";
import { save } from "util/save";
import rawThemes from "data/themes";
import { jsx } from "features/feature";
import Tooltip from "features/tooltips/Tooltip.vue";
import player from "game/player";
import settings, { settingFields } from "game/settings";
import { camelToTitle, Direction } from "util/common";
import { coerceComponent, render } from "util/vue";
import { computed, ref, toRefs } from "vue";
import Select from "../fields/Select.vue";
import Toggle from "../fields/Toggle.vue";
import FeedbackButton from "../fields/FeedbackButton.vue";
import Hotkey from "../Hotkey.vue";
import { createHotkey } from "features/hotkey";
import { main } from "data/projEntry";

settings.notation = settings.notation || 0;
settings.language = settings.language || 'en';

const isOpen = ref(false);
const currentTab = ref("behaviour");

function isTab(tab: string): boolean {
    return tab == currentTab.value;
}

function setTab(tab: string) {
    currentTab.value = tab;
}

defineExpose({
    isTab,
    setTab,
    save,
    open() {
        isOpen.value = true;
    }
});

const notationsOptions = [
    {
        label: "Scientific",
        value: 0,
    },
    {
        label: "Standard",
        value: 1,
    },
    {
        label: "Logarithmic",
        value: 2,
    },
    {
        label: "Mixed Scientific",
        value: 3,
    },
    {
        label: "Mixed Logarithmic",
        value: 4,
    },
];

const langOptions = [
    {
        label: "English",
        value: 'en',
    },
];

const settingFieldsComponent = computed(() => {
    return coerceComponent(jsx(() => (<>{settingFields.map(render)}</>)));
});

const { showTPS, notation, language, unthrottled, alignUnits, appendLayers } = toRefs(settings);
const { autosave, offlineProd } = toRefs(player);
const isPaused = computed({
    get() {
        return player.devSpeed === 0;
    },
    set(value: boolean) {
        player.devSpeed = value ? 0 : null;
    }
});

const unthrottledTitle = jsx(() => (
    <span class="option-title">
        Unthrottled
        <desc>Allow the game to run as fast as possible. Not battery friendly.</desc>
    </span>
));
const offlineProdTitle = jsx(() => (
    <span class="option-title">
        Offline Production<Tooltip display="Save-specific" direction={Direction.Right}>*</Tooltip>
        <desc>Simulate production that occurs while the game is closed.</desc>
    </span>
));
const appendTitle = jsx(() => (
    <span class="option-title">
        Append Layers
        <desc>Whether opening a layer appends it to previous layers or replaces them.</desc>
    </span>
));
const autosaveTitle = jsx(() => (
    <span class="option-title">
        Autosave<Tooltip display="Save-specific" direction={Direction.Right}>*</Tooltip>
        <desc>Automatically save the game every second or when the game is closed.</desc>
    </span>
));
const isPausedTitle = jsx(() => (
    <span class="option-title">
        Pause game<Tooltip display="Save-specific" direction={Direction.Right}>*</Tooltip>
        <desc>Stop everything from moving.<br />Pressing <Hotkey hotkey={main.hotkey} /> toggles this.</desc>
    </span>
));
const notationTitle = jsx(() => (
    <span class="option-title">
        Notation
        <desc>How numbers are displayed.<br />Currently unfinished porting from β3.</desc>
    </span>
));
const langTitle = jsx(() => (
    <span class="option-title">
        Language
        <desc>The language the game uses.<br />The game was developed in English.</desc>
    </span>
));
const showTPSTitle = jsx(() => (
    <span class="option-title">
        Show TPS
        <desc>Show TPS meter at the bottom-left corner of the page.</desc>
    </span>
));
const alignModifierUnitsTitle = jsx(() => (
    <span class="option-title">
        Align modifier units
        <desc>Align numbers to the beginning of the unit in modifier view.</desc>
    </span>
));
</script>

<style>
.option-tabs {
    border-bottom: 4px solid var(--outline);
    margin: -10px;
    margin-top: 10px;
}

.option-tabs button {
    background-color: transparent;
    color: var(--foreground);
    margin-bottom: -4px;
    font-size: 14px;
    cursor: pointer;
    padding: 5px 20px;
    border: none;
    border-bottom: 4px solid var(--foreground);
}

.option-tabs button:not(.selected) {
    border-bottom-color: transparent;
}

.option-title .tooltip-container {
    display: inline;
    margin-left: 5px;
}
.option-title desc {
    display: block;
    opacity: 0.6;
    font-size: small;
    width: 300px;
    margin-left: 0;
}

.save-button {
    text-align: right;
}

.header {
    margin: -20px;
    margin-bottom: 0;
    padding: 10px;
    padding-bottom: 0;
    background: var(--raised-background);
}
</style>
