# KnightChaser's music curation

A list of songs that I like! You can search them, sort them, or even... suggest some good songs you know. (at the repository issue.)

> GitHub pages deployment status
> [![.github/workflows/deploy.yml](https://github.com/KnightChaser/music/actions/workflows/deploy.yml/badge.svg)](https://github.com/KnightChaser/music/actions/workflows/deploy.yml)

## Local Development

To run this project on your local machine, please follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm) must be installed on your system.

### Setup & local development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

This project requires two processes to run simultaneously in separate terminal windows for development.

2.  **Terminal 1: Watch for CSS Changes**

    Open a terminal and run the following command. This task compiles the Tailwind CSS and automatically rebuilds it whenever you make style changes.

    ```bash
    npm run watch:css
    ```

3.  **Terminal 2: Run the Eleventy Server**

    Open a second terminal and run this command. This will start the Eleventy development server.

    ```bash
    npm run start
    ```

Once both commands are running successfully, you can view your website at **`http://localhost:8080`**. The site will automatically reload in your browser when you save changes to content or template files.

4. **Simulate the GitHub CI/CD pipeline locally**
   - Go to the GitHub account and create a new classic GitHub token for `repo:public` and `workflow`.
   - Set the environment flag `GITHUB_TOKEN` for that flag. (Refer to `.actrc`)
   - Run `act push` to see how it goes.

### [Repomix](https://github.com/yamadashy/repomix) command

```bash
repomix --ignore "src/_data/music/*,*.md,.gitignore,_site,src/assets/css/style.css,**/repomix-output.xml,package-lock.json" --style markdown
```

### VSCode music data YAML snippet

Use the following YAML snippet for less painful data insertion!

```json
{
  "Add Music Entry": {
    "prefix": "song",
    "body": [
      "- title: \"$1\"",
      "  release: \"$2\"",
      "  tags: [",
      "    \"$3\", \"$4\", \"$5\", \"$6\", \"$7\", \"$8\"",
      "  ]",
      "  note: \"$9\"",
      "  language: $10",
      "  listen:",
      "    - ORG: $11",
      "    - RX: $12",
      "    - NCR: $13"
    ],
    "description": "Insert a YAML music entry"
  }
}
```
