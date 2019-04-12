LABEL "com.github.actions.name" = "Add new issues to project"
LABEL "com.github.actions.description" = "Automagically add new issues to projects"
LABEL "com.github.actions.icon" = "plus"
LABEL "com.github.actions.color" = "gray-dark"

LABEL "repository" = "https://github.com/alex-page/issue-pulls-project"
LABEL "homepage" = "https://github.com/alex-page/issue-pulls-project"

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]