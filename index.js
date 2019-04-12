const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run(async ( tools ) => {
  const url = tools.context.payload.issue 
    ? tools.context.payload.issue.html_url 
    : tools.context.payload.pull_request.html_url;

  tools.log( tools.context.payload );
  
  tools.log( `Adding ${ url } to project` );

  tools.log( tools.arguments );

  tools.log.success( 'Hello world 🦁' );
}, {
  event: [ 'issues.opened', 'pull_request.opened' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
