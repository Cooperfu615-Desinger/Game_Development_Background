<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Menu from 'primevue/menu'

const { locale } = useI18n()
const menu = ref()

const items = [
    {
        label: '繁體中文',
        icon: 'pi pi-check',
        command: () => setLocale('zh-TW'),
    },
    {
        label: 'English',
        icon: 'pi pi-check',
        command: () => setLocale('en'),
    },
]

const setLocale = (key: string) => {
    locale.value = key
    localStorage.setItem('locale', key)
}

const toggle = (event: Event) => {
    menu.value?.toggle(event)
}
</script>

<template>
    <Button
        type="button"
        text
        rounded
        aria-haspopup="true"
        aria-controls="language-menu"
        :aria-label="$t('common.changeLanguage') || 'Change language'"
        icon="pi pi-globe"
        class="lang-trigger"
        @click="toggle"
    />
    <Menu
        id="language-menu"
        ref="menu"
        :model="items"
        :popup="true"
    >
        <template #item="{ item, props }">
            <a
                v-bind="props.action"
                class="lang-item"
                :class="{ 'lang-item-active': (item.label === '繁體中文' && locale === 'zh-TW') || (item.label === 'English' && locale === 'en') }"
            >
                <i
                    :class="item.icon"
                    class="lang-check"
                    :style="{
                        visibility: (item.label === '繁體中文' && locale === 'zh-TW') || (item.label === 'English' && locale === 'en')
                            ? 'visible'
                            : 'hidden'
                    }"
                />
                <span>{{ item.label }}</span>
            </a>
        </template>
    </Menu>
</template>

<style scoped>
.lang-trigger {
    width: 2.25rem;
    height: 2.25rem;
}

.lang-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
}
.lang-item-active {
    color: var(--hig-blue);
    font-weight: 600;
}
.lang-check {
    font-size: 0.75rem;
    width: 1rem;
}
</style>
