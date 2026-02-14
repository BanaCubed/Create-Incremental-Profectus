<template>
    <!-- <Modal v-model="isOpen" ref="modal">
        <template v-slot:header> -->
            <div class="header">
                <h2>{{ settings.e === true ? "Settings - Debug Mode Enabled" : "Settings" }}</h2>
                <div class="option-tabs">
                    <!-- <button :class="{selected: isTab('lang')}" @click="setTab('lang')">Language</button> -->
                    <button :class="{ selected: isTab('behaviour') }" @click="setTab('behaviour')">
                        Behavior
                    </button>
                    <button :class="{ selected: isTab('saves') }" @click="setTab('saves')">
                        Saves
                    </button>
                    <button
                        :class="{ selected: isTab('appearance') }"
                        @click="setTab('appearance')"
                    >
                        Appearance
                    </button>
                    <!-- <button :class="{selected: isTab('notation')}" @click="setTab('notation')">Notation</button> -->
                </div>
            </div>
        <!-- </template>
        <template #body="{ shown }"> -->
            <div v-if="isTab('behaviour')">
                <Behaviour />
            </div>
            <div v-if="isTab('saves')">
                <Saves />
            </div>
            <div v-if="isTab('appearance')">
                <SettingFields />
                <!-- <Toggle :title="showTPSTitle" v-model="showTPS" /> -->
                <Toggle :title="alignModifierUnitsTitle" v-model="alignUnits" />
            </div>
            <div v-if="isTab('notation')">
                <details open>
                    <summary class="subtitle" style="margin-top: 12px">Modifiers</summary>

                    <details open>
                        <summary class="notation-modifier-title">Unconditional Modifiers</summary>
                        <div class="notation-list">
                            <Tooltip :display="precisionTooltip" :direction="down">
                                <div class="notation-modifier">
                                    <span class="configurable-notation-modifier">Precision+</span>
                                    <Toggle
                                        v-model="insanePrecision"
                                        style="background: transparent; padding: 0"
                                    />
                                </div>
                            </Tooltip>
                        </div>
                        <Select
                            v-if="settings.insanePrecision"
                            :options="precisionPlusOptions"
                            :title="precisionTitle"
                            v-model="precisionBonus"
                        />
                    </details>

                    <details>
                        <summary class="notation-modifier-title">Partial Overrides</summary>
                        <div class="notation-list">
                            <Tooltip :display="engineeringTooltip" :direction="down">
                                <div class="notation-modifier">
                                    <span>Engineering</span>
                                    <Toggle
                                        v-model="engineering"
                                        style="background: transparent; padding: 0"
                                    />
                                </div>
                            </Tooltip>
                            <Tooltip :display="lettersTooltip" :direction="down">
                                <div class="notation-modifier">
                                    <span class="configurable-notation-modifier">Letters</span>
                                    <Toggle
                                        v-model="letterNumbers"
                                        style="background: transparent; padding: 0"
                                    />
                                </div>
                            </Tooltip>
                            <Tooltip :display="infinityTooltip" :direction="down">
                                <div class="notation-modifier">
                                    <span>Infinity</span>
                                    <Toggle
                                        v-model="infinityNumbers"
                                        style="background: transparent; padding: 0"
                                    />
                                </div>
                            </Tooltip>
                        </div>
                        <Text
                            v-if="settings.letterNumbers"
                            :submitOnBlur="true"
                            :placeholder="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"
                            :title="lettersTitle"
                            v-model="letters"
                        />
                    </details>

                    <details>
                        <summary class="notation-modifier-title">Full Overrides</summary>
                        <div class="notation-list">
                            <Tooltip :display="blindTooltip" :direction="down">
                                <div class="notation-modifier">
                                    <span>Blind Mode</span>
                                    <Toggle
                                        v-model="blindNumbers"
                                        style="background: transparent; padding: 0"
                                    />
                                </div>
                            </Tooltip>
                            <Tooltip :display="yesnoTooltip" :direction="down">
                                <div class="notation-modifier">
                                    <span>YES/NO</span>
                                    <Toggle
                                        v-model="yesnoNumbers"
                                        style="background: transparent; padding: 0"
                                    />
                                </div>
                            </Tooltip>
                        </div>
                    </details>
                </details>

                <details>
                    <summary class="subtitle">Thresholds</summary>
                    <Select
                        :options="thresholds"
                        :title="logarithmicTitle"
                        v-model="logarithmicThreshold"
                    />
                    <Select
                        :options="thresholds"
                        :title="scientificTitle"
                        v-model="scientificThreshold"
                    />
                    <Select
                        :options="thresholdsSimple"
                        :title="standardTitle"
                        v-model="standardThreshold"
                    />
                </details>

                <details open>
                    <summary class="subtitle">Preview</summary>
                    <div class="notation-modifier" id="notation-preview">
                        <NotationPreviewComponent />
                    </div>
                </details>
            </div>
            <div v-if="isTab('lang')" is-language>
                <!-- Currently unfinished and unplanned system, potential v2.0 content? -->
            </div>
        <!-- </template>
    </Modal> -->
</template>

<script setup lang="tsx">
import settings, { settingFields } from "game/settings";
import { Direction } from "util/common";
import { render } from "util/vue";
import { ref, toRefs } from "vue";
import Select, { SelectOption } from "../fields/Select.vue";
import Toggle from "../fields/Toggle.vue";
import Tooltip from "wrappers/tooltips/Tooltip.vue";
import {
    save
} from "util/save";
import type { Player } from "game/player";
import Text from "components/fields/Text.vue";
import Decimal, { DecimalSource, format } from "util/bignum";
import { JSX } from "vue/jsx-runtime";
import Behaviour from "components/options/Behaviour.vue";
import Saves from "components/options/Saves.vue";

export type LoadablePlayerData = Omit<Partial<Player>, "id"> & { id: string; error?: unknown };

settings.language = settings.language ?? "en";

const notationPreviews: [DecimalSource, JSX.Element][] = [
    ["1", <>One</>],
    ["10", <>Ten</>],
    ["e3", <>Thousand</>],
    ["e6", <>Million</>],
    ["e9", <>Billion</>],
    ["e12", <>Trillion</>],
    ["e33", <>Decillion</>],
    ["ee2", <>Googol</>],
    ["e303", <>Centillion</>],
    ["1.79769e308", <>Infinity</>]
];

function constructNotationPreviewComponent(previews: [DecimalSource, JSX.Element][]) {
    let element = <></>;
    for (let i = 0; i < notationPreviews.length; i++) {
        const preview = notationPreviews[i];
        element = (
            <>
                {element}
                <p>
                    {preview[1]} - {format(preview[0])}
                </p>
            </>
        );
    }
    return element;
}

const NotationPreviewComponent = () => render(constructNotationPreviewComponent(notationPreviews));

const isOpen = ref(false);
const currentTab = ref("behaviour");

const thresholdsSimple: SelectOption[] = [
    {
        label: "1",
        value: 0
    },
    {
        label: "1e3",
        value: 1
    },
    {
        label: "1e6",
        value: 2
    },
    {
        label: "1e9",
        value: 3
    },
    {
        label: "1e12",
        value: 4
    }
];

const thresholds: SelectOption[] = [
    {
        label: "1",
        value: 0
    },
    {
        label: "1e3",
        value: 1
    },
    {
        label: "1e6",
        value: 2
    },
    {
        label: "1e9",
        value: 3
    },
    {
        label: "1e12",
        value: 4
    },
    {
        label: "1e33",
        value: 5
    },
    {
        label: "1e100",
        value: 6
    },
    {
        label: "1e303",
        value: 7
    },
    {
        label: "1e1000",
        value: 8
    }
];

const precisionPlusOptions: SelectOption[] = [
    {
        label: "+1",
        value: 1
    },
    {
        label: "+2",
        value: 2
    },
    {
        label: "+3",
        value: 3
    }
];

function isTab(tab: string): boolean {
    return tab == currentTab.value;
}

function setTab(tab: string) {
    currentTab.value = tab;
}
const down = Direction.Up; // dont ask

const SettingFields = () => settingFields.map(f => render(f));

const {
    alignUnits,
    engineering,
    insanePrecision,
    blindNumbers,
    yesnoNumbers,
    letterNumbers,
    standardThreshold,
    scientificThreshold,
    logarithmicThreshold,
    letters,
    precisionBonus,
    infinityNumbers
} = toRefs(settings);

const engineeringTooltip = <>Replaces Scientific with Engineering</>;
const precisionTooltip = <>Increases decimal places [Configurable]</>;
const lettersTooltip = <>Replaces Standard with Letters [Configurable]</>;
const blindTooltip = <>Forces Blind notation</>;
const yesnoTooltip = <>Forces YES/NO notation</>;
const infinityTooltip = <>Replaces Logarithmic with Infinity</>;
const standardTitle = () => (
    <span class="option-title">{settings.letterNumbers ? "Letters" : "Standard"}</span>
);
const scientificTitle = () => (
    <span class="option-title">{settings.engineering ? "Engineering" : "Scientific"}</span>
);
const logarithmicTitle = () => (
    <span class="option-title">{settings.infinityNumbers ? "Infinity" : "Logarithmic"}</span>
);
const lettersTitle = (
    <span class="option-title">
        Letters Config
        <desc>Letters used in letters notation.</desc>
    </span>
);
const precisionTitle = (
    <span class="option-title">
        Precision+ Config
        <desc>Decimal places increase.</desc>
    </span>
);
const bigModalTitle = ( // why the fuck does this exist
    <span class="option-title">
        Larger Modals
        <desc>Makes modals bigger. Might have visual bugs.</desc>
    </span>
);
const alignModifierUnitsTitle = (
    <span class="option-title">
        Align modifier units
        <desc>Align numbers to the beginning of the unit in modifier view.</desc>
    </span>
);

defineExpose({
    isTab,
    setTab,
    save,
    open() {
        isOpen.value = true;
    },
    format,
    Decimal
});
</script>

<style lang="css" scoped>
summary {
    cursor: pointer;
}
</style>

<style>
.configurable-notation-modifier::after {
    font-size: 1em;
    display: inline-block;
    position: relative;
    top: 3px;
    font-family: "Material Icons";
    content: "tune";
    font-weight: lighter;
    left: 10px;
}

#notation-preview {
    columns: 2;
    break-inside: unset;
    display: block;
    padding: 10px;
    margin-left: 10px;
    margin-right: 10px;
    text-align: left;
}

#notation-preview > p {
    width: 259.6px;
    margin: auto;
}

@media screen and (max-width: 600px) {
    #notation-preview {
        columns: 1;
    }
}

.notation-thresholds {
    width: 75%;
}

.notation-thresholds > tr > td:first-child {
    width: 60%;
}

.notation-thresholds > tr > td:last-child {
    width: 40%;
}

.notation-list {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: flex-start;
    flex-direction: row;
    align-items: stretch;
    margin-left: 10px;
}

.notation-list + div {
    margin-top: 0px;
}

.notation-list + form {
    margin-top: -10px;
}

.notation-list > div {
    break-inside: avoid;
    margin: 0 10px 0 0;
    flex-grow: 1;
}

.notation-modifier {
    display: flex;
    break-inside: avoid;
    padding: 0 10px;
    background-color: rgb(from var(--feature-foreground) r g b / 0.15);
    border-radius: var(--border-radius);
    margin: 0 0 10px;
    min-width: 200px;
}

.notation-modifier > span {
    flex-grow: 1;
    display: inline-block;
}

.notation-modifier > label {
    max-width: 40px;
    max-height: 52px;
    display: inline;
    margin: 0;
}

.notation-modifier-title {
    font-size: 12px;
    position: relative;
    width: 100%;
    text-align: left;
    display: block;
    /* opacity: 0.6; */
    margin-top: 0px !important;
    margin-bottom: 12px;
    padding-left: 23.75px;
}

.notation-modifier-title::after {
    height: 4px;
    border-radius: var(--border-radius);
    background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.2) 30%, transparent);
    width: 35%;
    position: absolute;
    content: "";
    bottom: -4px;
    left: 5px;
}

.notation-modifier-title::before {
    position: absolute;
    left: 10px;
    translate: 0 -1.5px;
}

:not([open]) > .notation-modifier-title::before {
    content: "▶";
    scale: 0.8;
}

[open] > .notation-modifier-title::before {
    content: "▼";
    scale: 1.2;
}

.notation-modifier-title:not(:first-child) {
    margin-top: 5px;
}

.notation-modifier-title:first-child {
    margin-top: -10px;
}

.subtitle {
    font-size: 16px;
    position: relative;
    width: 100%;
    text-align: left;
    display: block;
    /* opacity: 0.6; */
    margin-top: 5px;
    margin-bottom: 16px;
    padding-left: 25px;
}

.subtitle::after {
    height: 4px;
    border-radius: var(--border-radius);
    background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.25) 30%, transparent);
    width: 50%;
    position: absolute;
    content: "";
    bottom: -4px;
    left: 0px;
}

.subtitle::before {
    position: absolute;
    left: 5px;
}

:not([open]) > .subtitle::before {
    content: "▶";
    scale: 0.8;
    translate: 0 -3px;
}

[open] > .subtitle::before {
    content: "▼";
    scale: 1.2;
    translate: 0 -1px;
}

.language-option {
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
    --shadows: 6px 6px 12px -6px rgba(0, 0, 0, 0),
        -6px -6px 12px -6px rgb(from var(--raised-background) r g b / 0),
        inset 6px 6px 12px -6px rgba(0, 0, 0, 0),
        inset -6px -6px 12px -6px rgb(from var(--raised-background) r g b / 0);
    box-shadow: var(--shadows);
    cursor: pointer;
}

[is-language] table {
    margin-top: 10px;
    margin-bottom: 10px;
}

.language-portion {
    font-size: 0.6rem;
}

.language-option:hover:not(.active) {
    --shadows: 6px 6px 12px -6px rgba(0, 0, 0, 0.3),
        -6px -6px 12px -6px rgb(from var(--raised-background) r g b / 1),
        inset 6px 6px 12px -6px rgba(0, 0, 0, 0),
        inset -6px -6px 12px -6px rgb(from var(--raised-background) r g b / 0);
}

.language-option.active {
    --shadows: 6px 6px 12px -6px rgba(0, 0, 0, 0),
        -6px -6px 12px -6px rgb(from var(--raised-background) r g b / 0),
        inset 6px 6px 12px -6px rgba(0, 0, 0, 0.3),
        inset -6px -6px 12px -6px rgb(from var(--raised-background) r g b / 1);
    cursor: default;
}

[is-language] table > tr > td {
    width: 170px;
    height: 100px;
    box-sizing: border-box;
    padding: 0;
}

.language-option span {
    z-index: 20;
    position: relative;
}

.language-option::before {
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
    margin: 0px;
    margin-bottom: 30px;
    padding-top: 10px;
    padding-bottom: 0;
    background: var(--raised-background);
    /* border-radius: calc(var(--border-radius) - 4px) calc(var(--border-radius) - 4px) 0 0; */
}
</style>
