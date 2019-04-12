const { Toolkit } = require( 'actions-toolkit' );


const PROJECT_FRAGMENT = `
  name
  id
  columns(first: 10) {
    totalCount
    nodes {
      id
      url
      firstCards: cards(first: 1) {
        totalCount
        nodes {
          url
          id
          note
        }
      }
      lastCards: cards(last: 1) {
        totalCount
        nodes {
          url
          id
          note
        }
      }
    }
  }
`;


Toolkit.run(async ( tools ) => {
  const url = tools.context.payload.issue 
    ? tools.context.payload.issue.html_url 
    : tools.context.payload.pull_request.html_url;

  tools.log( tools.context.payload );
  
  tools.log( `Adding ${ url } to project` );


  const { resource } = tools.github.graphql( `
      query getAllProjectCards( $url: URI! ) {
        resource( url: $url ) {
          ... on Issue {
            id
            repository {
              owner {
                url
                ${''/* Projects can be attached to an Organization... */}
                ... on Organization {
                  projects(first: 10, states: [OPEN]) {
                    nodes {
                      ${ PROJECT_FRAGMENT }
                    }
                  }
                }
              }
              ${''/* ... or on a Repository */}
              projects(first: 10, states: [OPEN]) {
                nodes {
                  ${ PROJECT_FRAGMENT }
                }
              }
            }
          }
        }
      }
    `, { url });


  tools.log.success( 'Hello world 🦁' );
}, {
  event: [ 'issues.opened', 'pull_request.opened' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
