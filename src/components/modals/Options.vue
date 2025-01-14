<template>
    <Modal v-model="isOpen" ref="modal">
        <template v-slot:header>
            <div class="header">
                <h2>{{ settings.e === true ? 's' : 'S' }}<span @click="settings.e = settings.e !== true;">{{ settings.e === true ? 'E' : 'e' }}</span>ttings</h2>
                <div class="option-tabs">
                    <!-- <button :class="{selected: isTab('lang')}" @click="setTab('lang')">Language</button> -->
                    <button :class="{selected: isTab('behaviour')}" @click="setTab('behaviour')">Behaviour</button>
                    <button :class="{selected: isTab('saves')}" @click="setTab('saves')">Saves</button>
                    <button :class="{selected: isTab('appearance')}" @click="setTab('appearance')">Appearance</button>
                    <button :class="{selected: isTab('notation')}" @click="setTab('notation')">Notation</button>
                </div>
            </div>
        </template>
        <template #body="{ shown }">
            <div v-if="isTab('behaviour')">
                <Toggle :title="unthrottledTitle" v-model="unthrottled" />
                <Toggle v-if="projInfo.enablePausing" :title="isPausedTitle" v-model="isPaused" />
                <Toggle :title="offlineProdTitle" v-model="offlineProd" />
                <!-- <Toggle :title="showHealthWarningTitle" v-model="showHealthWarning" v-if="!projInfo.disableHealthWarning" /> -->
            </div>
            <div v-if="isTab('saves')">
                <div v-if="showNotSyncedWarning" style="color: var(--danger)">
                    Not all saves are synced! You may need to delete stale saves.
                </div>
                <Draggable
                    :list="settings.saves"
                    handle=".handle"
                    v-if="shown"
                    :itemKey="(save: string) => save"
                >
                    <template #item="{ element }">
                        <Save
                            :save="saves[element]"
                            @open="openSave(element)"
                            @export="exportSave(element)"
                            @editName="(name: string) => editSave(element, name)"
                            @duplicate="duplicateSave(element)"
                            @delete="deleteSave(element)"
                        />
                    </template>
                </Draggable>
                <Text
                    v-model="saveToImport"
                    title="Import Save"
                    placeholder="Paste your save here!"
                    :class="{ importingFailed }"
                />
                <div class="field">
                    <span class="field-title">Create Save</span>
                    <div class="field-buttons">
                        <button class="button" @click="openSave(newSave().id)">New Game</button>
                        <!-- <Select
                            v-if="Object.keys(bank).length > 0"
                            :options="bank"
                            :modelValue="selectedPreset"
                            @update:modelValue="(preset: unknown) => newFromPreset(preset as string)"
                            closeOnSelect
                            placeholder="Select preset"
                            class="presets"
                        /> -->
                    </div>
                </div>
                <Toggle :title="autosaveTitle" v-model="autosave" />
                <FeedbackButton v-if="!autosave" class="button save-button" @click="save()">Manually save</FeedbackButton>
            </div>
            <div v-if="isTab('appearance')">
                <SettingFields />
                <Toggle :title="showTPSTitle" v-model="showTPS" />
                <Toggle :title="alignModifierUnitsTitle" v-model="alignUnits" />
            </div>
            <div v-if="isTab('notation')">

                <span class="subtitle" style="margin-top: 5px;">Thresholds (checked from top down)</span>
                <Select :options="thresholds"       :title="logarithmicTitle" v-model="logarithmicThreshold" />
                <Select :options="thresholds"       :title="scientificTitle"  v-model="scientificThreshold"  />
                <Select :options="thresholdsSimple" :title="standardTitle"    v-model="standardThreshold"    />

                <span class="subtitle" style="margin-top: 32px; margin-bottom: 10px;">Modifiers</span>
                <div class="notation-list">

                        <div class="notation-modifier-title">
                            <span>Partial Overrides</span>
                        </div>
                    <Tooltip :display="engineeringTooltip" :direction="down">
                        <div class="notation-modifier">
                            <span>Engineering</span>
                            <Toggle v-model="engineering" style="background: transparent; padding: 0;" />
                        </div>
                    </Tooltip>
                    <Tooltip :display="lettersTooltip" :direction="down">
                        <div class="notation-modifier">
                            <span class="configurable-notation-modifier">Letters</span>
                            <Toggle v-model="letterNumbers" style="background: transparent; padding: 0;" />
                        </div>
                    </Tooltip>
                    <Tooltip :display="infinityTooltip" :direction="down">
                        <div class="notation-modifier">
                            <span>Infinity</span>
                            <Toggle v-model="infinityNumbers" style="background: transparent; padding: 0;" />
                        </div>
                    </Tooltip>
                    
                        <div class="notation-modifier-title">
                            <span>Global Overrides</span>
                        </div>
                    <Tooltip :display="blindTooltip" :direction="down">
                        <div class="notation-modifier">
                            <span>Blind Mode</span>
                            <Toggle v-model="blindNumbers" style="background: transparent; padding: 0;" />
                        </div>
                    </Tooltip>
                    <Tooltip :display="yesnoTooltip" :direction="down">
                        <div class="notation-modifier">
                            <span>YES/NO</span>
                            <Toggle v-model="yesnoNumbers" style="background: transparent; padding: 0;" />
                        </div>
                    </Tooltip>
                    
                        <div class="notation-modifier-title">
                            <span>Actual Modifiers</span>
                        </div>
                    <Tooltip :display="precisionTooltip" :direction="down">
                        <div class="notation-modifier">
                            <span class="configurable-notation-modifier">Precision+</span>
                            <Toggle v-model="insanePrecision" style="background: transparent; padding: 0;" />
                        </div>
                    </Tooltip>
                </div>

                <span class="subtitle" style="margin-top: 32px;">Modifier Configs</span>
                <span class="subtitle" style="opacity: 0.4; font-size: 0.6em;" v-if="!settings.letterNumbers && !settings.insanePrecision">No active modifiers have configs</span>
                <Text v-if="settings.letterNumbers" :submitOnBlur="true" :placeholder="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" :title="lettersTitle" v-model="letters" />
                <Select v-if="settings.insanePrecision" :options="precisionPlusOptions" :title="precisionTitle" v-model="precisionBonus" />
                
                <span class="subtitle" style="margin-top: 32px; margin-bottom: 10px;">Preview</span>
                <div class="notation-modifier" id="notation-preview">
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;One - {{ format("1e0") }}</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ten - {{ format("1e1") }}</p>
                    <p>&nbsp;&nbsp;Thousand - {{ format("1e3") }}</p>
                    <p>&nbsp;&nbsp;&nbsp;Million - {{ format("1e6") }}</p>
                    <p>&nbsp;&nbsp;&nbsp;Billion - {{ format("1e9") }}</p>
                    <p>&nbsp;&nbsp;Trillion - {{ format("1e12") }}</p>
                    <p>&nbsp;Decillion - {{ format("1e33") }}</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;Googol - {{ format("1e100") }}</p>
                    <p>Centillion - {{ format("1e303") }}</p>
                    <p>&nbsp;&nbsp;Infinity - {{ format(Decimal.dNumberMax) }}</p>
                </div>
            </div>
            <div v-if="isTab('lang')" islang> <!-- Currently unfinished and unplanned system, potential v2.0 content? -->
            </div>
        </template>
    </Modal>
</template>

<script setup lang="tsx">
import Modal from "components/modals/Modal.vue";
import projInfo from "data/projInfo.json";
import { galaxy, syncedSaves } from "util/galaxy";
import rawThemes from "data/themes";
import player, { stringifySave } from "game/player";
import LZString from "lz-string";
import settings, { settingFields } from "game/settings";
import { camelToTitle, Direction } from "util/common";
import { render } from "util/vue";
import { computed, ref, toRefs, nextTick, watch } from "vue";
import Select, { SelectOption } from "../fields/Select.vue";
import Toggle from "../fields/Toggle.vue";
import Tooltip from "wrappers/tooltips/Tooltip.vue";
import FeedbackButton from "../fields/FeedbackButton.vue";
import Hotkey from "../Hotkey.vue";
import Draggable from "vuedraggable";
import {
    clearCachedSave,
    clearCachedSaves,
    decodeSave,
    getCachedSave,
    getUniqueID,
    loadSave,
    newSave,
    save
} from "util/save";
import type { Player } from "game/player";
import { main } from "data/projEntry";
import Text from "components/fields/Text.vue";
import { Texture } from "@pixi/core";
import Slider from "components/fields/Slider.vue";
import Decimal, { format } from "util/bignum";
import Save from "./Save.vue";

export type LoadablePlayerData = Omit<Partial<Player>, "id"> & { id: string; error?: unknown };

settings.language = settings.language ?? 'en';

const importingFailed = ref(false);
const saveToImport = ref("");
const selectedPreset = ref<string | null>(null);

let bankContext = import.meta.glob("./../../../saves/*.txt", { query: "?raw", eager: true });
let bank = ref(
    Object.keys(bankContext).reduce((acc: Array<{ label: string; value: string }>, curr) => {
        acc.push({
            // .slice(2, -4) strips the leading ./ and the trailing .txt
            label: curr.split("/").slice(-1)[0].slice(0, -4),
            // Have to perform this unholy cast because globEager's typing doesn't appear to know
            // adding { as: "raw" } will make the object contain strings rather than modules
            value: bankContext[curr] as unknown as string
        });
        return acc;
    }, [])
);

watch(saveToImport, importedSave => {
    if (importedSave) {
        nextTick(() => {
            try {
                importedSave = decodeSave(importedSave) ?? "";
                if (importedSave === "") {
                    console.warn("Unable to determine preset encoding", importedSave);
                    importingFailed.value = true;
                    return;
                }
                const playerData = JSON.parse(importedSave);
                if (typeof playerData !== "object") {
                    importingFailed.value = true;
                    return;
                }
                const id = getUniqueID();
                playerData.id = id;
                save(playerData);
                saveToImport.value = "";
                importingFailed.value = false;

                settings.saves.push(id);
            } catch (e) {
                importingFailed.value = true;
            }
        });
    } else {
        importingFailed.value = false;
    }
});

const showNotSyncedWarning = computed(
    () => galaxy.value?.loggedIn === true && settings.saves.length < syncedSaves.value.length
);

const saves = computed(() =>
    settings.saves.reduce((acc: Record<string, LoadablePlayerData>, curr: string) => {
        acc[curr] = getCachedSave(curr);
        return acc;
    }, {})
);

function newFromPreset(preset: string) {
    // Reset preset dropdown
    selectedPreset.value = preset;
    nextTick(() => {
        selectedPreset.value = null;
    });

    preset = decodeSave(preset) ?? "";
    if (preset === "") {
        console.warn("Unable to determine preset encoding", preset);
        return;
    }
    const playerData = JSON.parse(preset);
    playerData.id = getUniqueID();
    save(playerData as Player);

    settings.saves.push(playerData.id);

    openSave(playerData.id);
}

function editSave(id: string, newName: string) {
    const currSave = saves.value[id];
    if (currSave != null) {
        currSave.name = newName;
        if (player.id === id) {
            player.name = newName;
            save();
        } else {
            save(currSave as Player);
            clearCachedSave(id);
        }
    }
}

function exportSave(id: string) {
    let saveToExport;
    if (player.id === id) {
        saveToExport = stringifySave(player);
    } else {
        saveToExport = JSON.stringify(saves.value[id]);
    }
    switch (projInfo.exportEncoding) {
        default:
            console.warn(`Unknown save encoding: ${projInfo.exportEncoding}. Defaulting to lz`);
        case "lz":
            saveToExport = LZString.compressToUTF16(saveToExport);
            break;
        case "base64":
            saveToExport = btoa(unescape(encodeURIComponent(saveToExport)));
            break;
        case "plain":
            break;
    }

    // Put on clipboard. Using the clipboard API asks for permissions and stuff
    const el = document.createElement("textarea");
    el.value = saveToExport;
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(el);
}

function duplicateSave(id: string) {
    if (player.id === id) {
        save();
    }

    const playerData = { ...saves.value[id], id: getUniqueID() };
    save(playerData as Player);

    settings.saves.push(playerData.id);
}

function deleteSave(id: string) {
    if (galaxy.value?.loggedIn === true) {
        galaxy.value.getSaveList().then(list => {
            const slot = Object.keys(list).find(slot => {
                const content = list[slot as unknown as number].content;
                try {
                    if (JSON.parse(content).id === id) {
                        return true;
                    }
                } catch (e) {
                    return false;
                }
            });
            if (slot != null) {
                galaxy.value?.save(parseInt(slot), "", "").catch(console.error);
            }
        });
    }
    settings.saves = settings.saves.filter((save: string) => save !== id);
    localStorage.removeItem(id);
    clearCachedSave(id);
}

function openSave(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    saves.value[player.id]!.time = player.time;
    save();
    clearCachedSave(player.id);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    loadSave(saves.value[id]!);
    // Delete cached version in case of opening it again
    clearCachedSave(id);
}

const isOpen = ref(false);
const currentTab = ref("behaviour");

const thresholdsSimple: SelectOption[] = [
    {
        label: '1',
        value: 0,
    },
    {
        label: '1e3',
        value: 1,
    },
    {
        label: '1e6',
        value: 2,
    },
    {
        label: '1e9',
        value: 3,
    },
    {
        label: '1e12',
        value: 4,
    }
]

const thresholds: SelectOption[] = [
    {
        label: '1',
        value: 0,
    },
    {
        label: '1e3',
        value: 1,
    },
    {
        label: '1e6',
        value: 2,
    },
    {
        label: '1e9',
        value: 3,
    },
    {
        label: '1e12',
        value: 4,
    },
    {
        label: '1e33',
        value: 5,
    },
    {
        label: '1e100',
        value: 6,
    },
    {
        label: '1e303',
        value: 7,
    },
    {
        label: '1e1000',
        value: 8,
    },
]

const precisionPlusOptions: SelectOption[] = [
    {
        label: '+1',
        value: 1,
    },
    {
        label: '+2',
        value: 2,
    },
    {
        label: '+3',
        value: 3,
    }
]

function isTab(tab: string): boolean {
    return tab == currentTab.value;
}

function setTab(tab: string) {
    currentTab.value = tab;
}
const down = Direction.Up; // Don't ask

const SettingFields = () => settingFields.map(f => render(f));

const { 
    showTPS,
    language,
    unthrottled,
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
const { autosave, offlineProd } = toRefs(player);
const isPaused = computed({
    get() {
        return player.devSpeed === 0;
    },
    set(value: boolean) {
        player.devSpeed = value ? 0 : null;
    }
});

const engineeringTooltip = <>Replaces Scientific with Engineering</>;
const precisionTooltip   = <>Multiplies decimal places [Configurable]</>;
const lettersTooltip     = <>Replaces Standard with Letters [Configurable]</>;
const blindTooltip       = <>Disables number rendering</>;
const yesnoTooltip       = <>Forces YES/NO notation</>;
const infinityTooltip    = <>Replaces Logarithmic with Infinity</>;
const standardTitle = () => (
    <span class="option-title">
        {settings.letterNumbers ? 'Letters' : 'Standard'}
    </span>
);
const scientificTitle = () => (
    <span class="option-title">
        {settings.engineering ? 'Engineering' : 'Scientific'}
    </span>
);
const logarithmicTitle = () => (
    <span class="option-title">
        {settings.infinityNumbers ? "Infinity" : "Logarithmic"}
    </span>
);
const lettersTitle = <span class="option-title">
    Letters Config
    <desc>Letters used in letters notation.</desc>
</span>;
const precisionTitle = <span class="option-title">
    Precision+ Config
    <desc>Decimal places increase.</desc>
</span>;
const unthrottledTitle = <span class="option-title">
    Unthrottled
    <desc>Allow the game to run as fast as possible. Not battery friendly.</desc>
</span>;
const offlineProdTitle = <span class="option-title">
    Offline Production<Tooltip display="Save-specific" direction={Direction.Right}>*</Tooltip>
    <desc>Simulate production that occurs while the game is closed.</desc>
</span>;
const autosaveTitle = <span class="option-title">
    Autosave<Tooltip display="Save-specific" direction={Direction.Right}>*</Tooltip>
    <desc>Automatically save the game every second or when the game is closed.</desc>
</span>;
const isPausedTitle = <span class="option-title">
    Pause game<Tooltip display="Save-specific" direction={Direction.Right}>*</Tooltip>
    <desc>Stop everything from moving.<br />Pressing <Hotkey hotkey={main.hotkey} /> toggles this.</desc>
</span>;
const bigModalTitle = <span class="option-title">
    Larger Modals
    <desc>Makes modals bigger. Might have visual bugs.</desc>
</span>;
const showTPSTitle = <span class="option-title">
    Show TPS
    <desc>Show TPS meter at the bottom-left corner of the page.</desc>
</span>;
const alignModifierUnitsTitle = <span class="option-title">
    Align modifier units
    <desc>Align numbers to the beginning of the unit in modifier view.</desc>
</span>;

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

<style>
.configurable-notation-modifier::after {
    font-size: 1em;
    display: inline-block;
    position: relative;
    top: 3px;
    font-family: 'Material Icons';
    content: 'tune';
    font-weight: lighter;
    left: 10px;
}

#notation-preview {
    columns: 2;
    break-inside: unset;
    display: block;
    padding: 10px;
    margin-left: 10px; margin-right: 10px;
    text-align: left
}

#notation-preview > p {
    width: 259.6px;
    margin: auto
}

@media screen and (max-width: 600px) {
    #notation-preview {
        columns: 1;
    }
}

.notation-thresholds {
    width: 75%;
}

.notation-thresholds>tr>td:first-child {
    width: 60%;
}

.notation-thresholds>tr>td:last-child {
    width: 40%;
}

.notation-list {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: flex-start;
    flex-direction: row;
    align-items: stretch;
    margin-left: 10px
}

.notation-list>div {
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

.notation-modifier>span {
    flex-grow: 1;
    display: inline-block
}

.notation-modifier>label {
    max-width: 40px;
    max-height: 52px;
    display: inline;
    margin: 0;
}

.notation-modifier-title {
    width: 400px;
    margin-bottom: 5px !important;
    font-size: 11.5px;
    opacity: 0.6;
    position: relative;
    width: 100%;
    text-align: center;
    display: block;
}

.notation-modifier-title:not(:first-child) {
    margin-top: 5px;
}

.notation-modifier-title:first-child {
    margin-top: -10px;
}

.subtitle {
    font-size: 15px;
    position: relative;
    width: 100%;
    text-align: center;
    display: block;
    opacity: 0.6;
}

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
