<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NResult, NButton } from 'naive-ui'

const router = useRouter()
</script>

<template>
  <div class="h-screen flex items-center justify-center bg-[#101014]">
    <n-result
      status="404"
      title="404 Not Found"
      description="You're lost in space. The page you are looking for does not exist."
    >
      <template #footer>
        <n-button @click="router.push('/')">Go Home</n-button>
      </template>
    </n-result>
  </div>
</template>
