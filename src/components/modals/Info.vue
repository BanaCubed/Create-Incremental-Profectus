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
            </div>
        </template>
        <template v-slot:body="{ shown }">
            <div v-if="shown">
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
                    Ideas can be submitted in the <a style="display: inline; width: fit-content;" target="_self" href="https://galaxy.click/forum/thread/255">original forum</a> on galaxy</span>
                </div><br>
                <div>
                    Made in Profectus, by thepaperpilot with inspiration from Acameada and Jacorb
                </div>
                <br />
                <span style="width: fit-content; display: inline;" class="link" @click="openChangelog"><span class="material-icons user-thingy">history</span>Changelog</span>
                <br /><br />
                <div style="margin-left: calc(30% - 24px);">
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
                </div>
                <br />
                <div>Time Played: {{ timePlayed }}</div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="tsx">
import type Changelog from "data/Changelog.vue";
import projInfo from "data/projInfo.json";
import { jsx } from "features/feature";
import player from "game/player";
import { infoComponents } from "game/settings";
import { formatTime } from "util/bignum";
import { coerceComponent, render } from "util/vue";
import { computed, ref, toRefs, unref } from "vue";
import Modal from "./Modal.vue";

const { title, logo, author, discordName, discordLink, versionNumber, versionTitle } = projInfo;

const _props = defineProps<{ changelog: typeof Changelog | null }>();
const props = toRefs(_props);

const isOpen = ref(false);

const timePlayed = computed(() => formatTime(player.timePlayed));

const infoComponent = computed(() => {
    return coerceComponent(jsx(() => (<>{infoComponents.map(render)}</>)));
});

defineExpose({
    open() {
        isOpen.value = true;
    }
});

function openChangelog() {
    unref(props.changelog)?.open();
}
</script>

<style scoped>
.info-modal-header {
    display: flex;
    margin: -20px;
    margin-bottom: 0;
    background: var(--raised-background);
    align-items: center;
}

.info-modal-header * {
    margin: 0;
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
