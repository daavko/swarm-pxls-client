<template>
    <h2>Mod Alert</h2>
    <p class="message">{{ message }}</p>
    <p class="sender">Sent by: {{ sender }}</p>
</template>

<script setup lang="ts">
defineProps<{ sender: string; message: string }>();
</script>

<style scoped>
h2 {
    text-align: center;
    margin-bottom: 16px;
}

.message {
    margin-bottom: 8px;
}

.sender {
    margin-top: auto;
    font-size: 0.875rem;
    color: #888;
}
</style>
