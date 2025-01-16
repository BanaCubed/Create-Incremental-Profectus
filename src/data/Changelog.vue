<template>
    <div id="changelog"> <!-- This is in reversed order compared to ingame so that the auto-version number filling works properly -->
        <details>
            <summary class="major">Rebirth - <time>2024-04-04</time></summary>
            Initial release
            <ul>
                <li class="feature">Cash</li>
                <li class="feature">Rebirth</li>
                <li class="feature">The Machine</li>
                <li class="feature">Achievements</li>
            </ul>
        </details>

        <details>
            <summary class="major">Super - <time>2024-04-07</time></summary>
            Addition of Super Rebirth
            <ul>
                <li class="feature">Super Rebirth</li>
                <li class="feature">Secret Achievements</li>
                <li class="fix">Fixed a NaN bug</li>
            </ul>
        </details>

        <details>
            <summary class="minor">Power - <time>2024-04-09</time></summary>
            Addition of Power
            <ul>
                <li class="feature">Power</li>
                <li class="feature">Challenges</li>
                <li class="feature">Pylons</li>
            </ul>
        </details>

        <details>
            <summary class="major">Hyper - <time>2024-04-13</time></summary>
            Addition of Hyper Rebirth
            <ul>
                <li class="feature">Hyper Rebirth</li>
                <li class="feature">Hyper Cash</li>
                <li class="feature">Hyper Paths</li>
                <li class="fix">Fixed Power unlock</li>
                <li class="change">Changed some text</li>
                <li class="change">Changed challenge visuals</li>
                <li class="change">Rebalanced Power</li>
            </ul>
        </details>

        <details>
            <summary class="minor">Matter - <time>2024-05-15</time></summary>
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
            </ul>
        </details>

        <details open>
            <summary class="majorer">Universal - <time>202X-XX-XX</time></summary>
            Port to Profectus, Rebalance, and Addition of Universes
            <ul>
                <li class="breaking">Ported to Profectus</li>
                <li class="breaking">Fully rebalanced existing content</li>
                <li class="feature">Many Notation Options</li>
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
            </ul>
        </details>
    </div>
</template>

<style scoped>
details {
    margin: 5px 0;
    padding-left: 18px;
}

#changelog {
    display: flex;
    flex-direction: column-reverse;
    counter-reset: version-majorer 0 version-major 0 version-minor 0;
}

.minor {
    counter-increment: version-minor 1;
}

.major {
    counter-increment: version-major 1;
    counter-set: version-minor 0;
}

.majorer {
    counter-increment: version-majorer 1;
    counter-set: version-major 0 version-minor 0;
}

summary::before {
    content: "v" counter(version-majorer) "." counter(version-major) "." counter(version-minor) " - "
}

summary {
    cursor: pointer;
    margin-bottom: 10px;
    margin-left: -18px;
}

ul {
    margin: var(--feature-margin) 15px var(--feature-margin) -15px;
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
    content: "Added";
    background: var(--accent1);
}

.change::before {
    content: "Other";
    background: var(--bought);
}

.fix::before {
    content: "Fixed";
    background: var(--accent2);
}

.breaking::before {
    content: "Major";
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
