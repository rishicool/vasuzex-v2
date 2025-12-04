# Installation

Vasuzex V2 can be installed globally or used directly with npx.

## Requirements

- **Node.js:** >= 18.0.0
- **pnpm:** >= 10.0.0 (required for V2)
- **Git:** For version control (recommended)

## Check Requirements

\`\`\`bash
node --version  # Should be >= 18.0.0
pnpm --version  # Should be >= 10.0.0
\`\`\`

## Install pnpm

If you don't have pnpm installed:

\`\`\`bash
npm install -g pnpm@10.0.0
\`\`\`

## Installation Options

### Option 1: Global Installation (Recommended)

Install Vasuzex globally to use \`create-vasuzex\` and \`vasuzex\` commands anywhere:

\`\`\`bash
npm install -g vasuzex@2.0.0-alpha.1
\`\`\`

Verify installation:

\`\`\`bash
create-vasuzex --version
vasuzex --version
\`\`\`

### Option 2: Using npx (No Installation)

Use npx to create projects without installing Vasuzex:

\`\`\`bash
npx create-vasuzex my-app
\`\`\`

This downloads and runs the latest version of create-vasuzex.

## Next Steps

- [Quick Start](quick-start.md) - Create your first project
- [Project Structure](project-structure.md) - Understand the file organization
- [Dependency Management Strategy](../DEPENDENCY_MANAGEMENT_STRATEGY.md) - Learn about V2 hybrid dependencies
