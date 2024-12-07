<template>
    <div>
        <h2>Spoiler Warning</h2><br><br>

        v1.0 Universal - 202X-XX-XX<br>
        Port to Profectus, Rebalance, and Addition of Universes
        <ul>
            <li class="breaking">Ported to Profectus</li>
            <li class="breaking">Fully rebalanced existing content</li>
            <li class="feature">Breakdown Modals</li>
            <li class="feature">Help Menu</li>
            <li class="feature">This Changelog</li>
            <li class="feature">Save Bank</li>
            <li class="feature">Auto Machine</li>
            <li class="feature">Universal Time</li>
            <li class="fix">Fixed Most NaN Bugs</li>
            <li class="fix">Fixed Multiple Typos (Hopefully)</li>
            <li class="change">Changed Various Colours</li>
            <li class="change">Changed Achievements</li>
            <li class="change">Changed Certain Other Features</li>
        </ul><br>

        v0.3.1 Matter Paths - 2024-05-15<br>
        Addition of the Matters
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
        </ul><br>
        v0.3 Hyper - 2024-04-13<br>
        Addition of Hyper Rebirth
        <ul>
            <li class="balancing">Rebalanced Power</li>
            <li class="feature">Hyper Rebirth</li>
            <li class="feature">Hyper Cash</li>
            <li class="feature">Hyper Paths</li>
            <li class="fix">Fixed Power unlock</li>
            <li class="change">Changed some text</li>
            <li class="change">Changed challenge visuals</li>
        </ul><br>

        v0.2.1 Power - 2024-04-09<br>
        Addition of Power
        <ul>
            <li class="feature">Power</li>
            <li class="feature">Challenges</li>
            <li class="feature">Pylons</li>
        </ul><br>
        v0.2 Super - <time>2024-04-07</time><br>
        Addition of Super Rebirth
        <ul>
            <li class="feature">Super Rebirth</li>
            <li class="feature">Secret Achievements</li>
            <li class="fix">Fixed a NaN bug</li>
        </ul><br>

        v0.1 Rebirth - 2024-04-04<br>
        Initial release
        <ul>
            <li class="feature">Cash</li>
            <li class="feature">Rebirth</li>
            <li class="feature">The Machine</li>
            <li class="feature">Achievements</li>
        </ul>
    </div>
</template>

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
    content: "Bugfix";
    background: var(--accent2);
}

.balancing::before {
    content: "Balance";
    background: var(--accent3);
}

.breaking::before {
    content: "Major Change";
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
