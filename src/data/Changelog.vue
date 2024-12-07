<template>
    <Modal v-model="isOpen">
        <template v-slot:header>
            <div class="header">
                <h2>Changelog</h2>
            </div>
        </template>
        <template v-slot:body>
            <details open>
                <summary>v1.0 Universal - <time>2024-XX-XX</time></summary>
                Port to Profectus, Rebalance, and Major Content update
                <ul>
                    <li class="breaking">Ported to Profectus</li>
                    <li class="breaking">Fully rebalanced existing content</li>
                    <li class="feature">Breakdown Modals</li>
                    <li class="feature">Help Menu</li>
                    <li class="feature">Save Bank</li>
                    <li class="feature">Auto Machine</li>
                    <li class="feature">Universal Time</li>
                    <li class="fix">Fixed multiple NaN bugs</li>
                    <li class="fix">Fixed multiple typos</li>
                    <li class="change">Changed various colours</li>
                    <li class="change">Changed Achievements</li>
                    <li class="change">Changed Certain features</li>
                </ul>
            </details>

            <details>
                <summary>v0.3 Hyper - <time>2024-04-13</time></summary>
                v0.3.1 Matter Paths - <time>2024-05-15</time><br>
                Addition of the Matter Paths
                <ul>
                    <li class="feature">Matter Paths</li>
                    <li class="feature">Matter</li>
                    <li class="feature">Antimatter</li>
                    <li class="feature">Dark Matter & Black Hole</li>
                    <li class="feature">Exotic Matter & Hypotheory</li>
                    <li class="feature">Hotkeys</li>
                    <li class="fix">Fixed multiple NaN bugs</li>
                    <li class="fix">Fixed multiple typos</li>
                    <li class="fix">Fixed a certain Power milestone</li>
                    <li class="change">Softcap visual overhaul</li>
                </ul>
                v0.3 Hyper - <time>2024-04-13</time><br>
                Addition of the third reset layer
                <ul>
                    <li class="balancing">Rebalanced Power</li>
                    <li class="feature">Hyper Rebirth</li>
                    <li class="feature">Hyper Cash</li>
                    <li class="feature">Hyper Paths</li>
                    <li class="fix">Fixed Power unlock</li>
                    <li class="change">Changed some text</li>
                    <li class="change">Changed challenge visuals</li>
                </ul>
            </details>

            <details>
                <summary>v0.2 Super - <time>2024-04-07</time></summary>
                v0.2.1 Power - <time>2024-04-09</time><br>
                Addition of an extremely unbalanced polynomial currency
                <ul>
                    <li class="feature">Power</li>
                    <li class="feature">Challenges</li>
                    <li class="feature">Pylons</li>
                </ul>
                v0.2 Super - <time>2024-04-07</time><br>
                Addition of the second reset layer
                <ul>
                    <li class="feature">Super Rebirth</li>
                    <li class="feature">Secret Achievements</li>
                    <li class="fix">Fixed a NaN bug</li>
                </ul>
            </details>

            <details>
                <summary>v0.1 Rebirth - <time>2024-04-04</time></summary>
                Initial released version of the game
                <ul>
                    <li class="feature">Cash</li>
                    <li class="feature">Rebirth</li>
                    <li class="feature">The Machine</li>
                    <li class="feature">Achievements</li>
                </ul>
            </details>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from "components/modals/Modal.vue";
import { ref } from "vue";

const isOpen = ref(false);

defineExpose({
    open() {
        isOpen.value = true;
    }
});
</script>

<style scoped>
details {
    margin: 10px 0;
    padding-left: 18px;
}

summary {
    cursor: pointer;
    margin-bottom: 10px;
    margin-left: -18px;
}

ul {
    margin: var(--feature-margin) 0;
    background: var(--raised-background);
    border: 2px solid rgba(0, 0, 0, 0.125);
    padding: 5px 5px 5px 15px;
    list-style: inside;
}

li {
    margin: 8px 0;
}

li::before {
    padding: 2px 8px;
    margin-right: 8px;
    border-radius: var(--border-radius);
}

.feature::before {
    content: "Feature";
    background: var(--accent1);
}

.change::before {
    content: "Change";
    background: var(--bought);
}

.fix::before {
    content: "Fix";
    background: var(--accent2);
}

.balancing::before {
    content: "Balancing";
    background: var(--accent3);
}

.breaking::before {
    content: "Breaking";
    background: var(--danger);
}

.header {
    margin: -20px;
    margin-bottom: 0;
    padding: 10px;
    padding-bottom: 10px;
    background: var(--raised-background);
}
</style>
