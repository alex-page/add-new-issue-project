# Add new issues to project

> ✨ GitHub action to automagically add new issues to projects.


# How to use

To use this action we need the project number and the name of the column for the new issues to go into. 
- Get the project number from the URL `https://github.com/alex-page/test-actions/projects/1` this URL would be `1`.
- Get the column name from the project board for example "To do".

In your project create a new workflow file `.github/main.workflow`:
```
workflow "✨Add new issues to projects" {
  resolves = ["alex-page/add-new-issue-project"]
  on = "issues"
}

action "alex-page/add-new-issue-project" {
  uses = "alex-page/add-new-issue-project@master"
  args = [ "1", "To do"]
  secrets = ["GITHUB_TOKEN"]
}
```

> Note: Replace `1` with your project number and `To do` with your project column.


# Release history

- v0.0.1 - First release
