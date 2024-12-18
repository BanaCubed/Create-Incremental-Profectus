<template>
    <Modal v-model="isOpen">
        <template v-slot:header>
            <div class="header">
                <h2>{{ settings.e === true ? 's' : 'S' }}<span @click="settings.e = settings.e !== true;">{{ settings.e === true ? 'E' : 'e' }}</span>ttings</h2>
                <div class="option-tabs">
                    <button :class="{selected: isTab('lang')}" @click="setTab('lang')">Language</button>
                    <button :class="{selected: isTab('behaviour')}" @click="setTab('behaviour')">Behaviour</button>
                    <button :class="{selected: isTab('appearance')}" @click="setTab('appearance')">Appearance</button>
                </div>
            </div>
        </template>
        <template v-slot:body>
            <div v-if="isTab('behaviour')">
                <Toggle :title="unthrottledTitle" v-model="unthrottled" />
                <Toggle v-if="projInfo.enablePausing" :title="isPausedTitle" v-model="isPaused" />
                <Toggle :title="offlineProdTitle" v-model="offlineProd" />
                <!-- <Toggle :title="showHealthWarningTitle" v-model="showHealthWarning" v-if="!projInfo.disableHealthWarning" /> -->
                <Toggle :title="autosaveTitle" v-model="autosave" />
                <FeedbackButton v-if="!autosave" class="button save-button" @click="save()">Manually save</FeedbackButton>
            </div>
            <div v-if="isTab('appearance')">
                <Select :title="notationTitle" :options="notationsOptions" v-model="notation" />
                <component :is="settingFieldsComponent" />
                <Toggle :title="showTPSTitle" v-model="showTPS" />
                <Toggle :title="alignModifierUnitsTitle" v-model="alignUnits" />
            </div>
            <div v-if="isTab('lang')" islang>
                <table>
                    <tr>
                        <td><div class="lang" lang="EN" v-bind:class="{active: settings.language === 'en'}" onclick="settings.language = 'en'"><span><span class="langPortion">100%</span><br>English</span></div></td>
                        <td></td>
                        <td></td>
                    </tr>
                </table>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="tsx">
import Modal from "components/modals/Modal.vue";
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

settings.notation = settings.notation ?? 0;
settings.language = settings.language ?? 'en';

const isOpen = ref(false);
const currentTab = ref("lang");

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

const settingFieldsComponent = computed(() => {
    return coerceComponent(jsx(() => (<>{settingFields.map(render)}</>)));
});

const { showTPS, notation, language, unthrottled, alignUnits, appendLayers, showHealthWarning } = toRefs(settings);
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
const showHealthWarningTitle = jsx(() => (
    <span class="option-title">
        Show videogame addiction warning
        <desc>Show a helpful warning after playing for a long time about video game addiction and encouraging you to take a break.</desc>
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
.lang {
    width: 160px;
    height: 90px;
    background-color: var(--background);
    margin: 5px;
    border-radius: var(--border-radius);
    /* border: 4px solid rgba(255, 255, 255, 0.25); */
    padding: 46px 10px 0px 0px;
    box-sizing: border-box;
    text-align: right;
    position: relative;
    overflow: clip;
    --shadows: 6px 6px 12px -6px rgba(0, 0, 0, 0), -6px -6px 12px -6px rgb(from var(--raised-background) r g b / 0), inset 6px 6px 12px -6px rgba(0, 0, 0, 0), inset -6px -6px 12px -6px rgb(from var(--raised-background) r g b / 0);
    box-shadow: var(--shadows);
    cursor: pointer;
}

[islang] table {
    margin-top: 10px;
    margin-bottom: 10px;
}

.langPortion {
    font-size: 0.6rem;
}

.lang:hover:not(.active) {
    --shadows: 6px 6px 12px -6px rgba(0, 0, 0, 0.3), -6px -6px 12px -6px rgb(from var(--raised-background) r g b / 1), inset 6px 6px 12px -6px rgba(0, 0, 0, 0), inset -6px -6px 12px -6px rgb(from var(--raised-background) r g b / 0);
}

.lang.active {
    --shadows: 6px 6px 12px -6px rgba(0, 0, 0, 0), -6px -6px 12px -6px rgb(from var(--raised-background) r g b / 0), inset 6px 6px 12px -6px rgba(0, 0, 0, 0.3), inset -6px -6px 12px -6px rgb(from var(--raised-background) r g b / 1);
    cursor: default;
}

[islang] table>tr>td {
    width: 170px;
    height: 100px;
    box-sizing: border-box;
    padding: 0;
}

.lang span {
    z-index: 20;
    position: relative;
}

.lang::before {
    content: attr(lang);
    position: absolute;
    bottom: 50%;
    left: 50%;
    transform: translate(-50%, 50%) rotate(-15deg);
    font-size: 80px;
    font-family: monospace;
    color: rgb(from var(--highlighted) r g b / 0.3);
    transition: all 0.5s ease-in-out;
}

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

.option-tabs button:hover {
    border-bottom-color: color(from var(--foreground) srgb r g b / 0.3);
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
