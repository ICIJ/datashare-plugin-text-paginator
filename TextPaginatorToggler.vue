<script>
  function anchorId(page = 1) {
    return `document-page-${page}`
  }

  function listPages (extractedText =  '', html = false) {
    const re = html ? /<p>Page \d+<\/p>/igm : /\nPage \d+\n/igm
    const matches = extractedText.match(re) || []
    // Strip out each "\n" from the matches
    return matches.map(m => m.split(/<\/?p>/).join(''))
  }

  function autoDetectPages (extractedText = '') {
    const pages = extractedText.split(/<p>Page \d+<\/p>/igm)
    const allPages = listPages(extractedText, true)
    // No pages, nothing to do
    if (allPages.length === 0) {
      return extractedText
    }
    // Wrapper each page in a div with the right id
    const wrappedPages = pages.map((content, index) => {
      // Not in page
      if (index >= allPages.length) {
        return `<div class="document-content__body__paginated__page">${content}</div>`
      }
      // Extract the page number for the current index
      const page = Number(allPages[index].replace(/\D+/, ''))
      // Each path much have its own id
      return `
        <div class="document-content__body__paginated__page" id="${anchorId(page)}" data-page="${page}">
          ${content}
        </div>
      `
    })

    return `
      <div class="document-content__body__paginated">
        ${wrappedPages.join('')}
      </div>
    `
  }

  export default {
    computed: {
      pipelineName () {
        return this.$config.get('textPaginatorPipelineName', 'extracted-text-paginator')
      },
      // This computed property will be used by as v-model of the toggler input
      doDetect: {
        set (active) {
          return active ? this.registerPipeline() : this.unregisterPipeline()
        },
        get () {
          // True if the pipeline is activated
          return !!this.$store.getters['pipelines/getPipelineByName'](this.pipelineName)
        }
      },
      document () {
        return this.$store.state.document.doc
      },
      pages () {
        return listPages(this.document.source.content)
      },
      supportsScrollInView () {
        return !!document.documentElement.scrollIntoView
      }
    },
    methods: {
      registerPipeline () {
        const project = this.$config.get('textPaginatorProject', 'local-datashare')
        this.$core.registerPipelineForProject(project, {
          name: this.pipelineName,
          category: 'extracted-text:post',
          type: autoDetectPages
        })
      },
      unregisterPipeline () {
        this.$core.unregisterPipeline(this.pipelineName)
      },
      selectPage (page) {
        const goToIndex = Number(page.replace(/\D*/, ''))
        const goToAnchor = `#${anchorId(goToIndex)}`
        const container = this.$el.closest('.overflow-auto') || document.body
        // Use the build-in scrollIntoView method.
        // There is currently a bug with chrome who doesn't like the smooth transition.
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
        const behavior = isChrome ? 'instant' : 'smooth'
        container.querySelector(goToAnchor).scrollIntoView({ behavior })
      },
    }
  }
</script>

<template>
  <div class="document__content__text-paginator py-1 font-weight-bold ml-3">
    <b-form-checkbox disabled switch v-if="!pages.length">
      Highlight pages (none detected)
    </b-form-checkbox>
    <div v-else class="d-flex flex-row align-items-center">
      <b-form-checkbox v-model="doDetect" switch class="text-nowrap" title="Automatically display separate pages but only when the pages' numbers are explicitly mentioned in the document" v-b-tooltip>
        Highlight pages
      </b-form-checkbox>
      <b-form-select @change="selectPage" :value="null" size="sm" class="mt-1 ml-3 position-top position-sticky" :disabled="!doDetect" v-if="supportsScrollInView">
        <b-form-select-option :value="null">
          Go to...
        </b-form-select-option>
        <b-form-select-option v-for="page in pages" :key="page" :value="page">
          {{ page }}
        </b-form-select-option>
      </b-form-select>
    </div>
  </div>
</template>

<style>
  .document-content__body__paginated {
    background: #f8f9fa;
    box-shadow: 0 0 3rem 3rem #f8f9fa;
  }

  .document-content__body__paginated__page {
    padding: 1rem 15px;
    margin: 0 -1rem 3rem;
    border-top: 1px solid #ced4da;
    border-bottom: 2px solid #ced4da;
    box-shadow: 0 3rem 0 3rem #f8f9fa;
    position: relative;
    z-index: 0;
    background: #fff;
  }

  .document-content__body__paginated__page[data-page]:after {
    content: "Page " attr(data-page);
    position: sticky;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    padding: 0.25rem 0.5rem;
    color: var(--light);
    background: var(--secondary);
    border-radius: 1rem;
  }
</style>
