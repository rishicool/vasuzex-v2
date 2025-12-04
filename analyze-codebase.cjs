const fs = require('fs');
const path = require('path');

const features = {
  services: [],
  facades: [],
  templates: [],
  commands: [],
  providers: [],
  controllers: [],
  routes: [],
  examples: []
};

function scanDirectory(dir, category) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      scanDirectory(fullPath, category);
    } else if (file.name.endsWith('.js')) {
      features[category].push(fullPath.replace('/Users/rishi/Desktop/work/vasuzex-v2/', ''));
    }
  });
}

// Scan key directories
scanDirectory('framework/Services', 'services');
scanDirectory('framework/Support/Facades', 'facades');
scanDirectory('framework/Console/Commands/utils', 'templates');
scanDirectory('framework/Console/Commands', 'commands');
scanDirectory('framework/Foundation/Providers', 'providers');
scanDirectory('examples', 'examples');

console.log('📊 Vasuzex V2 Codebase Analysis\n');
console.log('Services:', features.services.length);
console.log('Facades:', features.facades.length);
console.log('Generator Templates:', features.templates.length);
console.log('CLI Commands:', features.commands.filter(f => !f.includes('utils')).length);
console.log('Service Providers:', features.providers.length);
console.log('Examples:', features.examples.length);
console.log('\n📝 Detailed Inventory:\n');

Object.entries(features).forEach(([category, files]) => {
  if (files.length > 0) {
    console.log(`\n${category.toUpperCase()}:`);
    files.forEach(f => console.log(`  - ${f}`));
  }
});
