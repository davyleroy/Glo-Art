// Loader stub: treat the `server-only` package as empty so dev scripts
// (phase0-check, ad-hoc smoke scripts) can import server modules directly.
import { pathToFileURL } from 'node:url';

export function resolve(specifier, context, nextResolve) {
  if (specifier === 'server-only') {
    return { url: pathToFileURL(import.meta.filename).href, shortCircuit: true, format: 'module' };
  }
  return nextResolve(specifier, context);
}

export function load(url, context, nextLoad) {
  if (url === pathToFileURL(import.meta.filename).href) {
    return { source: 'export {};', format: 'module', shortCircuit: true };
  }
  return nextLoad(url, context);
}
