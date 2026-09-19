const fs = require('fs');
const path = require('path');
const config = require('../config');

/**
 * Parses Playwright's output JSON report file to extract structured test case results,
 * durations, error traces, and failure screenshot/video attachments.
 *
 * @param {string} reportFilePath - Absolute path to report.json
 * @returns {Array<{title: string, project: string, file: string, status: string, duration_ms: number, error_message: string|null, error_stack: string|null, screenshot_url: string|null, video_url: string|null}>}
 */
function parsePlaywrightReport(reportFilePath) {
  if (!fs.existsSync(reportFilePath)) {
    console.warn(`[Parser] Report file not found at: ${reportFilePath}`);
    return [];
  }

  try {
    const raw = fs.readFileSync(reportFilePath, 'utf8');
    const json = JSON.parse(raw);
    const results = [];

    function processSuite(suite, currentFile = '') {
      const file = suite.file || currentFile;

      if (suite.suites && Array.isArray(suite.suites)) {
        for (const subSuite of suite.suites) {
          processSuite(subSuite, file);
        }
      }

      if (suite.specs && Array.isArray(suite.specs)) {
        for (const spec of suite.specs) {
          const specTitle = spec.title;
          const specFile = spec.file || file;

          if (spec.tests && Array.isArray(spec.tests)) {
            for (const testItem of spec.tests) {
              const projectName = testItem.projectName || 'default';
              const lastResult = testItem.results && testItem.results.length > 0 
                ? testItem.results[testItem.results.length - 1] 
                : null;

              if (!lastResult) continue;

              const status = lastResult.status; // 'passed', 'failed', 'timedOut', 'skipped'
              const durationMs = lastResult.duration || 0;
              let errorMessage = null;
              let errorStack = null;

              if (lastResult.error) {
                errorMessage = lastResult.error.message || null;
                errorStack = lastResult.error.stack || null;
              } else if (lastResult.errors && lastResult.errors.length > 0) {
                errorMessage = lastResult.errors.map(e => e.message).join('\n');
                errorStack = lastResult.errors.map(e => e.stack).join('\n');
              }

              let beforeScreenshotUrl = null;
              let screenshotUrl = null;
              let videoUrl = null;

              // Inspect attachments captured by Playwright (e.g. before/after action or failure)
              if (lastResult.attachments && Array.isArray(lastResult.attachments)) {
                for (const att of lastResult.attachments) {
                  if (att.path && fs.existsSync(att.path)) {
                    // Calculate relative path inside test-results/artifacts
                    const relativeToArtifacts = path.relative(config.artifactsDir, att.path).replace(/\\/g, '/');
                    const publicUrl = `/artifacts/${relativeToArtifacts}`;

                    const attName = (att.name || '').toLowerCase();
                    const attPath = (att.path || '').toLowerCase();

                    if (attName.includes('before') || attPath.includes('before')) {
                      beforeScreenshotUrl = publicUrl;
                    } else if (attName.includes('after') || attPath.includes('after')) {
                      screenshotUrl = publicUrl;
                    } else if (attName === 'screenshot' || (att.contentType && att.contentType.startsWith('image/'))) {
                      // Default/failure screenshot
                      if (!screenshotUrl) {
                        screenshotUrl = publicUrl;
                      } else if (!beforeScreenshotUrl) {
                        beforeScreenshotUrl = publicUrl;
                      }
                    } else if (attName === 'video' || (att.contentType && att.contentType.startsWith('video/'))) {
                      videoUrl = publicUrl;
                    }
                  }
                }
              }

              const retryCount = testItem.results && testItem.results.length > 1 ? testItem.results.length - 1 : 0;
              const isFlaky = testItem.status === 'flaky' || (status === 'passed' && retryCount > 0);

              results.push({
                title: specTitle,
                project: projectName,
                file: specFile,
                status: status === 'timedOut' ? 'failed' : status,
                duration_ms: durationMs,
                error_message: errorMessage,
                error_stack: errorStack,
                screenshot_url: screenshotUrl,
                before_screenshot_url: beforeScreenshotUrl,
                video_url: videoUrl,
                retry_count: retryCount,
                is_flaky: isFlaky,
              });
            }
          }
        }
      }
    }

    if (json.suites && Array.isArray(json.suites)) {
      for (const rootSuite of json.suites) {
        processSuite(rootSuite);
      }
    }

    return results;
  } catch (err) {
    console.error('[Parser] Error parsing report JSON:', err);
    return [];
  }
}

module.exports = {
  parsePlaywrightReport,
};
