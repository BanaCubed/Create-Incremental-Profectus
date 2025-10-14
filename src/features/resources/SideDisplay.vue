<template>
    <div id="currencies">
        <div
            v-for="(item, i) in currencies"
            class="item"
            :index="i"
            :style="{ '--color': item.color }"
        >
            <div class="values">
                <div class="number">
                    <component :is="format(item.resource.value)" />
                </div>
                <div class="number resource-oomps">
                    <component :is="item.oomps()" />
                </div>
            </div>
            <img :src="item.image" class="sprite" height="40" width="40" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { currencies } from "data/common";
import { format } from "util/bignum";
</script>

<style lang="css" scoped>
#currencies {
    display: flex;
    height: 100%;
    width: 100%;
    padding: 0em 0;
    box-sizing: border-box;
    flex-direction: column;
    justify-content: start;
}

.item {
    margin: 0;
    height: 2.5em;
    display: flex;
    justify-content: end;
    border: 4px solid rgba(255, 255, 255, 0.25);
    padding: 4px 0;
    border-width: 4px 0;
    background-image: linear-gradient(
        90deg,
        transparent 15%,
        rgb(from var(--color) r g b / 0.15) 40%,
        rgb(from var(--color) r g b / 0.45) 70%,
        rgb(from var(--color) r g b / 1)
    );
}

.values {
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.number {
    margin: 0;
    display: block;
    text-align: right;
}

.resource-oomps {
    font-size: 12px;
    font-weight: 450;
}

.sprite {
    margin: 0 6px 0 12px;
}
</style>
