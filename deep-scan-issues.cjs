const fs = require('fs');
const path = require('path');

const issues = {
  deprecatedPatterns: [],
  syntaxErrors: [],
  missingImports: [],
  hardcodedValues: [],
  routePatterns: []
};

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = filePath.replace(process.cwd() + '/', '');
  
  // Check for deprecated ESLint patterns
  if (content.includes("eslint: '^8.") || content.includes('eslint@8')) {
    issues.deprecatedPatterns.push(`${fileName}: ESLint 8.x (deprecated)`);
  }
  
  // Check for old route patterns
  if (content.includes("router.get('/*'") || content.includes('router.get("/*"')) {
    issues.routePatterns.push(`${fileName}: Old wildcard route pattern /*`);
  }
  
  if (content.includes("router.get('/:path(*)'") || content.includes("router.get('/:path(\\*)')")) {
    issues.routePatterns.push(`${fileName}: Invalid route pattern /:path(*)`);
  }
  
  // Check for req.params[0] which won't work with new pattern
  if (content.includes('req.params[0]')) {
    issues.syntaxErrors.push(`${fileName}: Using req.params[0] instead of req.params.path`);
  }
  
  // Check for missing error handling in async functions
  const asyncMatches = content.match(/async\s+\w+\s*\(/g) || [];
  const tryMatches = content.match(/try\s*{/g) || [];
  if (asyncMatches.length > tryMatches.length && fileName.includes('Controller')) {
    issues.syntaxErrors.push(`${fileName}: Async functions without try-catch`);
  }
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && file.name !== 'node_modules') {
      scanDir(fullPath);
    } else if (file.name.endsWith('.js')) {
      checkFile(fullPath);
    }
  });
}

console.log('🔍 Deep Scanning Vasuzex V2 for Issues...\n');

['framework', 'bin', 'examples'].forEach(dir => scanDir(dir));

console.log('📊 Scan Results:\n');

let totalIssues = 0;
Object.entries(issues).forEach(([category, items]) => {
  if (items.length > 0) {
    console.log(`\n${category.toUpperCase().replace(/([A-Z])/g, ' $1').trim()}:`);
    items.forEach(item => console.log(`  ⚠️  ${item}`));
    totalIssues += items.length;
  }
});

if (totalIssues === 0) {
  console.log('\n✅ No issues found!');
} else {
  console.log(`\n❌ Total issues found: ${totalIssues}`);
}
