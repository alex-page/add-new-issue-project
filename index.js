const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run( async ( tools ) => {
  try {
    // Get the arguments
    const projectName = tools.arguments._[ 0 ];
    const columnName  = tools.arguments._[ 1 ];

    // Get the data from the event
    const issue = tools.context.payload.issue;

    // Get the project ID from the name
    const { resource } = await tools.github.graphql(`query {
      resource( url: "${ issue.html_url }" ) {
        ... on Issue {
          repository {
            projects( search: "${ projectName }", first: 10, states: [OPEN] ) {
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
                projects( search: "${ projectName }", first: 10, states: [OPEN] ) {
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

    // Search an object deeply
    const GetValue = ( obj, key ) => key
      .split( "." )
      .reduce(( o, x ) => ( typeof o == "undefined" || o === null ) ? o : o[ x ], obj );

    // Get an array of all matching projects
    const repoProjects = GetValue( resource, 'repository.projects.nodes' )
      ? GetValue( resource, 'repository.projects.nodes' )
      : [];

    const orgProjects  = GetValue( resource, 'repository.owner.projects.nodes' )
      ? GetValue( resource, 'repository.owner.projects.nodes' )
      : [];
    
    // Get the columns with matching names
    const columns = [ ...repoProjects, ...orgProjects ]
      .flatMap( projects => {
        return projects.columns.nodes
          ? projects.columns.nodes.filter( column => column.name === columnName )
          : [];
      });

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
