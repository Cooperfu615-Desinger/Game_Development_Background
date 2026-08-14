(() => {
    const body = document.body
    const sidebar = document.querySelector('[data-sidebar]')
    const navTrigger = document.querySelector('[data-nav-trigger]')
    const navClose = document.querySelector('[data-nav-close]')
    const searchDialog = document.querySelector('[data-search-dialog]')
    const searchInput = document.querySelector('[data-search-input]')
    const searchResults = document.querySelector('[data-search-results]')
    const searchHint = document.querySelector('[data-search-hint]')
    const searchTriggers = document.querySelectorAll('[data-search-trigger]')
    const searchClose = document.querySelector('[data-search-close]')
    const searchIndex = Array.isArray(window.SPEC_SEARCH_INDEX) ? window.SPEC_SEARCH_INDEX : []

    const openNavigation = () => {
        body.classList.add('nav-open')
        navTrigger?.setAttribute('aria-expanded', 'true')
        const activeLink = sidebar?.querySelector('[aria-current="page"]')
        window.setTimeout(() => (activeLink || sidebar?.querySelector('a'))?.focus(), 0)
    }

    const closeNavigation = ({ returnFocus = true } = {}) => {
        body.classList.remove('nav-open')
        navTrigger?.setAttribute('aria-expanded', 'false')
        if (returnFocus) navTrigger?.focus()
    }

    navTrigger?.addEventListener('click', () => {
        if (body.classList.contains('nav-open')) closeNavigation()
        else openNavigation()
    })

    navClose?.addEventListener('click', () => closeNavigation())

    sidebar?.addEventListener('click', (event) => {
        if (event.target.closest('a') && window.matchMedia('(max-width: 900px)').matches) {
            closeNavigation({ returnFocus: false })
        }
    })

    const openSearch = () => {
        if (!searchDialog) return
        if (!searchDialog.open) searchDialog.showModal()
        searchInput.value = ''
        renderSearchResults('')
        window.setTimeout(() => searchInput?.focus(), 0)
    }

    const closeSearch = () => {
        if (searchDialog?.open) searchDialog.close()
    }

    searchTriggers.forEach((trigger) => trigger.addEventListener('click', openSearch))
    searchClose?.addEventListener('click', closeSearch)

    searchDialog?.addEventListener('click', (event) => {
        if (event.target !== searchDialog) return
        const rect = searchDialog.getBoundingClientRect()
        const inside = event.clientX >= rect.left
            && event.clientX <= rect.right
            && event.clientY >= rect.top
            && event.clientY <= rect.bottom
        if (!inside) closeSearch()
    })

    document.addEventListener('keydown', (event) => {
        const target = event.target
        const isTyping = target instanceof HTMLInputElement
            || target instanceof HTMLTextAreaElement
            || target?.isContentEditable

        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault()
            openSearch()
            return
        }

        if (event.key === '/' && !isTyping && !searchDialog?.open) {
            event.preventDefault()
            openSearch()
            return
        }

        if (event.key === 'Escape' && body.classList.contains('nav-open')) {
            closeNavigation()
        }
    })

    searchInput?.addEventListener('input', () => renderSearchResults(searchInput.value))

    function renderSearchResults(query) {
        if (!searchResults) return
        const normalizedQuery = normalize(query)
        const terms = normalizedQuery.split(/\s+/).filter(Boolean)
        const currentPageId = body.dataset.pageId

        const matches = searchIndex
            .map((item) => {
                const title = normalize(item.title)
                const summary = normalize(item.summary)
                const module = normalize(item.module)
                const text = normalize(item.text)
                const haystack = `${title} ${summary} ${module} ${text}`
                const isMatch = !terms.length || terms.every((term) => haystack.includes(term))
                if (!isMatch) return null

                let score = 0
                for (const term of terms) {
                    if (title === term) score += 60
                    else if (title.includes(term)) score += 30
                    if (module.includes(term)) score += 12
                    if (summary.includes(term)) score += 8
                    if (text.includes(term)) score += 2
                }
                if (item.url.replace('.html', '') === currentPageId) score += terms.length ? 0 : 5
                if (item.status === 'draft') score += 1
                return { ...item, score }
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score || String(a.number).localeCompare(String(b.number), 'zh-Hant', { numeric: true }))
            .slice(0, terms.length ? 30 : 12)

        searchHint.textContent = terms.length
            ? `找到 ${matches.length}${matches.length === 30 ? '+' : ''} 個相關章節；Enter 可開啟目前焦點結果。`
            : '可搜尋章節名稱、內文、route、欄位與技術值。以下先列出主要入口。'

        if (!matches.length) {
            searchResults.innerHTML = '<div class="search-empty">找不到相符規格。請改用較短的關鍵字、route 或技術欄位名稱。</div>'
            return
        }

        searchResults.innerHTML = matches.map((item) => `
            <a class="search-result" href="${escapeHtml(item.url)}">
                <span class="search-result-number">${escapeHtml(item.number || '—')}</span>
                <span>
                    <strong>${escapeHtml(item.title)}</strong>
                    <small>${escapeHtml(item.summary || '')}</small>
                </span>
                <span class="search-result-module">${escapeHtml(item.module || '')}</span>
            </a>
        `).join('')
    }

    function normalize(value) {
        return String(value || '')
            .normalize('NFKC')
            .toLocaleLowerCase('zh-Hant')
            .replace(/\s+/g, ' ')
            .trim()
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;')
    }

    const visualOverview = document.querySelector('[id="page-visual-overview"]')
    const visualToggle = document.querySelector('[data-anatomy-toggle]')
    const visualToggleLabel = document.querySelector('[data-anatomy-toggle-label]')
    const visualPanel = document.querySelector('[data-anatomy-panel]')
    const visualReturn = document.querySelector('[data-visual-return]')

    const setVisualExpanded = (expanded) => {
        if (!visualToggle || !visualPanel) return
        visualToggle.setAttribute('aria-expanded', String(expanded))
        visualToggle.classList.toggle('is-collapsed', !expanded)
        visualPanel.hidden = !expanded
        if (visualToggleLabel) {
            visualToggleLabel.textContent = expanded ? '收合畫面示意' : '展開完整畫面示意'
        }
    }

    if (visualOverview && visualToggle && visualPanel) {
        setVisualExpanded(!window.matchMedia('(max-width: 620px)').matches)
        visualToggle.addEventListener('click', () => {
            setVisualExpanded(visualToggle.getAttribute('aria-expanded') !== 'true')
        })
    }

    if (visualOverview && visualReturn) {
        let scrollFrame = 0
        const updateVisualReturn = () => {
            scrollFrame = 0
            visualReturn.hidden = visualOverview.getBoundingClientRect().bottom > 120
        }
        const requestVisualReturnUpdate = () => {
            if (scrollFrame) return
            scrollFrame = window.requestAnimationFrame(updateVisualReturn)
        }
        updateVisualReturn()
        window.addEventListener('scroll', requestVisualReturnUpdate, { passive: true })
        window.addEventListener('resize', requestVisualReturnUpdate)
    }

    const outlineLinks = [...document.querySelectorAll('.page-outline nav a')]
    const headings = outlineLinks
        .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
        .filter(Boolean)

    if (headings.length && 'IntersectionObserver' in window) {
        const linksById = new Map(outlineLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]))
        const visibleHeadings = new Map()
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) visibleHeadings.set(entry.target.id, entry.boundingClientRect.top)
                else visibleHeadings.delete(entry.target.id)
            }

            let activeId = null
            if (visibleHeadings.size) {
                activeId = [...visibleHeadings.entries()].sort((a, b) => a[1] - b[1])[0][0]
            } else {
                const passed = headings.filter((heading) => heading.getBoundingClientRect().top < 150)
                activeId = passed.at(-1)?.id || headings[0]?.id
            }

            outlineLinks.forEach((link) => link.classList.toggle('is-active', link === linksById.get(activeId)))
        }, {
            rootMargin: '-100px 0px -68% 0px',
            threshold: [0, 1],
        })
        headings.forEach((heading) => observer.observe(heading))
    }

    window.addEventListener('resize', () => {
        if (!window.matchMedia('(max-width: 900px)').matches && body.classList.contains('nav-open')) {
            closeNavigation({ returnFocus: false })
        }
    })
})()
