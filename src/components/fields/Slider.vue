<template>
    <div class="field">
        <span class="field-title" v-if="title">
            <Title />
        </span>
        <Tooltip :display="`${value}`" :class="{ fullWidth: !title }" :direction="Direction.Down">
            <input type="range" v-model="value" :min="min" :max="max" :step="step" />
        </Tooltip>
    </div>
</template>

<script setup lang="tsx">
import "components/common/fields.css";
import Tooltip from "wrappers/tooltips/Tooltip.vue";
import { render, Renderable } from "util/vue";
import { Direction } from "util/common";
import { computed, toRefs, unref, toRef } from "vue";
import { MaybeGetter } from "util/computed";

const _props = defineProps<{
    title?: MaybeGetter<Renderable>;
    modelValue?: number;
    min?: number;
    max?: number;
    step?: number;
}>();

const emit = defineEmits<{
    (e: "update:modelValue", value: number): void;
}>();

const Title = () => _props.title == null ? <></> : render(_props.title, el => <span>{el}</span>);

const value = computed({
    get() {
        return String(_props.modelValue ?? 0);
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
