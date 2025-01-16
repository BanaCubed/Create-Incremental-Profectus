<template>
    <h2 :style="{ color, 'text-shadow': '0px 0px 10px ' + color }">
        <Amount />
    </h2>
</template>

<script setup lang="ts">
import type { Resource } from "./resource";
import { displayResource } from "./resource";
import { render } from "util/vue";
import { computed } from "vue";

const props = defineProps<{
    resource: Resource;
    color: string;
}>();

const Amount = () => render(displayResource(props.resource));
</script>
