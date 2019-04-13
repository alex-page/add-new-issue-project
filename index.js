const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run( async ( tools ) => {
  try {
    // Get the arguments
    const projectNumber = tools.arguments._[ 0 ];
    const columnName    = tools.arguments._[ 1 ];

    // Get the data from the event
    const issueUrl   = tools.context.payload.issue.html_url;
    const issueTitle = tools.context.payload.issue.title;
    const issueId    = tools.context.payload.issue.node_id;

    tools.log( tools.context.payload );

    // Get the issue id, project name and number, column ID and name
    // New code goes here

    // Get the project from the matching provided number
    const project = resource.repository.projects.nodes
      .filter( node => node.number === projectNumber )[ 0 ];

    // Get the column from the matching provided column name
    const column = project.columns.nodes.filter( node => node.name === columnName )[ 0 ];
    const columnId = column.id;

    // Check we have a valid column ID
    if( !columnId || !project ) {
      tools.exit.failure(
        `Could not find project number "${ projectNumber }" or column "${ columnName }"`
      );
    }

    // Add the card to the project
    await tools.github.createCard({ column_id: columnId, content_id: issueId, content_type: "Issue" });

    // Log success message
    tools.log.success(
      `Added issue "${ issueTitle }" to "${ project.name }" in "${ column.name }".`
    );
  }
  catch( error ){
    tools.exit.failure( error );
  }
}, {
  event: [ 'issues.opened' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
