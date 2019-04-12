const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run(async tools => {
  tools.log.success( 'Hello world 🦁' )
}, {
  event: [ 'issues.opened' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
