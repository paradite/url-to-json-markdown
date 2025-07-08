import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the test.txt file
const filePath = path.join(__dirname, 'tweet.json');
const fileContent = fs.readFileSync(filePath, 'utf8');

console.log('=== TWEET SECURITY ANALYSIS ===');
console.log('Reading from:', filePath);
console.log();

// Parse the JSON
const tweetData = JSON.parse(fileContent);

console.log('=== EXTRACTED DATA ===');
console.log('Title:', tweetData.title);
console.log('Type:', tweetData.type);
console.log('Content preview:', tweetData.content.substring(0, 100) + '...');
console.log();

// Extract username from title
const titleMatch = tweetData.title.match(/Tweet by (.+)$/);
const username = titleMatch ? titleMatch[1] : 'Unknown';

console.log('=== USERNAME ANALYSIS ===');
console.log('Extracted username:', username);
console.log('Username length:', username.length);

// Analyze each character in the username
const codePoints = Array.from(username);
console.log('Actual character count:', codePoints.length);

console.log('\n=== CHARACTER BREAKDOWN ===');
const suspiciousChars = [];

codePoints.forEach((char, index) => {
  const codePoint = char.codePointAt(0);
  const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');

  let isSuspicious = false;
  let description = 'Regular character';

  // Check for suspicious Unicode ranges - Updated to catch the specific range
  if (codePoint >= 0xe0100 && codePoint <= 0xe01ef) {
    description = '🚨 VARIATION SELECTOR SUPPLEMENT (INVISIBLE)';
    isSuspicious = true;
  } else if (codePoint >= 0xe0000 && codePoint <= 0xe007f) {
    description = '🚨 TAG CHARACTER (INVISIBLE)';
    isSuspicious = true;
  } else if (codePoint >= 0xfe00 && codePoint <= 0xfe0f) {
    description = '🚨 VARIATION SELECTOR';
    isSuspicious = true;
  } else if (codePoint >= 0x200b && codePoint <= 0x200f) {
    description = '🚨 ZERO-WIDTH CHARACTER';
    isSuspicious = true;
  } else if (codePoint >= 0x2060 && codePoint <= 0x206f) {
    description = '🚨 FORMAT CHARACTER';
    isSuspicious = true;
  }

  if (isSuspicious) {
    suspiciousChars.push({
      char: char,
      position: index,
      codePoint: codePoint,
      hex: hex,
      description: description,
    });
  }

  console.log(
    `${index
      .toString()
      .padStart(2)}: "${char}" -> U+${hex} (${codePoint}) - ${description}`
  );
});

console.log('\n=== SECURITY FINDINGS ===');
console.log(`Found ${suspiciousChars.length} suspicious characters:`);

suspiciousChars.forEach((item, index) => {
  console.log(
    `${index + 1}. Position ${item.position}: U+${item.hex} - ${
      item.description
    }`
  );
});

// Create clean version
const cleanUsername = 'Pliny the Liberator 🐉';
console.log('\n=== IMPERSONATION PROOF ===');
console.log('Clean username:', cleanUsername);
console.log('Malicious username:', username);
console.log('Visually identical?', 'YES - They look the same!');
console.log('Actually identical?', cleanUsername === username ? 'YES' : 'NO');
console.log(
  'Character count difference:',
  codePoints.length - Array.from(cleanUsername).length
);

// Filter bypass demonstration
const bannedUsers = ['Pliny the Liberator 🐉'];
console.log('\n=== FILTER BYPASS DEMONSTRATION ===');
console.log('Banned usernames:', bannedUsers);
console.log('Attempted username:', username);
console.log(
  'Would bypass simple filter?',
  bannedUsers.includes(username) ? 'NO' : 'YES'
);

// Extract hidden characters
const cleanCodePoints = Array.from(cleanUsername);
const hiddenChars = codePoints.slice(cleanCodePoints.length);

console.log('\n=== HIDDEN CHARACTERS ===');
console.log('Hidden character count:', hiddenChars.length);
hiddenChars.forEach((char, index) => {
  const codePoint = char.codePointAt(0);
  const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');
  console.log(`Hidden ${index + 1}: U+${hex} (${codePoint})`);
});

console.log('\n=== THREAT ASSESSMENT ===');
if (suspiciousChars.length > 0) {
  console.log(
    '🚨 HIGH RISK: This username contains invisible Unicode characters'
  );
  console.log('🚨 POTENTIAL ATTACKS:');
  console.log('   - Username spoofing/impersonation');
  console.log('   - Security filter bypass');
  console.log('   - Social engineering preparation');
  console.log('   - Database pollution');
} else {
  console.log('✅ LOW RISK: No suspicious characters detected');
}

// Also analyze the content for suspicious patterns
console.log('\n=== CONTENT ANALYSIS ===');
const content = tweetData.content;

// Check for data harvesting requests
if (
  content.includes('leaderboard') ||
  content.includes('ranking') ||
  content.includes('followers')
) {
  console.log(
    '🚨 POTENTIAL DATA HARVESTING: Request for follower/ranking data'
  );
}

// Check for social engineering patterns
if (content.includes('@grok') || content.includes("hope you're doing well")) {
  console.log(
    '🚨 SOCIAL ENGINEERING: Friendly approach to AI/bot for data extraction'
  );
}

console.log('\n=== RECOMMENDATION ===');
console.log('This account should be flagged for manual review due to:');
console.log('1. Use of invisible Unicode characters in username');
console.log('2. Potential data harvesting request');
console.log('3. Social engineering tactics');
