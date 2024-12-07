<template>
    <teleport to="#modal-root">
        <transition
            name="modal"
            @before-enter="isAnimating = true"
            @after-leave="isAnimating = false"
            appear
        >
            <div
                class="modal-mask"
                v-show="modelValue"
                v-on:pointerdown.self="close"
                v-bind="$attrs"
            >
                <div class="modal-wrapper">
                    <div class="modal-container" :width="width">
                        <div class="modal-header">
                            <slot name="header" :shown="isOpen"> default header </slot>
                        </div>
                        <div class="modal-body">
                            <Context ref="contextRef">
                                <slot name="body" :shown="isOpen"> default body </slot>
                            </Context>
                        </div>
                        <div class="modal-footer">
                            <slot name="footer" :shown="isOpen">
                                <div class="modal-default-footer">
                                    <div class="modal-default-flex-grow"></div>
                                    <button class="button modal-default-button" @click="close">
                                        Close
                                    </button>
                                </div>
                            </slot>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
import type { FeatureNode } from "game/layers";
import { computed, ref, toRefs, unref } from "vue";
import Context from "../Context.vue";

const _props = defineProps<{
    modelValue: boolean;
    preventClosing?: boolean;
    width?: string;
}>();
const props = toRefs(_props);
const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
}>();

const isOpen = computed(() => unref(props.modelValue) || isAnimating.value);
function close() {
    if (unref(props.preventClosing) !== true) {
        emit("update:modelValue", false);
    }
}

const isAnimating = ref(false);

const contextRef = ref<typeof Context | null>(null);
const nodes = computed<Record<string, FeatureNode | undefined> | null>(
    () => contextRef.value?.nodes ?? null
);

defineExpose({ isOpen, nodes });
</script>

<style>
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.35);
    transition: opacity 0.3s ease;
    backdrop-filter: blur(10px);
    background-image: radial-gradient(circle, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.25) 100%);
}

.modal-wrapper {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.modal-container {
    width: 640px;
    max-width: 95vw;
    max-height: calc(100vh - 30px);
    background-color: var(--background);
    padding: 20px;
    border-radius: var(--border-radius);
    transition: all 0.3s ease;
    text-align: left;
    border: var(--modal-border);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: clip;
    box-shadow: 0 12px 12px 6px rgba(0, 0, 0, 0.3);
    mix-blend-mode: soft-light;
}

.modal-header {
    width: 100%;
}

.modal-body {
    margin: 20px 0;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
}

.modal-footer {
    width: 100%;
}

.modal-default-footer {
    display: flex;
}

.modal-default-flex-grow {
    flex-grow: 1;
}

.modal-enter-from {
    opacity: 0;
}

.modal-leave-active {
    opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-active .modal-container {
    filter: blur(15px);
    transform: scale(1.05);
}
</style>
