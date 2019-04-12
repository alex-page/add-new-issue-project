const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run(async ( tools ) => {
  const projectNumber = tools.arguments[ 0 ];
  const projectColumn = tools.arguments[ 1 ];

  tools.log( `Project number arg: ${ projectNumber }` );
  tools.log( `Project column arg: ${ projectColumn }` );

  // Get the current issue or pullrequest URL
  const url = tools.context.payload.issue 
    ? tools.context.payload.issue.html_url 
    : tools.context.payload.pull_request.html_url;

  // Get the project ID and the column ID to insert the issue into
  const { resource } = await tools.github.graphql(`query {
    resource( url: "${ url }" ) {
      ... on Issue {
        id
        repository {
          projects( first: 10, states: [OPEN] ) {
            nodes {
              number
              id
              columns( first: 10 ) {
                nodes {
                  id
                  name
                }
              }
            }
          }
          owner {
            url
            ... on Organization {
              projects( first: 10, states: [OPEN] ) {
                nodes {
                  number
                  id
                  columns( first: 10 ) {
                    nodes {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`);

  tools.log( resource );

  const issueId = resource.id;
  const project = resource.repository.projects.nodes.filter( node => node.number === projectNumber );
  const projectId = project.id;
  const projectColumnId = project.columns.nodes.filter( node => node.name === projectColumn );

  tools.log( `Issue ID: ${ issueId }`) ;
  tools.log( `Project ID: ${ projectId }` );
  tools.log( `Project column ID: ${ projectColumnId }` );

  if( !projectColumnId ){
    tools.exit.failure( `Could not find column for "${ projectColumn }"` );
  }

  if( !projectId ){
    tools.exit.failure( `Could not find project that has the number "${ projectNumber }"` );
  }

  tools.log( `Issue ID: ${ issueId }`);
  tools.log( `Project ID: ${ projectId }`);
  tools.log( `Project column ID: ${ projectColumnId }`);

  tools.log( `Adding ${ url } to project` );

  tools.log.success( 'Hello world 🦁' );
}, {
  event: [ 'issues.opened', 'pull_request.opened' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
