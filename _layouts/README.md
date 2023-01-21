Modified default minimal-mistakes layout files to customize functionality. Implemented functionality for the following new frontmatter variables:
- `series-intro`: used to store a brief introductory blurb to be displayed on all posts that belong to a given series. If this variable is set, its contents are output before `content`
- `tech`: used to specify technologies used in a given project. If variable is set, contents are displayed after `content`
- `github-link`: specifies url for related GitHub repo, if desired. Outputs a button in the same style as `link` frontmatter variable for external links.
- `medium-link`: specifies url for related Medium article, if relevant. Like `github-link`, outputs a button in same style as `link` frontmatter variable.
