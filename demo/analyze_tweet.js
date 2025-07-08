import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the test.txt file
const filePath = path.join(__dirname, 'tweet.json');
const fileContent = fs.readFileSync(filePath, 'utf8');

console.log('=== TWEET SECURITY ANALYSIS ===');

// Parse the JSON
const tweetData = JSON.parse(fileContent);

// Extract username from title
const titleMatch = tweetData.title.match(/Tweet by (.+)$/);
const username = titleMatch ? titleMatch[1] : 'Unknown';

console.log('Username:', username);

// Analyze each character in the username
const codePoints = Array.from(username);
const suspiciousChars = [];

codePoints.forEach((char, index) => {
  const codePoint = char.codePointAt(0);
  const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');

  // Check for suspicious Unicode ranges
  if (codePoint >= 0xe0100 && codePoint <= 0xe01ef) {
    suspiciousChars.push({
      char: char,
      position: index,
      codePoint: codePoint,
      hex: hex,
    });
  }
});

console.log(`Found ${suspiciousChars.length} suspicious characters`);

// Extract hidden characters
const cleanUsername = 'Pliny the Liberator 🐉';
const cleanCodePoints = Array.from(cleanUsername);
const hiddenChars = codePoints.slice(cleanCodePoints.length);

// Decode hidden message
console.log('\n=== HIDDEN MESSAGE DECODER ===');
if (hiddenChars.length > 0) {
  // Extract the numeric values from the Unicode codepoints
  const hiddenValues = hiddenChars.map((char) => {
    const codePoint = char.codePointAt(0);
    return codePoint - 0xe0100;
  });

  console.log('Raw hidden values:', hiddenValues);

  // Try multiple decoding methods
  console.log('\n=== DECODING ATTEMPTS ===');

  // Method 1: Direct ASCII
  const directAscii = hiddenValues
    .map((val) => {
      if (val >= 32 && val <= 126) {
        return String.fromCharCode(val);
      }
      return `[${val}]`;
    })
    .join('');
  console.log('Direct ASCII:', directAscii);

  // Method 2: Alphabet mapping
  const alphabetMapping = hiddenValues
    .map((val) => {
      if (val >= 0 && val <= 25) {
        return String.fromCharCode(val + 65); // A-Z
      } else if (val >= 26 && val <= 51) {
        return String.fromCharCode(val - 26 + 97); // a-z
      }
      return `[${val}]`;
    })
    .join('');
  console.log('Alphabet mapping:', alphabetMapping);

  // Method 3: Base64 chars
  const base64Chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const base64Mapping = hiddenValues
    .map((val) => {
      if (val >= 0 && val < base64Chars.length) {
        return base64Chars[val];
      }
      return `[${val}]`;
    })
    .join('');
  console.log('Base64 mapping:', base64Mapping);

  // Method 4: Common offsets
  const commonOffsets = [32, 48, 65, 97]; // space, '0', 'A', 'a'
  commonOffsets.forEach((offset) => {
    const offsetDecoded = hiddenValues
      .map((val) => {
        const newVal = val + offset;
        if (newVal >= 32 && newVal <= 126) {
          return String.fromCharCode(newVal);
        }
        return `[${newVal}]`;
      })
      .join('');
    console.log(`Offset +${offset}:`, offsetDecoded);

    // Check for readable words
    const readableWords = offsetDecoded.match(/[a-zA-Z@]{4,}/g);
    if (readableWords) {
      console.log(`  └── Readable words found: ${readableWords.join(', ')}`);
    }
  });

  // Method 5: Binary to ASCII
  const binaryString = hiddenValues
    .map((val) => val.toString(2).padStart(8, '0'))
    .join('');
  const binaryChunks = binaryString.match(/.{1,8}/g) || [];
  const binaryToAscii = binaryChunks
    .map((chunk) => {
      const val = parseInt(chunk, 2);
      if (val >= 32 && val <= 126) {
        return String.fromCharCode(val);
      }
      return `[${val}]`;
    })
    .join('');
  console.log('Binary to ASCII:', binaryToAscii);

  // Method 6: Hex to ASCII
  const hexString = hiddenValues
    .map((val) => val.toString(16).padStart(2, '0'))
    .join('');
  const hexChunks = hexString.match(/.{1,2}/g) || [];
  const hexToAscii = hexChunks
    .map((chunk) => {
      const val = parseInt(chunk, 16);
      if (val >= 32 && val <= 126) {
        return String.fromCharCode(val);
      }
      return `[${val}]`;
    })
    .join('');
  console.log('Hex to ASCII:', hexToAscii);
}
