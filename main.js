import TextPaginatorToggler from './TextPaginatorToggler.vue'

document.addEventListener('datashare:ready', ({ detail }) => {

  // The project in which we'll add the plugin
  const project = detail.core.config.get('textPaginatorProject', 'local-datashare')

  detail.core.registerHookForProject(project, {
    name: 'text-paginator-toggler',
    target: 'document.content.ner:after',
    order: 100,
    definition: TextPaginatorToggler
  })
})
