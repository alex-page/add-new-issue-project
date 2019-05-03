const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run( async ( tools ) => {
  try {
    const { action, issue } = tools.context.payload;
    if( action !== 'opened' ){
      tools.exit.neutral( `Event ${ action } is not supported by this action.` )
    }

    // Get the arguments
    const projectName = tools.arguments._[ 0 ];
    const columnName  = tools.arguments._[ 1 ];

    const graphqlQueryVariables = { 
      auth: process.env.GH_PAT ? process.env.GH_PAT : process.env.GITHUB_TOKEN 
    };

    console.log( process.env.GH_PAT ? 'there is a PAT' : 'there is no PAT' );

    // Fetch the column ids and names
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
    }`,
    graphqlQueryVariables );

    // Get an array of all matching projects
    const repoProjects = resource.repository.projects.nodes || [];
    const orgProjects = resource.repository.owner
      && resource.repository.owner.projects
      && resource.repository.owner.projects.nodes
      || [];
    
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

    // Add the cards to the columns
    const createCards = columns.map( column => {
      return new Promise( async( resolve, reject ) => {
        try {
          await tools.github.graphql(`mutation {
            addProjectCard( input: { contentId: "${ issue.node_id }", projectColumnId: "${ column.id }" }) {
              clientMutationId
            }
          }`, graphqlQueryVariables );

          resolve();
        }
        catch( error ){
          reject( error );
        }
      })
    });

    // Wait for completion
    await Promise.all( createCards ).catch( error => tools.exit.failure( error ) );

    // Log success message
    tools.log.success( `Added ${ issue.title } to ${ projectName } in ${ columnName }.` );
  }
  catch( error ){
    tools.exit.failure( error );
  }
}, {
  event: [ 'issues' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
