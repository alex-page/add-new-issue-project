FROM node:10

LABEL version = "0.0.1"
LABEL maintainer = "Alex Page <alex@alexpage.com.au>"
LABEL repository = "https://github.com/alex-page/add-new-issue-project"
LABEL homepage = "https://github.com/alex-page/add-new-issue-project"

LABEL "com.github.actions.name" = "Add new issues to project"
LABEL "com.github.actions.description" = "Automagically add new issues to projects"
LABEL "com.github.actions.icon" = "plus"
LABEL "com.github.actions.color" = "gray-dark"

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]