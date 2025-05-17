<template>
    <div
        class="main-display-container"
        :class="classes ?? {}"
        :style="[{ height: `${displayRef?.clientHeight ?? 0}px` }, style ?? {}]"
    >
        <div class="main-display" ref="displayRef">
            <span v-if="showPrefix">You have </span>
            <ResourceVue :resource="resource" :color="color || 'white'" />
            {{ resource.displayName
            }}<!-- remove whitespace -->
            <span
                v-if="typeof pinRef === 'boolean'"
                class="material-icons"
                @click="(props.pin as unknown as Ref<boolean>).value = props.pin?.value !== true"
                >{{ pinRef === true ? "visibility_off" : "visibility" }}</span
            >
            <span v-if="effectDisplay">, <Effect /></span>
        </div>
    </div>
</template>

<script setup lang="tsx">
import type { Resource } from "./resource";
import ResourceVue from "features/resources/Resource.vue";
import Decimal from "util/bignum";
import { MaybeGetter } from "util/computed";
import { Renderable } from "util/vue";
import { computed, CSSProperties, Ref, ref, toValue } from "vue";
import { JSX } from "vue/jsx-runtime";

const props = defineProps<{
    resource: Resource;
    color?: string;
    classes?: Record<string, boolean>;
    style?: CSSProperties;
    effectDisplay?: MaybeGetter<Renderable>;
    pin?: Ref<boolean>;
}>();

const displayRef = ref<Element | null>(null);

const pinRef = props.pin ?? ref(undefined);
const Effect = () => toValue(props.effectDisplay);

const showPrefix = computed(() => {
    return Decimal.lt(props.resource.value, "1e1000");
});
</script>

<style>
.main-display-container {
    vertical-align: middle;
    /* margin-bottom: 20px; */
    display: flex;
    align-items: baseline;
    transition-duration: 0s;
}

.main-display {
    margin-bottom: 0;
}
</style>

<style lang="css" scoped>
.material-icons {
    font-size: 20px;
    display: inline-block;
    position: relative;
    translate: 0 5px;
    margin-left: 6px;
    margin-right: 6px;
    cursor: pointer;
}

.material-icons:hover {
    text-shadow: 0 0 15px var(--foreground);
}
</style>
