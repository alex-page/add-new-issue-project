const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run( async ( tools ) => {
  try {
    // Get the arguments
    const projectName = tools.arguments._[ 0 ];
    const columnName  = tools.arguments._[ 1 ];

    // Get the data from the event
    const issue = tools.context.payload.issue;

    // Get the project ID from the name
    const resource = await tools.github.graphql(`query {
      resource( url: "${ issue.html_url }" ) {
        ... on Issue {
          repository {
            projects( search: "${ projectName }", first: 1, states: [OPEN] ) {
              nodes {
                columns( first: 100 ) {
                  nodes {
                    id
                    name
                  }
                }
              }
            }
            owner {
              ... on Organization {
                projects( search: "${ projectName }", first: 1, states: [OPEN] ) {
                  nodes {
                    columns( first: 100 ) {
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

    // Get the closest matching array of columns
    let projectColumns = [];
    tool.log( resource.repository.projects.nodes );
    if( resource.repository.projects.nodes.length ){
      projectColumns.push( resource.repository.projects.nodes[ 0 ].columns );
    }

    tool.log( resource.repository.owner, resource.repository.owner.projects.nodes.length );
    if( resource.repository.owner && resource.repository.owner.projects.nodes.length ){
      projectColumns.push( resource.repository.owner.projects.nodes[ 0 ].columns );
    }

    // Get the column from the matching provided column name
    const columns = projectColumns.nodes.filter( node => node.name === columnName );

    // Check we have a valid column ID
    if( !columns.length ) {
      tools.exit.failure( `Could not find "${ projectName }" with "${ columnName }" column` );
    }

    // Add the card to the project
    for( const column in columns ) {
      await tools.github.createCard({ 
        column_id: column.id,
        content_id: issue.node_id,
        content_type: "Issue"
      });
    };

    // Log success message
    tools.log.success( `Added "${ issue.title }" to "${ projectName }" in "${ columnName }".` );
  }
  catch( error ){
    tools.exit.failure( error );
  }
}, {
  event: [ 'issues.opened' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
