const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run(async ( tools ) => {
  // Get the arguments
  const projectNumber = tools.arguments._[ 0 ];
  const columnName    = tools.arguments._[ 1 ];

  // Get the data from the event
  const issueUrl   = tools.context.payload.issue.html_url;
  const issueTitle = tools.context.payload.issue.title;
  const issueId    = tools.context.payload.issue.id;

  // Get the project name, number and the column ID and name
  const { resource } = await tools.github.graphql(`query {
    resource( url: "${ issueUrl }" ) {
      ... on Issue {
        repository {
          projects( first: 10, states: [OPEN] ) {
            nodes {
              name
              number
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
                  name
                  number
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
  }`)

  const project = resource.repository.projects.nodes
    .filter( node => node.number === projectNumber )[ 0 ];

  const column = project.columns.nodes.filter( node => node.name == columnName )[ 0 ];
  const columnId = column.id;

  // Check we have a valid column ID
  if( !columnId ){
    tools.exit.failure( `Could not find column for "${ columnName }"` );
  }

  // Check we have a valid project ID
  if( !projectId ){
    tools.exit.failure( `Could not find project that has the number "${ projectNumber }"` );
  }

  // Add the card to the project
  await tools.github.graphql(`
    mutation {
      addProjectCard( input: { contentId: ${ issueId }, projectColumnId: ${ columnId } }) {
        clientMutationId
      }
    }
  `);

  tools.log.success( `Added issue ${ issueTitle } to project ${ project.name } in column ${ column.name }` );
}, {
  event: [ 'issues.opened', 'pull_request.opened' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
