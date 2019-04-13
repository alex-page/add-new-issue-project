const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run(async ( tools ) => {
  tools.log( tools.arguments );
  const projectNumber = tools.arguments._[ 0 ];
  const projectColumn = tools.arguments._[ 1 ];

  // tools.log( tools.context.payload );

  tools.log( `Project number arg: ${ projectNumber }` );
  tools.log( `Project column arg: ${ projectColumn }` );

  // Get the current issue or pullrequest URL
  const url = tools.context.payload.issue 
    ? tools.context.payload.issue.html_url 
    : tools.context.payload.pull_request.html_url;

  // Get the issue ID, project ID and the column ID
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

  resource.repository.projects.nodes.forEach( node => tools.log( node ) );

  const issueId = resource.id;
  tools.log( `Issue ID: ${ issueId }`) ;

  const project = resource.repository.projects.nodes.filter( node => node.number === projectNumber );
  const projectId = project.id;
  tools.log( `Project ID: ${ projectId }` );

  const projectColumnId = project.columns.nodes.filter( node => node.name === projectColumn );
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
