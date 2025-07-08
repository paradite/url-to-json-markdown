import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Unified text analysis functions
function getSuspiciousCharType(codePoint) {
  if (codePoint >= 0xe0100 && codePoint <= 0xe01ef) return 'Variation Selector';
  if (codePoint >= 0x200b && codePoint <= 0x200f) return 'Zero-width Space';
  if (codePoint >= 0x2060 && codePoint <= 0x206f) return 'General Punctuation';
  if (codePoint >= 0xfeff && codePoint <= 0xfeff)
    return 'Zero-width No-break Space';
  if (codePoint >= 0x1d173 && codePoint <= 0x1d17a) return 'Musical Symbol';
  return 'Unknown Suspicious';
}

function findSuspiciousChars(text) {
  const codePoints = Array.from(text);
  const suspiciousChars = [];

  codePoints.forEach((char, index) => {
    const codePoint = char.codePointAt(0);
    const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');

    // Check for various suspicious Unicode ranges
    if (
      (codePoint >= 0xe0100 && codePoint <= 0xe01ef) || // Variation selectors
      (codePoint >= 0x200b && codePoint <= 0x200f) || // Zero-width spaces
      (codePoint >= 0x2060 && codePoint <= 0x206f) || // General punctuation
      (codePoint >= 0xfeff && codePoint <= 0xfeff) || // Zero-width no-break space
      (codePoint >= 0x1d173 && codePoint <= 0x1d17a) // Musical symbols
    ) {
      suspiciousChars.push({
        char: char,
        position: index,
        codePoint: codePoint,
        hex: hex,
        type: getSuspiciousCharType(codePoint),
      });
    }
  });

  return suspiciousChars;
}

function analyzePatterns(text) {
  const suspiciousPatterns = [
    { pattern: /[^\x00-\x7F]/g, name: 'Non-ASCII characters' },
    { pattern: /\u200b/g, name: 'Zero-width spaces' },
    { pattern: /\ufeff/g, name: 'Byte order marks' },
    { pattern: /[\u0300-\u036f]/g, name: 'Combining diacritical marks' },
    { pattern: /[\u2000-\u206f]/g, name: 'General punctuation' },
  ];

  const results = [];
  suspiciousPatterns.forEach(({ pattern, name }) => {
    const matches = text.match(pattern) || [];
    if (matches.length > 0) {
      results.push({
        name,
        count: matches.length,
        matches:
          matches.length < 10
            ? matches.map(
                (m) => `U+${m.codePointAt(0).toString(16).toUpperCase()}`
              )
            : null,
      });
    }
  });

  return results;
}

function getTextMetrics(text) {
  return {
    totalChars: text.length,
    visibleChars: text.replace(/[\u200b-\u200f\ufeff]/g, '').length,
    wordCount: text.split(/\s+/).filter((word) => word.length > 0).length,
    lineCount: text.split('\n').length,
  };
}

function detectEncodedData(text) {
  const base64Regex = /[A-Za-z0-9+/]{4,}={0,2}/g;
  const hexRegex = /[0-9a-fA-F]{8,}/g;

  const base64Matches = text.match(base64Regex) || [];
  const hexMatches = text.match(hexRegex) || [];

  return {
    base64:
      base64Matches.length > 0 ? base64Matches.filter((m) => m.length > 8) : [],
    hex: hexMatches,
  };
}

function extractHiddenMessage(text, cleanText) {
  const codePoints = Array.from(text);
  const cleanCodePoints = Array.from(cleanText);
  const hiddenChars = codePoints.slice(cleanCodePoints.length);

  if (hiddenChars.length === 0) return null;

  const hiddenValues = hiddenChars.map((char) => {
    const codePoint = char.codePointAt(0);
    return codePoint - 0xe0100;
  });

  const decodingMethods = {
    directAscii: hiddenValues
      .map((val) => {
        if (val >= 32 && val <= 126) return String.fromCharCode(val);
        return `[${val}]`;
      })
      .join(''),

    alphabetMapping: hiddenValues
      .map((val) => {
        if (val >= 0 && val <= 25) return String.fromCharCode(val + 65);
        if (val >= 26 && val <= 51) return String.fromCharCode(val - 26 + 97);
        return `[${val}]`;
      })
      .join(''),

    base64Mapping: hiddenValues
      .map((val) => {
        const base64Chars =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        if (val >= 0 && val < base64Chars.length) return base64Chars[val];
        return `[${val}]`;
      })
      .join(''),

    offsetMappings: {},

    binaryToAscii:
      hiddenValues
        .map((val) => val.toString(2).padStart(8, '0'))
        .join('')
        .match(/.{1,8}/g)
        ?.map((chunk) => {
          const val = parseInt(chunk, 2);
          if (val >= 32 && val <= 126) return String.fromCharCode(val);
          return `[${val}]`;
        })
        .join('') || '',

    hexToAscii:
      hiddenValues
        .map((val) => val.toString(16).padStart(2, '0'))
        .join('')
        .match(/.{1,2}/g)
        ?.map((chunk) => {
          const val = parseInt(chunk, 16);
          if (val >= 32 && val <= 126) return String.fromCharCode(val);
          return `[${val}]`;
        })
        .join('') || '',
  };

  // Common offsets
  const commonOffsets = [32, 48, 65, 97];
  commonOffsets.forEach((offset) => {
    const offsetDecoded = hiddenValues
      .map((val) => {
        const newVal = val + offset;
        if (newVal >= 32 && newVal <= 126) return String.fromCharCode(newVal);
        return `[${newVal}]`;
      })
      .join('');

    decodingMethods.offsetMappings[offset] = {
      decoded: offsetDecoded,
      readableWords: offsetDecoded.match(/[a-zA-Z@]{4,}/g) || [],
    };
  });

  return {
    hiddenValues,
    decodingMethods,
  };
}

function analyzeText(text, label, cleanText = null) {
  console.log(`\n=== ${label.toUpperCase()} ANALYSIS ===`);

  const suspiciousChars = findSuspiciousChars(text);
  console.log(`Found ${suspiciousChars.length} suspicious characters`);

  if (suspiciousChars.length > 0) {
    suspiciousChars.forEach((char) => {
      console.log(`  Position ${char.position}: ${char.type} (U+${char.hex})`);
    });
  }

  const patterns = analyzePatterns(text);
  if (patterns.length > 0) {
    console.log('\nPattern Analysis:');
    patterns.forEach(({ name, count, matches }) => {
      console.log(`${name}: ${count} matches`);
      if (matches) {
        console.log(`  └── ${matches.join(', ')}`);
      }
    });
  }

  const metrics = getTextMetrics(text);
  console.log(`\nText Metrics:`);
  console.log(`Total characters: ${metrics.totalChars}`);
  console.log(`Visible characters: ${metrics.visibleChars}`);
  console.log(`Word count: ${metrics.wordCount}`);
  console.log(`Line count: ${metrics.lineCount}`);

  const encodedData = detectEncodedData(text);
  console.log(encodedData);
  if (encodedData.base64.length > 0) {
    console.log(
      `\nPotential Base64 strings found: ${encodedData.base64.length}`
    );
    encodedData.base64.forEach((match) => {
      console.log(
        `  - ${match.substring(0, 20)}${match.length > 20 ? '...' : ''}`
      );
    });
  }

  if (encodedData.hex.length > 0) {
    console.log(`\nPotential hex strings found: ${encodedData.hex.length}`);
    encodedData.hex.forEach((match) => {
      console.log(
        `  - ${match.substring(0, 20)}${match.length > 20 ? '...' : ''}`
      );
    });
  }

  if (cleanText) {
    const hiddenMessage = extractHiddenMessage(text, cleanText);
    if (hiddenMessage) {
      console.log(`\n=== HIDDEN MESSAGE DECODER ===`);
      console.log('Raw hidden values:', hiddenMessage.hiddenValues);
      console.log('\n=== DECODING ATTEMPTS ===');
      console.log('Direct ASCII:', hiddenMessage.decodingMethods.directAscii);
      console.log(
        'Alphabet mapping:',
        hiddenMessage.decodingMethods.alphabetMapping
      );
      console.log(
        'Base64 mapping:',
        hiddenMessage.decodingMethods.base64Mapping
      );
      console.log(
        'Binary to ASCII:',
        hiddenMessage.decodingMethods.binaryToAscii
      );
      console.log('Hex to ASCII:', hiddenMessage.decodingMethods.hexToAscii);

      Object.entries(hiddenMessage.decodingMethods.offsetMappings).forEach(
        ([offset, result]) => {
          console.log(`Offset +${offset}: ${result.decoded}`);
          if (result.readableWords.length > 0) {
            console.log(
              `  └── Readable words found: ${result.readableWords.join(', ')}`
            );
          }
        }
      );
    }
  }

  return {
    suspiciousChars,
    patterns,
    metrics,
    encodedData,
    hiddenMessage: cleanText ? extractHiddenMessage(text, cleanText) : null,
  };
}

// Read the tweet.json file
const filePath = path.join(__dirname, 'tweet.json');
const fileContent = fs.readFileSync(filePath, 'utf8');

console.log('=== TWEET SECURITY ANALYSIS ===');

// Parse the JSON
const tweetData = JSON.parse(fileContent);

// Extract username from title
const titleMatch = tweetData.title.match(/Tweet by (.+)$/);
const username = titleMatch ? titleMatch[1] : 'Unknown';

// Extract and analyze content
const content = tweetData.content || '';

// Extract the actual tweet text (after the title line)
const contentLines = content.split('\n');
const tweetText = contentLines.slice(2).join('\n').split('---')[0].trim();

// Analyze username with unified functions
// Extract clean username by removing variation selectors (0xE0100-0xE01EF range)
const cleanUsername = Array.from(username)
  .filter((char) => {
    const codePoint = char.codePointAt(0);
    return !(codePoint >= 0xe0100 && codePoint <= 0xe01ef);
  })
  .join('');

analyzeText(username, 'USERNAME', cleanUsername);

// Analyze content with unified functions
analyzeText(tweetText, 'CONTENT');
