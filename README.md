# ‼️This is no longer supported ‼️

Please use [`GitHub Project Automation+`](https://github.com/marketplace/actions/github-project-automation) instead. The following snippet adds all new issues to a project column using GitHub Project Automation+:

```yml
name: Automate project columns

on: [issues]

jobs:
  automate-project-columns:
    runs-on: ubuntu-latest
    steps:
      - name: Move new issues into Triage
        if: github.event_name == 'issues' && github.event.action == 'opened'
        uses: alex-page/automate-project-columns@master
        with:
          project: Backlog
          column: Triage
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

---


# Add new issues to project

> ✨ GitHub action to automagically add new issues to projects.


## How to use

To use this action we need the project name and the name of the column for the new issues will go into. The project and column names will be used to get a column ID for automation.

In your project create a new workflow file `.github/main.workflow`:
```
workflow "✨Add new issues to projects" {
  resolves = ["alex-page/add-new-issue-project"]
  on = "issues"
}

action "alex-page/add-new-issue-project" {
  uses = "alex-page/add-new-issue-project@master"
  args = [ "🎒 Backlog", "To do"]
  secrets = ["GITHUB_TOKEN"]
}
```

> Note: Replace `🎒 Backlog` with your project name and `To do` with your project column.


## Private repositories

In some cases you may want to do add this functionality for a private repository or one you do not have admin rights to. You may get an error like:
```shell
GraphqlError: Resource not accessible by integration
```

When this happens you will need to provide a [personal access token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line). To do this you will need to create a new secret called `GH_PAT` with your secret. You will then need to change the `.github/main.workflow` secrets to include that token:
```
secrets = ["GH_PAT"]
```

With certain organisations there may be SAML enforcement. This means you will need to `Enable SSO` when you create the personal access token.
```
GraphqlError: Resource protected by organization SAML enforcement. You must grant your personal token access to this organization
```


## Release history

- v0.0.5 - Deprecated
- v0.0.4 - Fix action `index.js` location, add optional personal access token for private repos
- v0.0.3 - Add missing labels for action release
- v0.0.2 - End in a neutral state for unsupported issue action
- v0.0.1 - First release
