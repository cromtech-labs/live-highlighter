# Live Highlighter Documentation

Official documentation for Live Highlighter - a browser extension for highlighting user-defined text on web pages.

## About

This repository contains the documentation site for [Live Highlighter](https://github.com/cromtech-labs/browser-highlighter), built with [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/).

## Development

### Prerequisites

- Python 3.8 or higher
- pip

### Local Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/cromtech-labs/live-highlighter-docs.git
   cd live-highlighter-docs
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Serve the documentation locally:
   ```bash
   mkdocs serve
   ```

4. Open your browser to `http://127.0.0.1:8000`

### Building

To build the static site:

```bash
mkdocs build
```

The built site will be in the `site/` directory.

## Deployment

This documentation is deployed to Azure Static Web Apps. The deployment happens automatically on push to the main branch via Azure Pipelines.

### Azure DevOps Setup

1. Create an Azure Static Web App in the Azure Portal
2. Copy the deployment token from the Static Web App
3. In Azure DevOps, go to Pipelines → Library → Variable Groups
4. Create a variable named `AZURE_STATIC_WEB_APPS_API_TOKEN` with the deployment token (mark as secret)
5. Link the variable group to your pipeline
6. Push to main branch to trigger deployment

### Manual Deployment

If needed, you can deploy manually:

1. Build the site: `mkdocs build`
2. Deploy the `site/` directory to your hosting platform using Azure CLI or portal

## Project Structure

```
live-highlighter-docs/
├── docs/                  # Documentation source files
│   ├── index.md          # Homepage
│   ├── getting-started/  # Getting started guides
│   ├── user-guide/       # User guides
│   ├── reference/        # Reference documentation
│   └── about/            # About pages
├── mkdocs.yml            # MkDocs configuration
└── requirements.txt      # Python dependencies
```

## Contributing

Contributions to the documentation are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `mkdocs serve`
5. Submit a pull request

## License

This documentation is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The Live Highlighter extension is also licensed under the MIT License.
