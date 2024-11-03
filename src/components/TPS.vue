<template>
    <div class="tpsDisplay" v-if="!tps.isNan()">TPS: {{ format(tps) }}</div>
    <div class="tpsDisplay2" v-if="!tps.isNan()">v1.0 β4 α2</div>
</template>

<script setup lang="ts">
import state from "game/state";
import Decimal, { format } from "util/bignum";
import { computed } from "vue";

const tps = computed(() =>
    Decimal.div(
        state.lastTenTicks.length,
        state.lastTenTicks.reduce((acc, curr) => acc + curr, 0)
    )
);
</script>

<style scoped>
.tpsDisplay {
    position: absolute;
    left: 10px;
    bottom: 26px;
    z-index: 100;
}

.tpsDisplay2 {
    position: absolute;
    left: 10px;
    bottom: 10px;
    z-index: 100;
}

.low {
    color: var(--danger);
}

.fade-leave-to {
    opacity: 0;
}
</style>
