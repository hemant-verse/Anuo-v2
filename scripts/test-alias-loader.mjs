import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve as pathResolve, extname } from 'node:path';
import fs from 'node:fs';

const root = dirname(fileURLToPath(import.meta.url));
const srcRoot = pathResolve(root, '..', 'src');

function withJsExtension(filePath) {
  if (extname(filePath)) return filePath;
  const candidate = `${filePath}.js`;
  return fs.existsSync(candidate) ? candidate : filePath;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const filePath = withJsExtension(pathResolve(srcRoot, specifier.slice(2)));
    return nextResolve(pathToFileURL(filePath).href, context);
  }

  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const parent = context.parentURL ? fileURLToPath(context.parentURL) : null;
    if (parent) {
      const filePath = withJsExtension(pathResolve(dirname(parent), specifier));
      if (filePath.endsWith('.js') && fs.existsSync(filePath)) {
        return nextResolve(pathToFileURL(filePath).href, context);
      }
    }
  }

  return nextResolve(specifier, context);
}
