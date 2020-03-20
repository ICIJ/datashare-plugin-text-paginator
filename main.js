document.addEventListener('datashare:ready', ({ detail }) => {
  // A quick-and-dirty sentence-case function
  const toSentenceCase = function (str) {
    return str.toLowerCase().split(' ').map(function(word) {
      return (word.charAt(0).toUpperCase() + word.slice(1))
    }).join(' ')
  }

  // The project in which we'll add the plugin
  const project = detail.core.config.get('sentenceCaseProject', 'local-datashare')

  // Register the hook only for the given project
  detail.core.registerHookForProject(project, {
    name: 'sentence-case-toggler',
    target: 'document.content.body:before',
    definition: {
      computed: {
        pipelineName () {
          return this.$config.get('sentenceCasePipelineName', 'extracted-text-sentence-case')
        },
        // This computed property will be used by as v-model of the toggler input
        toggler: {
          set (active) {
            return active ? this.registerPipeline() : this.unregisterPipeline()
          },
          get () {
            // True is the pipeline is activate
            return !!this.$store.getters['pipelines/getPipelineByName'](this.pipelineName)
          }
        }
      },
      methods: {
        registerPipeline () {
          this.$core.registerPipelineForProject(project, { 
            name: this.pipelineName,
            category: 'extracted-text:post',
            type: toSentenceCase
          })
        },
        unregisterPipeline () {
          this.$core.unregisterPipeline(this.pipelineName)
        }
      },
      template: `<div class="document__content__sentence-case float-right p-3">
        <b-form-checkbox v-model="toggler" switch>
          Improve readability
        </b-form-checkbox>
      </div>`
    }
  })
})
