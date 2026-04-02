<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NResult, NButton } from 'naive-ui'

const router = useRouter()
</script>

<template>
  <div class="h-screen flex items-center justify-center bg-[#101014]">
    <n-result
      status="403"
      title="403 Access Denied"
      description="You don't have permission to access this area."
    >
      <template #footer>
        <n-button @click="router.push('/login')">Switch Account</n-button>
        <n-button @click="router.go(-1)" class="ml-4">Go Back</n-button>
      </template>
    </n-result>
  </div>
</template>
