const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run(async ( tools ) => {
  const url = tools.context.payload.issue 
    ? tools.context.payload.issue.html_url 
    : tools.context.payload.pull_request.html_url;

  // Get the project ID and the column ID to insert the issue into
  const result = await tools.github.graphql(`query {
    resource( url: "${ url }" ) {
      ... on Issue {
        id
        repository {
          projects( first: 10, states: [OPEN] ) {
            nodes {
              name
              id
              columns( first: 10 ) {
                nodes{
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }`);

  tools.log( result );

  tools.log( tools.arguments );
  tools.log( `Adding ${ url } to project` );

  tools.log.success( 'Hello world 🦁' );
}, {
  event: [ 'issues.opened', 'pull_request.opened' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
