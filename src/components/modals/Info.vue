<template>
    <Modal v-model="isOpen">
        <template v-slot:header>
            <div class="info-modal-header">
                <img class="info-modal-logo" v-if="logo" :src="logo" :alt="title" />
                <div class="info-modal-title">
                    <h2>{{ title }}</h2>
                    <h4>
                        v{{ versionNumber }}<span v-if="versionTitle">: {{ versionTitle }}</span>
                    </h4>
                </div>
                <div class="option-tabs">
                    <button :class="{selected: isTab('hotkeys')}" @click="setTab('hotkeys')">Info</button>
                    <button :class="{selected: isTab('credits')}" @click="setTab('credits')">Credits</button>
                    <button :class="{selected: isTab('changelog')}" @click="setTab('changelog')">Changelog</button>
                    <button :class="{selected: isTab('links')}" @click="setTab('links')">Links</button>
                    <button :class="{selected: isTab('formulas')}" @click="setTab('formulas')">Formulas</button>
                </div>
            </div>
        </template>
        <template v-slot:body="{ shown }">
            <div v-if="shown">
                <div v-if="isTab('hotkeys')">
                    <div>Time Played: {{ timePlayed }}</div>
                    <infoComponent />
                </div>
                <div v-if="isTab('credits')">
                    <div>Created by:<br>
                    <a target="_blank" href="https://banacubed.github.io/" style="width: fit-content; display: inline;"><span class="material-icons user-thingy">lightbulb terminal palette</span>BanaCubed</a><br>
                    <span style="width: fit-content; display: inline;"><span class="material-icons user-thingy">lightbulb palette</span>adoplayzz</span><br>
                    <span style="width: fit-content; display: inline;"><span class="material-icons user-thingy">lightbulb</span>Create_Incremental_Boy</span><br>
                    <span style="width: fit-content; display: inline;"><span class="material-icons user-thingy">lightbulb</span>EchoingLycanthrope</span><br>
                    <span style="width: fit-content; display: inline;"><span class="material-icons user-thingy">lightbulb</span>EdenGameMaster</span><br>
                    <span style="width: fit-content; display: inline;"><span class="material-icons user-thingy">lightbulb</span>galaxyuser63274</span><br>
                    <span style="width: fit-content; display: inline;"><span class="material-icons user-thingy">lightbulb</span>Shadow69420</span><br>

                    <br><span id="key"><span class="material-icons">lightbulb</span> Idea // <span class="material-icons">terminal</span> Code // <span class="material-icons">palette</span> Art // <span class="material-icons">translate</span> Translation<br>
                    For name change or addition of links contact @banacubed on discord<br>
                    Ideas can be submitted in the <a style="display: inline; width: fit-content;" target="_blank" href="https://galaxy.click/forum/thread/255">original forum</a> on galaxy</span>
                    </div><br>
                    <div>
                        Made in Profectus, by thepaperpilot with inspiration from Acameada and Jacorb
                    </div>
                </div>
                <div v-if="isTab('changelog')">
                    <Changelog />
                </div>
                <div v-if="isTab('links')">
                    <div style="margin-left: 12px; margin-top: 12px;" tab="links">
                        <div>
                            <a
                                href="https://galaxy.click/forum/thread/255"
                                class="info-modal-discord-link"
                                target="_blank"
                            >
                                <span class="material-icons info-modal-discord">forum</span>
                                Galaxy Forum Thread
                            </a>
                        </div>
                        <div>
                            <a
                                href="https://github.com/BanaCubed/Create-Incremental-Profectus/issues"
                                class="info-modal-discord-link"
                                target="_blank"
                            >
                                <span class="material-icons info-modal-discord">bug_report</span>
                                Bug Reports
                            </a>
                        </div><br>
                        <div>
                            <a
                                href="https://raw.githack.com/BanaCubed/Create-Incremental/dev/index.html"
                                class="info-modal-discord-link"
                                target="_blank"
                            >
                                <span class="material-icons info-modal-discord">auto_awesome</span>
                                Early Access Version
                            </a>
                        </div>
                        <div>
                            <a
                                href="https://banacubed.github.io/CI-Legacy"
                                class="info-modal-discord-link"
                                target="_blank"
                            >
                                <span class="material-icons info-modal-discord">history</span>
                                Legacy Version
                            </a>
                        </div><br>
                        <div>
                            <a
                                :href="discordLink"
                                v-if="discordLink"
                                class="info-modal-discord-link"
                                target="_blank"
                            >
                                <span class="material-icons info-modal-discord">discord</span>
                                {{ discordName }}
                            </a>
                        </div>
                        <div>
                            <a
                                href="https://discord.gg/yJ4fjnjU54"
                                class="info-modal-discord-link"
                                target="_blank"
                            >
                                <span class="material-icons info-modal-discord">discord</span>
                                Profectus & Friends
                            </a>
                        </div>
                        <div>
                            <a
                                href="https://discord.gg/F3xveHV"
                                class="info-modal-discord-link"
                                target="_blank"
                            >
                                <span class="material-icons info-modal-discord">discord</span>
                                The Modding Tree
                            </a>
                        </div>
                        <div>
                            <a
                                href="https://discord.gg/6FD2bYMqV9"
                                class="info-modal-discord-link"
                                target="_blank"
                            >
                                <span class="material-icons info-modal-discord">discord</span>
                                galaxy.click
                            </a>
                        </div>
                    </div>
                </div>
                <div v-if="isTab('formulas')">
                    <div>
                        <h2>Unfinished</h2><br>
                        
                        <h2>Cash</h2> <br /><br />
                        $ is a shortening of Cash <br /> <br />
                        { cash.upgs.three.bought.value ? <span>Cash UPG 3     log<sub>5</sub>($+1)+1<br /></span> : null }
                        { cash.upgs.five.bought.value ? <span>Cash UPG 5    (log<sub>8</sub>($+1)+1)<sup>0.8</sup><br /></span> : null }
                        { cash.upgs.six.bought.value ? <span>Cash UPG 6    (log<sub>6</sub>($+1)+1)<sup>0.6</sup><br /></span> : null }
                        { cash.upgs.nine.bought.value ? <span>Cash UPG 9    (log<sub>100,000</sub>($+1)+1)<sup>1.5</sup><br /></span> : null }
                        { cash.upgs.ten.bought.value ? <span>Cash UPG 10    log<sub>100</sub>($+1)+1<br /></span> : null }
                        
                        <h2>Rebirth</h2> <br /><br />
                        RP is a shortening of Rebirth Points <br /> <br />
                        <span>RP Gain       ($/100,000)<sup>0.5</sup><br /></span>
                        <span>RP Effect     (log<sub>10</sub>(RP+1)+1)<sup>2</sup><br /></span>
                        { rebirth.upgs.one.bought.value ? <span>RP UPG 3       2<sup>Upgrades</sup><br /></span> : null }
                        { rebirth.upgs.nine.bought.value ? <span>RP UPG 9       log<sub>3</sub>(RP+1)+1<br /></span> : null }
                        { rebirth.upgs.ten.bought.value ? <span>RP UPG 10      log<sub>10,000</sub>($+1)+1<br /></span> : null }
                        { rebirth.upgs.six.bought.value ? <span>RP BUY 1       1.25<sup>Amount</sup> (Base)<br /></span> : null }
                        { rebirth.upgs.six.bought.value ? <span>RP BUY 2       0.05×Amount<br /></span> : null }
                        
                        <h2>Super Rebirth</h2> <br /><br />
                        SRP is a shortening of Rebirth Points <br /> <br />
                        <span>SRP Gain        log<sub>100</sub>(RP/1e14)<sup>2.4</sup><br /></span>
                        <span>SRP to Cash    (SRP+1)<sup>1.75</sup><br /></span>
                        <span>SRP to RP      (SRP+1)<sup>1.25</sup><br /></span>
                    </div>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="tsx">
import Modal from "./Modal.vue";
import Changelog from "data/Changelog.vue";
import { main } from "data/projEntry";
import projInfo from "data/projInfo.json";
import { jsx } from "features/feature";
import player from "game/player";
import { infoComponents } from "game/settings";
import { formatTime, formatWhole } from "util/bignum";
import { coerceComponent, render } from "util/vue";
import { computed, ref, toRefs, unref } from "vue";

const { title, logo, author, discordName, discordLink, versionNumber, versionTitle } = projInfo;

const _props = defineProps<{ changelog: typeof Changelog | null }>();
const props = toRefs(_props);

const isOpen = ref(false);

const timePlayed = computed(() => formatTime(player.timePlayed));

const infoComponent = computed(() => {
    return coerceComponent(jsx(() => (<>{infoComponents.map(render)}</>)));
});

const currentTab = ref("hotkeys");

function isTab(tab: string): boolean {
    return tab == currentTab.value;
}

function setTab(tab: string) {
    currentTab.value = tab;
}

defineExpose({
    isTab,
    setTab,
    open() {
        isOpen.value = true;
    }
});
</script>

<style scoped>
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

.info-modal-header {
    margin: -20px;
    margin-bottom: 0;
    background: var(--raised-background);
    align-items: center;
}

.info-modal-header * {
    margin: 0;
}

[tab=links] a::before {
    content: "> " attr(href);
    position: relative;
    font-size: 0.6em;
    text-align: left;
    left: 20px;
    color: var(--highlighted);
    width: 0;
    white-space: nowrap;
    text-shadow: none !important;
    top: 14px;
}

[tab=links] a {
    margin-bottom: 12px;
}

.info-modal-logo {
    height: 4em;
    width: 4em;
}

.info-modal-title {
    display: flex;
    flex-direction: column;
    padding: 10px 0;
    margin-left: 10px;
}

.info-modal-discord-link {
    display: flex;
    align-items: center;
}

.info-modal-discord {
    margin: 0;
    margin-right: 4px;
}

.user-thingy {
    font-size: 20px;
    display: inline-block;
    position: relative;
    top: 4px;
    width: 30%;
    text-align: right;
    padding-right: 3px;
}

#key {
    color: var(--highlighted);
    font-size: 10px;
    display: block;
    width: 100%;
    text-align: center;
}

#key>.material-icons {
    font-size: 10px;
    display: inline-block;
    position: relative;
    top: 1.5px;
}
</style>
