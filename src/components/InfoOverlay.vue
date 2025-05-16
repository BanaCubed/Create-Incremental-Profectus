<template>
    <TransitionGroup name="infos" tag="div" class="tpsDisplay">
        <div key="0" style="--i: 0" v-if="!tps.isNan()">TPS: <TpsRender /></div>
        <div key="1" style="--i: 1" v-if="devSpeed === 0">Paused</div>
    </TransitionGroup>
</template>

<script setup lang="ts">
import player from "game/player";
import state from "game/state";
import Decimal, { format } from "util/bignum";
import { render } from "util/vue";
import { computed, toRefs } from "vue";

const { devSpeed } = toRefs(player);

const tps = computed(() =>
    Decimal.div(
        state.lastTenTicks.length,
        state.lastTenTicks.reduce((acc, curr) => acc + curr, 0)
    )
);

const TpsRender = () => format(tps.value, 0, false);
</script>

<style scoped>
.tpsDisplay {
    position: absolute;
    left: 10px;
    z-index: 100;
    bottom: 10px;
    line-height: 1em;
    text-align: left;
    display: flex;
    flex-direction: column-reverse;
    align-items: flex-start;
}

.tpsDisplay > * {
    width: 100%;
    transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.infos-enter-from,
.infos-leave-to {
    translate: -45px 0;
    opacity: 0;
}

.infos-leave-to {
    translate: -45px calc(var(--i) * -16px);
}
.infos-leave-from {
    translate: 0 calc(var(--i) * -16px);
}

.infos-leave-active {
    position: absolute;
}
</style>
