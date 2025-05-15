<template>
    <div class="tpsDisplay" v-if="!tps.isNan()">
        <span v-if="player.devSpeed === 0">Paused<br />
        </span>TPS: <TpsRender />
        <br />v0.5 - &beta;6<span v-if="commit !== null"> - {{ commit }}</span>
    </div>
</template>

<script setup lang="ts">
import player from "game/player";
import state from "game/state";
import Decimal, { format } from "util/bignum";
import { render } from "util/vue";
import { computed } from "vue";
import commit from "ci-addons/commit";

const tps = computed(() =>
    Decimal.div(
        state.lastTenTicks.length,
        state.lastTenTicks.reduce((acc, curr) => acc + curr, 0)
    )
);

const TpsRender = () => render(format(Decimal.div(state.lastTenTicks.length, state.lastTenTicks.reduce((acc, curr) => acc + curr, 0)), 0, false))
</script>

<style scoped>
.tpsDisplay {
    position: absolute;
    left: 10px;
    z-index: 100;
    bottom: 10px;
    line-height: 1em;
    text-align: left;
}

.low {
    color: var(--danger);
}

.fade-leave-to {
    opacity: 0;
}
</style>
