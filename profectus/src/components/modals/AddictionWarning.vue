<template>
    <Modal v-model="isOpen" v-bind="$attrs">
        <template v-slot:header>
            <div class="vga-modal-header">
                <h2>Please consider taking a break.</h2>
            </div>
        </template>
        <template v-slot:body>
            <p>
                You've been actively enjoying this game for a while recently - and it's great that
                you've been having a good time! That said, there are dangers to games like these that you should be aware of.
            </p>
            <h4>Resources:</h4>
            <p>
                <a href="https://www.reddit.com/r/incremental_games/">r/StopGaming</a>
            </p>
        </template>
        <template v-slot:footer>
            <div class="vga-footer">
                <button @click="neverShow" class="button">Never show this again</button>
                <button @click="isOpen = false" class="button">Close</button>
            </div>
        </template>
    </Modal>
    <SavesManager ref="savesManager" />
</template>

<script setup lang="ts">
import projInfo from "data/projInfo.json";
import settings from "game/settings";
import state from "game/state";
import { ref, watchEffect } from "vue";
import Modal from "./Modal.vue";
import SavesManager from "./SavesManager.vue";

const isOpen = ref(false);
watchEffect(() => {
    if (
        projInfo.disableHealthWarning === false &&
        settings.showHealthWarning &&
        state.mouseActivity.filter(i => i).length > 6
    ) {
        isOpen.value = true;
    }
});

function neverShow() {
    settings.showHealthWarning = false;
    isOpen.value = false;
}
</script>

<style scoped>
.vga-modal-header {
    padding-top: 10px;
    margin-left: 10px;
}

.vga-footer {
    display: flex;
    justify-content: flex-end;
}

.vga-footer button {
    margin: 0 10px;
}

p {
    margin-bottom: 10px;
}
</style>
