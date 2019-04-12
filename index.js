const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run(async ( tools ) => {
  tools.log( tools.context.issue );
  tools.log( tools.context.repo );
  tools.log.success( 'Hello world 🦁' );
}, {
  event: [ 'issues.opened', 'pull_request.opened' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
