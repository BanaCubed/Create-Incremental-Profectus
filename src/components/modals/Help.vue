<template>
    <Modal v-model="isOpen">
        <template v-slot:header>
            <div class="info-modal-header">
                <img class="info-modal-logo" v-if="logo" :src="logo" :alt="title" />
                <div class="info-modal-title">
                    <h2>{{ title }} Help</h2>
                    <h4>
                        v{{ versionNumber }}: {{ versionTitle }}
                    </h4>
                </div>
            </div>
        </template>
        <template v-slot:body="{ shown }">
            <div v-if="shown">
                <component :is="tabsComp" />
            </div>
        </template>
    </Modal>
</template>

<script setup lang="tsx">
import Modal from "components/modals/Modal.vue";
import type Changelog from "data/Changelog.vue";
import cash from "data/layers/cash";
import Tooltip from "features/tooltips/Tooltip.vue";
import projInfo from "data/projInfo.json";
import { jsx } from "features/feature";
import { createTab } from "features/tabs/tab";
import { createTabFamily } from "features/tabs/tabFamily";
import player from "game/player";
import { infoComponents } from "game/settings";
import Decimal, { formatTime } from "util/bignum";
import { coerceComponent, render } from "util/vue";
import { computed, ref, toRefs, unref } from "vue";
import rebirth from "data/layers/rebirth";
import { main } from "data/projEntry";
import srebirth from "data/layers/super";

const { title, logo, author, discordName, discordLink, versionNumber, versionTitle } = projInfo;

const _props = defineProps<{ changelog: typeof Changelog | null }>();
const props = toRefs(_props);

const isOpen = ref(false);

const timePlayed = computed(() => formatTime(player.timePlayed));

const tabsComp = computed(() => {
    return coerceComponent(jsx(() => (
        <>
            {render(tabs)}
        </>
    )));
});

defineExpose({
    open() {
        isOpen.value = true;
    }
});

function openChangelog() {
    unref(props.changelog)?.open();
}

const guideTabs = createTabFamily({
    cash: () => ({
        display: 'Cash',
        glowColor: cash.color,
        tab: createTab(() => ({
            display: jsx(() => (
                <>
                    <br />
                    <span>
                        <h2>Cash</h2> <br /><sup style="color: var(--highlighted)">Updated 2024-11-03</sup> <br />
                        This section of the game is very straightforward, just buy the upgrades whenever you can. <br /><br />
                    </span>
                </>
            )),
        })),
    }),
    rebirth: () => ({
        display: 'Rebirth',
        glowColor: rebirth.color,
        visibility() {
            return Decimal.gte(main.progression.value, 0.9);
        },
        tab: createTab(() => ({
            display: jsx(() => (
                <>
                    <br />
                    <span>
                        <h2>Rebirth</h2> <br /><sup style="color: var(--highlighted)">Updated 2024-11-03</sup> <br />
                        TBA // To Be Added
                    </span>
                </>
            )),
        })),
    }),
})

const formulaTabs = createTabFamily({
    cash: () => ({
        display: 'Cash',
        glowColor: cash.color,
        tab: createTab(() => ({
            display: jsx(() => (
                <>
                    <br />
                    <span>
                        <h2>Cash</h2> <br /><br />
                        $ is a shortening of Cash <br /> <br />
                        { cash.upgs.three.bought.value ? <span>Cash UPG 3     log<sub>5</sub>($+1)+1<br /></span> : null }
                        { cash.upgs.five.bought.value ? <span>Cash UPG 5    (log<sub>8</sub>($+1)+1)<sup>0.8</sup><br /></span> : null }
                        { cash.upgs.six.bought.value ? <span>Cash UPG 6    (log<sub>6</sub>($+1)+1)<sup>0.6</sup><br /></span> : null }
                        { cash.upgs.nine.bought.value ? <span>Cash UPG 9    (log<sub>100,000</sub>($+1)+1)<sup>1.5</sup><br /></span> : null }
                        { cash.upgs.ten.bought.value ? <span>Cash UPG 10    log<sub>100</sub>($+1)+1<br /></span> : null }
                    </span>
                </>
            )),
        })),
    }),
    rebirth: () => ({
        display: 'Rebirth',
        glowColor: rebirth.color,
        visibility() {
            return Decimal.gte(main.progression.value, 0.9);
        },
        tab: createTab(() => ({
            display: jsx(() => (
                <>
                    <br />
                    <span>
                        <h2>Rebirth</h2> <br /><br />
                        RP is a shortening of Rebirth Points <br /> <br />
                        <span>RP Gain       ($/100,000)<sup>0.5</sup><br /></span>
                        <span>RP Effect     (log<sub>10</sub>(RP+1)+1)<sup>2</sup><br /></span>
                        { rebirth.upgs.one.bought.value ? <span>RP UPG 3       2<sup>Upgrades</sup><br /></span> : null }
                        { rebirth.upgs.nine.bought.value ? <span>RP UPG 9       log<sub>3</sub>(RP+1)+1<br /></span> : null }
                        { rebirth.upgs.ten.bought.value ? <span>RP UPG 10      log<sub>10,000</sub>($+1)+1<br /></span> : null }
                        { rebirth.upgs.six.bought.value ? <span>RP BUY 1       1.25<sup>Amount</sup> (Base)<br /></span> : null }
                        { rebirth.upgs.six.bought.value ? <span>RP BUY 2       0.05×Amount<br /></span> : null }
                    </span>
                </>
            )),
        })),
    }),
    super: () => ({
        display: 'Super',
        glowColor: srebirth.color,
        visibility() {
            return Decimal.gte(main.progression.value, 3.9);
        },
        tab: createTab(() => ({
            display: jsx(() => (
                <>
                    <br />
                    <span>
                        <h2>Super Rebirth</h2> <br /><br />
                        SRP is a shortening of Rebirth Points <br /> <br />
                        <span>SRP Gain        log<sub>100</sub>(RP/1e14)<sup>2.4</sup><br /></span>
                        <span>SRP to Cash    (SRP+1)<sup>1.75</sup><br /></span>
                        <span>SRP to RP      (SRP+1)<sup>1.25</sup><br /></span>
                    </span>
                </>
            )),
        })),
    }),
})

const tabs = createTabFamily({
    general: () => ({
        display: 'General',
        glowColor: 'var(--accent1)',
        tab: createTab(() => ({
            display: jsx(() => (
                <>
                    <br />
                    <span>
                        <h2>Welcome</h2> <br />
                        Welcome to the Help Modal! <br />
                        This Modal contains two main tabs: <br />
                        - General <br />
                        {/* - Guides <br /> */}
                        - Formulae <br /><br /><br />
                        <h2>Notes</h2><br />
                        When a buyable spends nothing, it always buys max<br /><br /><br />
                        <h2>Hotkeys</h2> <br />
                        {infoComponents.map(render)}
                    </span>
                </>
            )),
        })),
    }),
    // guide: () => ({
    //     display: 'Guides',
    //     glowColor: 'var(--accent2)',
    //     tab: createTab(() => ({
    //         display: jsx(() => (
    //             <>
    //                 <br />
    //                 {render(guideTabs)}
    //             </>
    //         )),
    //     })),
    // }),
    formula: () => ({
        display: 'Formulae',
        glowColor: 'var(--accent3)',
        tab: createTab(() => ({
            display: jsx(() => (
                <>
                    <br />
                    <span>Upgrade formulae only appear when owned <br /> <br /></span>
                    {render(formulaTabs)}
                </>
            )),
        })),
    }),
})
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
</style>
