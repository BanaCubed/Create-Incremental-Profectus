<template>
    <div class="tpsDisplay" v-if="!tps.isNan()">TPS: {{ formatWhole(tps) }}</div>
    <div class="tpsDisplay2">v1.0 β4</div>
</template>

<script setup lang="ts">
import state from "game/state";
import Decimal, { formatWhole } from "util/bignum";
import { computed } from "vue";

const tps = computed(() =>
    Decimal.div(
        state.lastTenTicks.length,
        state.lastTenTicks.reduce((acc, curr) => acc + curr, 0)
    )
);
</script>

<style scoped>
.tpsDisplay, .tpsDisplay2 {
    position: absolute;
    left: 10px;
    z-index: 100;
}

.tpsDisplay {
    bottom: 25px;
}

.tpsDisplay2 {
    bottom: 10px;
}

.low {
    color: var(--danger);
}

.fade-leave-to {
    opacity: 0;
}
</style>
