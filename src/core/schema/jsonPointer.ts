/**
 * Utilities for RFC 6901 JSON Pointers and immutable payload modifications
 */

export function cloneDeep<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // Fallback if structuredClone fails on non-serializable properties
    }
  }
  return JSON.parse(JSON.stringify(value));
}

/**
 * Escapes a token according to RFC 6901
 */
export function escapePointerToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * Unescapes a token according to RFC 6901
 */
export function unescapePointerToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

/**
 * Parses a JSON pointer into tokens
 * Example: "/user/profile/bio" -> ["user", "profile", "bio"]
 */
export function parsePointer(pointer: string): string[] {
  if (!pointer || pointer === '/') return [];
  const normalized = pointer.startsWith('/') ? pointer.slice(1) : pointer;
  return normalized.split('/').map(unescapePointerToken);
}

/**
 * Builds a JSON pointer from tokens
 */
export function buildPointer(tokens: string[]): string {
  if (tokens.length === 0) return '';
  return '/' + tokens.map(escapePointerToken).join('/');
}

/**
 * Retrieves a value from an object using a JSON pointer
 */
export function getValueAtPointer(obj: unknown, pointer: string): unknown {
  const tokens = parsePointer(pointer);
  if (tokens.length === 0) return obj;

  let current: any = obj;
  for (const token of tokens) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[token];
  }
  return current;
}

/**
 * Immutably sets a value at a JSON pointer in an object, returning the mutated copy
 */
export function setValueAtPointer<T>(root: T, pointer: string, value: unknown): T {
  const tokens = parsePointer(pointer);
  if (tokens.length === 0) {
    return value as T;
  }

  const copy = cloneDeep(root) as any;
  let current: any = copy;

  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    if (current[token] === null || current[token] === undefined || typeof current[token] !== 'object') {
      // Create object or array depending on whether the next token is numeric
      const nextToken = tokens[i + 1];
      const isNextNumeric = /^\d+$/.test(nextToken);
      current[token] = isNextNumeric ? [] : {};
    }
    current = current[token];
  }

  const lastToken = tokens[tokens.length - 1];
  current[lastToken] = value;

  return copy;
}

/**
 * Immutably removes/deletes a property at a JSON pointer in an object
 */
export function deleteValueAtPointer<T>(root: T, pointer: string): T {
  const tokens = parsePointer(pointer);
  if (tokens.length === 0) {
    return undefined as unknown as T;
  }

  const copy = cloneDeep(root) as any;
  let current: any = copy;

  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    if (current[token] === null || current[token] === undefined || typeof current[token] !== 'object') {
      return copy; // Path doesn't exist, nothing to delete
    }
    current = current[token];
  }

  const lastToken = tokens[tokens.length - 1];
  if (Array.isArray(current)) {
    const index = parseInt(lastToken, 10);
    if (!isNaN(index) && index >= 0 && index < current.length) {
      current.splice(index, 1);
    }
  } else if (current && typeof current === 'object') {
    delete current[lastToken];
  }

  return copy;
}
