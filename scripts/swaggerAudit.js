#!/usr/bin/env node
/**
 * Swagger Documentation Audit Script
 * Validates that all API endpoints have proper Swagger documentation
 * Run: node scripts/swaggerAudit.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROUTES_DIR = path.join(__dirname, '../src/routes');
const OUTPUT_FILE = path.join(__dirname, '../SWAGGER_VALIDATION_REPORT.md');

// Regex patterns
const ROUTER_PATTERN = /router\.(get|post|put|patch|delete|options)\s*\(\s*['"`]([^'"`]+)['"`]/g;
const SWAGGER_PATTERN = /\/\*\*[\s\S]*?@swagger[\s\S]*?\*\//g;
const PATH_PATTERN = /\*\s*\/\s*\/\s*([a-z0-9\/\-{:}]+):/gi;

// Get all route files
const getRouteFiles = () => {
  return fs.readdirSync(ROUTES_DIR)
    .filter(file => file.endsWith('Routes.js'))
    .map(file => path.join(ROUTES_DIR, file));
};

// Extract router endpoints
const extractRouters = (content) => {
  const routers = [];
  let match;
  const regex = new RegExp(ROUTER_PATTERN);
  
  while ((match = regex.exec(content)) !== null) {
    routers.push({
      method: match[1].toUpperCase(),
      path: match[2]
    });
  }
  
  return routers;
};

// Extract swagger blocks
const extractSwaggerPaths = (content) => {
  const swaggerBlocks = content.match(SWAGGER_PATTERN) || [];
  const paths = [];
  
  swaggerBlocks.forEach(block => {
    // Extract path from swagger block
    const pathMatch = block.match(/\/\s*([a-z0-9\/\-{:}]+):/i);
    const methodMatch = block.match(/(get|post|put|patch|delete|options):/i);
    
    if (pathMatch && methodMatch) {
      paths.push({
        path: pathMatch[1],
        method: methodMatch[1].toUpperCase()
      });
    }
  });
  
  return paths;
};

// Main audit function
const auditSwaggerDocs = () => {
  const routeFiles = getRouteFiles();
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: routeFiles.length,
    results: [],
    summary: {
      totalEndpoints: 0,
      documentedEndpoints: 0,
      undocumentedEndpoints: 0,
      files: {}
    }
  };

  routeFiles.forEach(filePath => {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract routers and swagger docs
    const routers = extractRouters(content);
    const swaggerPaths = extractSwaggerPaths(content);
    
    const documented = [];
    const undocumented = [];
    
    routers.forEach(router => {
      const isDocumented = swaggerPaths.some(
        swagger => swagger.path === router.path && swagger.method === router.method
      );
      
      if (isDocumented) {
        documented.push(router);
      } else {
        undocumented.push(router);
      }
    });
    
    report.summary.totalEndpoints += routers.length;
    report.summary.documentedEndpoints += documented.length;
    report.summary.undocumentedEndpoints += undocumented.length;
    report.summary.files[fileName] = {
      total: routers.length,
      documented: documented.length,
      undocumented: undocumented.length,
      coverage: routers.length > 0 ? ((documented.length / routers.length) * 100).toFixed(2) + '%' : '0%'
    };
    
    report.results.push({
      file: fileName,
      routers: routers.length,
      documented: documented.length,
      undocumented: undocumented.length,
      coverage: routers.length > 0 ? ((documented.length / routers.length) * 100).toFixed(2) + '%' : '0%',
      endpoints: {
        documented,
        undocumented
      }
    });
  });

  return report;
};

// Generate markdown report
const generateMarkdownReport = (report) => {
  let markdown = `# 📊 Swagger Documentation Audit Report\n\n`;
  markdown += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
  
  // Summary
  markdown += `## 📈 Summary\n\n`;
  markdown += `- **Total Files:** ${report.summary.totalEndpoints}\n`;
  markdown += `- **Total Endpoints:** ${report.summary.totalEndpoints}\n`;
  markdown += `- **Documented Endpoints:** ${report.summary.documentedEndpoints} ✅\n`;
  markdown += `- **Undocumented Endpoints:** ${report.summary.undocumentedEndpoints} ⚠️\n`;
  markdown += `- **Overall Coverage:** ${report.summary.totalEndpoints > 0 ? ((report.summary.documentedEndpoints / report.summary.totalEndpoints) * 100).toFixed(2) : '0'}%\n\n`;
  
  // By file
  markdown += `## 📋 Coverage by File\n\n`;
  markdown += `| File | Total | Documented | Undocumented | Coverage |\n`;
  markdown += `|------|-------|------------|--------------|----------|\n`;
  
  Object.entries(report.summary.files).forEach(([file, stats]) => {
    const status = stats.undocumented === 0 ? '✅' : '⚠️';
    markdown += `| ${file} | ${stats.total} | ${stats.documented} | ${stats.undocumented} | ${stats.coverage} ${status} |\n`;
  });
  
  markdown += `\n## 🔍 Detailed Results\n\n`;
  
  report.results.forEach(result => {
    markdown += `### ${result.file}\n`;
    markdown += `- **Total Endpoints:** ${result.routers}\n`;
    markdown += `- **Documented:** ${result.documented}\n`;
    markdown += `- **Undocumented:** ${result.undocumented}\n`;
    markdown += `- **Coverage:** ${result.coverage}\n`;
    
    if (result.endpoints.undocumented.length > 0) {
      markdown += `\n⚠️ **Missing Documentation:**\n`;
      result.endpoints.undocumented.forEach(endpoint => {
        markdown += `- \`${endpoint.method} ${endpoint.path}\`\n`;
      });
    }
    
    markdown += `\n`;
  });
  
  markdown += `\n## ✨ Tips for Adding Documentation\n\n`;
  markdown += `1. **Find the route file** from the "Missing Documentation" section\n`;
  markdown += `2. **Add Swagger comments** above the router definition:\n`;
  markdown += `\`\`\`javascript\n`;
  markdown += `/**\n`;
  markdown += ` * @swagger\n`;
  markdown += ` * /path/endpoint:\n`;
  markdown += ` *   get:\n`;
  markdown += ` *     summary: Endpoint description\n`;
  markdown += ` *     tags: [Category]\n`;
  markdown += ` *     security:\n`;
  markdown += ` *       - bearerAuth: []\n`;
  markdown += ` *     responses:\n`;
  markdown += ` *       200:\n`;
  markdown += ` *         description: Success\n`;
  markdown += ` */\n`;
  markdown += `router.get('/path/endpoint', controller);\n`;
  markdown += `\`\`\`\n`;
  markdown += `3. **Test in Swagger UI:** http://localhost:5000/api-docs\n`;
  markdown += `4. **Restart server** if needed: \`npm start\`\n\n`;
  
  markdown += `## 🚀 Next Steps\n\n`;
  markdown += `- [ ] Document all undocumented endpoints\n`;
  markdown += `- [ ] Validate response schemas\n`;
  markdown += `- [ ] Add request body examples\n`;
  markdown += `- [ ] Test all endpoints in Swagger UI\n`;
  markdown += `- [ ] Generate API documentation\n\n`;
  
  markdown += `---\n`;
  markdown += `*Report Generated: ${new Date().toISOString()}*\n`;
  
  return markdown;
};

// Main execution
try {
  console.log('🔍 Auditing Swagger documentation...\n');
  
  const report = auditSwaggerDocs();
  const markdown = generateMarkdownReport(report);
  
  // Write report
  fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');
  
  console.log('✅ Audit Complete!\n');
  console.log(`📊 Summary:`);
  console.log(`   Total Endpoints: ${report.summary.totalEndpoints}`);
  console.log(`   Documented: ${report.summary.documentedEndpoints} ✅`);
  console.log(`   Undocumented: ${report.summary.undocumentedEndpoints} ⚠️`);
  console.log(`   Coverage: ${((report.summary.documentedEndpoints / report.summary.totalEndpoints) * 100).toFixed(2)}%\n`);
  
  console.log(`📄 Report saved to: ${OUTPUT_FILE}\n`);
  
  // Show files needing attention
  const filesNeedingWork = Object.entries(report.summary.files)
    .filter(([_, stats]) => stats.undocumented > 0)
    .sort((a, b) => b[1].undocumented - a[1].undocumented);
  
  if (filesNeedingWork.length > 0) {
    console.log('⚠️ Files Needing Documentation:\n');
    filesNeedingWork.forEach(([file, stats]) => {
      console.log(`   📄 ${file}: ${stats.undocumented} endpoints missing docs`);
    });
    console.log('');
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error during audit:', error.message);
  process.exit(1);
}
