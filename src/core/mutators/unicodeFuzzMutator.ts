import { MutationResult, RuleSelectionState } from '../types';
import { SchemaFieldDescriptor } from '../schema/schemaParser';
import { setValueAtPointer } from '../schema/jsonPointer';

export function generateUnicodeFuzzMutations(
  fields: SchemaFieldDescriptor[],
  baselinePayload: unknown,
  rules: RuleSelectionState
): MutationResult[] {
  const results: MutationResult[] = [];

  // Filter fields that accept string inputs
  const stringFields = fields.filter((f) => f.type === 'string');

  for (const field of stringFields) {
    const { pointer, name, sampleValue } = field;

    // 1. Emoji Sequences & Multi-byte UTF-8
    if (rules.emojiSequences) {
      const emojiVal = '👨‍👩‍👧‍👦_🔥_🚀_テスト';
      results.push({
        id: `fuzz-emoji-${pointer.replace(/\//g, '_')}`,
        name: `[Unicode/Fuzz] '${name}' with 4-byte emojis and ZWJ sequence`,
        category: 'unicode_fuzz',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, emojiVal),
        expectedStatus: 400,
        description: `Injected 4-byte UTF-8 emojis and Zero-Width Joiners into '${name}' to test character encoding, collation, and database charset compatibility (utf8mb4).`,
        ruleId: 'emojiSequences',
        originalValue: sampleValue,
        mutatedValue: emojiVal,
      });
    }

    // 2. Right-To-Left (RTL) & BiDi Overrides
    if (rules.rightToLeftOverride) {
      const rtlVal = '\u202E\u0041\u0044\u004D\u0049\u004E\u202C_rtl_check';
      results.push({
        id: `fuzz-rtl-${pointer.replace(/\//g, '_')}`,
        name: `[Unicode/Fuzz] '${name}' injected with Right-to-Left (RTL) override`,
        category: 'unicode_fuzz',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, rtlVal),
        expectedStatus: 400,
        description: `Injected Unicode RTL override character (\\u202E) into '${name}' to test text rendering security and bidirectional spoofing vulnerabilities.`,
        ruleId: 'rightToLeftOverride',
        originalValue: sampleValue,
        mutatedValue: `[RTL Override: \\u202E...]`,
      });
    }

    // 3. Zero-Width Spaces
    if (rules.zeroWidthSpaces) {
      const zwVal = 'clean\u200Bname\uFEFFinvisible';
      results.push({
        id: `fuzz-zw-${pointer.replace(/\//g, '_')}`,
        name: `[Unicode/Fuzz] '${name}' with zero-width invisible spaces`,
        category: 'unicode_fuzz',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, zwVal),
        expectedStatus: 400,
        description: `Injected zero-width space (\\u200B) and byte-order mark (\\uFEFF) into '${name}' to test silent string sanitization and username-spoofing defense.`,
        ruleId: 'zeroWidthSpaces',
        originalValue: sampleValue,
        mutatedValue: `clean\\u200Bname\\uFEFFinvisible`,
      });
    }

    // 4. SQL Injection Patterns
    if (rules.sqlInjectionPatterns) {
      const sqliVal = "' OR '1'='1' -- ";
      results.push({
        id: `fuzz-sqli-${pointer.replace(/\//g, '_')}`,
        name: `[Security Fuzz] '${name}' SQL injection payload ("${sqliVal}")`,
        category: 'unicode_fuzz',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, sqliVal),
        expectedStatus: 400,
        description: `Injected classic SQLi tautology vector into '${name}'. Verifies backend uses parameterized queries and returns 400/422 without 500 database crashes.`,
        ruleId: 'sqlInjectionPatterns',
        originalValue: sampleValue,
        mutatedValue: sqliVal,
      });
    }

    // 5. Cross-Site Scripting (XSS)
    if (rules.xssScriptTags) {
      const xssVal = "<script>alert('XSS')</script>";
      results.push({
        id: `fuzz-xss-${pointer.replace(/\//g, '_')}`,
        name: `[Security Fuzz] '${name}' XSS script tag injection`,
        category: 'unicode_fuzz',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, xssVal),
        expectedStatus: 400,
        description: `Injected <script> and HTML tags into '${name}'. Validates API input sanitization or rejection against stored XSS attack vectors.`,
        ruleId: 'xssScriptTags',
        originalValue: sampleValue,
        mutatedValue: xssVal,
      });
    }

    // 6. Path Traversal
    if (rules.pathTraversalVectors) {
      const pathVal = '../../../../etc/passwd';
      results.push({
        id: `fuzz-path-${pointer.replace(/\//g, '_')}`,
        name: `[Security Fuzz] '${name}' path traversal vector ("${pathVal}")`,
        category: 'unicode_fuzz',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, pathVal),
        expectedStatus: 400,
        description: `Injected path traversal sequence into '${name}' to verify filesystem isolation and strict input validation.`,
        ruleId: 'pathTraversalVectors',
        originalValue: sampleValue,
        mutatedValue: pathVal,
      });
    }

    // 7. CRLF Whitespace Injection
    if (rules.extremeWhitespaceCrlf) {
      const crlfVal = "valid_text\r\nX-Injected-Header: evil\r\n";
      results.push({
        id: `fuzz-crlf-${pointer.replace(/\//g, '_')}`,
        name: `[Security Fuzz] '${name}' CRLF (\\r\\n) header split injection`,
        category: 'unicode_fuzz',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, crlfVal),
        expectedStatus: 400,
        description: `Injected Carriage Return and Line Feed (\\r\\n) into '${name}' to ensure the API prevents HTTP response splitting and log poisoning.`,
        ruleId: 'extremeWhitespaceCrlf',
        originalValue: sampleValue,
        mutatedValue: `valid_text\\r\\nX-Injected-Header: evil\\r\\n`,
      });
    }
  }

  return results;
}
