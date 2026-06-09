<!--
    SectionCard — Apple HIG 卡片容器
    From: reference demo (adapted to use --hig-* tokens)

    Header slot 放標題 + description，body 放任何內容。
    與其他 .hig-card 視覺一致，但提供獨立的 header padding 與分隔線。
-->
<template>
    <section class="section-card">
        <header v-if="$slots.header" class="section-card-head">
            <slot name="header" />
        </header>
        <slot />
    </section>
</template>

<style scoped>
.section-card {
    min-width: 0;
    padding: 1.25rem;
    background: var(--hig-bg-surface);
    border: 1px solid var(--hig-border-default);
    border-radius: var(--hig-radius-card);
    box-shadow: var(--hig-shadow-sm);
}

.section-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.section-card :deep(h2) {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
    color: var(--hig-text-primary);
    letter-spacing: -0.01em;
}

.section-card :deep(h3) {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--hig-text-primary);
}

.section-card-head :deep(p) {
    margin: 0.375rem 0 0;
    color: var(--hig-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.5;
}
</style>
