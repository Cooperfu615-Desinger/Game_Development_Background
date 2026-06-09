<!--
    MainLayout — 已切換到 Sakai Layout（Apple HIG 主題）

    這個檔案在 Phase 2 改成 AppLayout 的薄包裝。
    舊的 Naive UI Layout 程式碼已封存於 git history（commit d21ab0d 之前）。

    內頁仍使用 Naive UI（Phase 4 才會逐頁切換），所以視覺上會看到：
       Apple HIG 外殼（毛玻璃 topbar + sidebar）
        + Naive UI 內頁（科幻 dark cards 等）
    這是過渡期的預期狀態。
-->
<script setup lang="ts">
import AppLayout from './sakai/AppLayout.vue'
</script>

<template>
    <AppLayout />
</template>
