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
    // Wrapper each page in a div with the right id
    const wrappedPages = pages.map((content, index) => {
      // Not in page
      if (index >= allPages.length) {
        return `<div class="document-content__body__paginated__page">${content}</div>`
      }
      // Extract the page number for the current index
      const page = Number(allPages[index].replace(/\D+/, ''))
      // Each path much have its own id
      return `<div class="document-content__body__paginated__page" id="${anchorId(page)}" data-page="${page}">
        ${content}
      </div>`
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
        const project = this.$config.get('sentenceCaseProject', 'local-datashare')
        this.$core.registerPipelineForProject(project, {
          name: this.pipelineName,
          category: 'extracted-text:post',
          type: autoDetectPages
        })
      },
      unregisterPipeline () {
        this.$core.unregisterPipeline(this.pipelineName)
      },
      selectePage (page) {
        const goToIndex = Number(page.replace(/\D*/, ''))
        const goToAnchor = `#${anchorId(goToIndex)}`
        const container = this.$el.closest('.overflow-auto') || document.body
        // Use the build-in scrollIntoView method
        container.querySelector(goToAnchor).scrollIntoView({ behavior: 'smooth' })
      }
    }
  }
</script>

<template>
  <div class="document__content__text-paginator py-1 font-weight-bold mb-3">
    <b-form-checkbox v-model="doDetect" switch>
      Auto-detect pages in text
    </b-form-checkbox>
    <b-form-select @change="selectePage" :value="null" size="sm" class="mt-3 position-top position-sticky" :disabled="!doDetect" v-if="supportsScrollInView">
      <b-form-select-option :value="null">
        Go to...
      </b-form-select-option>
      <b-form-select-option v-for="page in pages" :key="page" :value="page">
        {{ page }}
      </b-form-select-option>
    </b-form-select>
  </div>
</template>

<style>
  .document-content__body__paginated {
    background: #f8f9fa;
    box-shadow: 0 0 2rem 2rem #f8f9fa;
  }

  .document-content__body__paginated__page {
    clear: right;
    box-shadow: 0 0.5rem 1.5rem 0 rgba(0, 0, 0, 0.2);
    padding: 1rem 15px;
    margin-bottom: 2rem;
    position: relative;
    z-index: 10;
    background: #fff;
  }

  .document-content__body__paginated__page[data-page]:after {
    content: "— Page " attr(data-page) " —";
    position: sticky;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    background: #f8f9fa;
    text-transform: uppercase;
    font-weight: bold;
    display: block;
    padding: 0.5rem;
  }

  .document-content__body__paginated__page__footer span {
    position: relative;
  }

  .document-content__body__paginated__page__footer span:before,
  .document-content__body__paginated__page__footer span:after {
    content: "";
    position: absolute;
    top: 50%;
    height: 4px;
    width: 100vw;
    margin: 0 0.5em;
    border: solid 1px currentColor;
    border-right: 0;
    border-left: 0;
    transform: translateY(-50%);
  }

  .document-content__body__paginated__page__footer span:before {
    right: 100%;
  }

  .document-content__body__paginated__page__footer span:after {
    left: 100%;
  }
</style>
