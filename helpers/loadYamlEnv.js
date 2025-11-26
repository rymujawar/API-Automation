import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

/**
 * Load environment variables from a YAML file and assign to process.env
 * @param {string} yamlPath - relative path to YAML file
 */
export function loadYamlEnv(yamlPath) {
  const fullPath = path.resolve(process.cwd(), yamlPath);
  if (!fs.existsSync(fullPath)) return false;
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = yaml.load(content);
    if (parsed && typeof parsed === 'object') {
      for (const [k, v] of Object.entries(parsed)) {
        // don't overwrite existing env vars
        if (process.env[k] === undefined && v !== undefined && v !== null) {
          process.env[k] = String(v);
        }
      }
    }
    return true;
  } catch (err) {
    console.warn('Failed to load YAML env from', yamlPath, err);
    return false;
  }
}
