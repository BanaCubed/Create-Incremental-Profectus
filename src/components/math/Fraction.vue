<template>
    <div style="white-space: nowrap; display: inline-block;" class="fraction-wrapper">
        <div style="display: inline-block; padding-left: 0.2em; padding-right: 0.2em;">
            <slot name="numerator"><FormattedOne /></slot>
        </div><br />
        <div style="display: inline-block; border-top: 1px solid; padding-left: 0.2em; padding-right: 0.2em;">
            <slot name="denominator"><FormattedOne /></slot>
        </div>
    </div>
</template>

<script setup lang="tsx">
import { formatWhole } from 'util/bignum';
import { render } from 'util/vue';

const FormattedOne = () => render(formatWhole(1));
</script>

<style lang="css" scoped>
.fraction-wrapper {
    font-size: 0.8em;
    margin-top: -1em;
    translate: 0 calc(0.5em + 0.5px);
}
</style>
