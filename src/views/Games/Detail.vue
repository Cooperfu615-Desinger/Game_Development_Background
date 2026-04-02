<script setup lang="ts">
import { NCard, NText } from 'naive-ui'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">遊戲詳情 #{{ route.params.id }}</h1>
    <n-card>
      <n-text depth="3">Game Detail — Week 3 實作</n-text>
    </n-card>
  </div>
</template>
