<template>
    <div class="field">
        <span class="field-title" v-if="titleComponent"
            ><component :is="titleComponent"
        /></span>
        <Tooltip :display="`${value}`" :class="{ fullWidth: !title }" :direction="Direction.Down">
            <input type="range" v-model="value" :min="min" :max="max" :step="step" />
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
import "components/common/fields.css";
import type { CoercableComponent } from "features/feature";
import Tooltip from "features/tooltips/Tooltip.vue";
import { computeOptionalComponent } from "util/vue";
import { Direction } from "util/common";
import { computed, toRefs, unref, toRef } from "vue";

const _props = defineProps<{
    title?: CoercableComponent;
    modelValue?: number;
    min?: number;
    max?: number;
    step?: number;
}>();

const emit = defineEmits<{
    (e: "update:modelValue", value: number): void;
}>();

const titleComponent = computeOptionalComponent(toRef(props, "title"), "span");

const value = computed({
    get() {
        return String(props.modelValue ?? 0);
    },
    set(value: string) {
        emit("update:modelValue", Number(value));
    }
});
</script>

<style scoped>
.fullWidth {
    width: 100%;
}
</style>
