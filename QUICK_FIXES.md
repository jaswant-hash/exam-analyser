# QUICK FIX GUIDE - Gravity Work Project

## Top 10 Fixes (in order of importance)

---

## FIX #1: Gemini Model Names [CRITICAL]
**Time to fix:** 2 minutes

### File 1: `src/services/geminiAnalysisService.js` (Line 17)
```javascript
// ❌ BEFORE (line 17)
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-latest'];

// ✅ AFTER
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro'];
```

### File 2: `ml-service/app.py` (Line 31)
```python
# ❌ BEFORE (line 31)
GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]

# ✅ AFTER
GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"]
```

---

## FIX #2: Process.env to import.meta.env [CRITICAL]
**Time to fix:** 5 minutes

### File 1: `src/services/firebaseService.js` (Lines 12-16)
```javascript
// ❌ BEFORE
import {
  getFirestore, collection, addDoc, getDocs, getDoc,
  doc, Timestamp, query, orderBy, deleteDoc, updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// ✅ AFTER - Change all process.env to import.meta.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

Also remove unused import on line 17:
```javascript
// ❌ REMOVE THIS LINE
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, Timestamp, query, orderBy, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
//                                                                                                                        ^^^^^^
// ✅ AFTER - Remove setDoc
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, Timestamp, query, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
```

### File 2: `src/services/llmService.js` (Lines 11-12)
```javascript
// ❌ BEFORE
const OLLAMA_CONFIG = {
  baseURL: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
  model: import.meta.env.VITE_OLLAMA_MODEL || 'tinyllama',
  // ... rest stays the same - these are already correct!
};
```

**Note:** These lines in llmService.js are ALREADY correct! The error is about undefined `process` being available. No change needed here - the import.meta.env usage is correct.

---

## FIX #3: Remove Unused Motion Imports [ESLint]
**Time to fix:** 10 minutes (fix all 11 files)

These files import `motion` but never use it. Remove from line 1 or 3-4:

1. `src/components/shared/LoadingOverlay.jsx` - Line 1
2. `src/components/sttp/AnalysisResults.jsx` - Line 1
3. `src/components/sttp/Footer.jsx` - Line 1
4. `src/components/sttp/HeroSection.jsx` - Line 1
5. `src/components/sttp/Navbar.jsx` - Line 4
6. `src/components/sttp/ProgressTracking.jsx` - Line 1
7. `src/components/sttp/ResourceRecommendations.jsx` - Line 1
8. `src/components/sttp/RevisionPlan.jsx` - Line 1
9. `src/components/sttp/WeaknessDashboard.jsx` - Line 1

**Example fix for LoadingOverlay.jsx:**
```javascript
// ❌ BEFORE (line 1)
import { motion, AnimatePresence } from 'framer-motion';

// ✅ AFTER - If motion is not used
import { AnimatePresence } from 'framer-motion';

// OR if motion IS used, check why eslint says it's unused (it might be)
```

**For UploadPanel.jsx (line 3):**
```javascript
// ❌ BEFORE
import { motion, AnimatePresence } from 'framer-motion';

// ✅ AFTER
import { AnimatePresence } from 'framer-motion';
// BUT WAIT - check if 'motion' is used with motion.div, etc.
// If it is, the import is fine - something else might be wrong
```

---

## FIX #4: Typo in llmService.js [HIGH]
**Time to fix:** 1 minute

**File:** `src/services/llmService.js`

### Line 163 (in generatePracticeQuestions function):
```javascript
// ❌ BEFORE
      return parseQuuestionsFromText(response);

// ✅ AFTER
      return parseQuestionsFromText(response);
```

### Line 362 (function definition):
```javascript
// ❌ BEFORE
const parseQuuestionsFromText = (text) => {

// ✅ AFTER
const parseQuestionsFromText = (text) => {
```

---

## FIX #5: Remove Unused Variables [ESLint]
**Time to fix:** 5 minutes

### File 1: `src/components/sttp/ProgressTracking.jsx` (Line 12)
```javascript
// ❌ BEFORE
  const improvements = compareAttempts(courses);

// ✅ AFTER - either use it or remove it
  const _improvements = compareAttempts(courses); // Prefix with _ means intentionally unused
  // OR
  // Remove the line entirely if not needed
```

### File 2: `src/services/recommendationService.js` (Line 346)
```javascript
// ❌ BEFORE
  } catch (error) {
    // error is not used

// ✅ AFTER
  } catch (_error) {  // Prefix with _ means intentionally unused
    // Don't use the error variable
```

### File 3: `src/services/recommendationService.js` (Line 419)
```javascript
// ❌ BEFORE
  const resourceIndex = findResourceIndex(topic);
  // resourceIndex is never used

// ✅ AFTER
  const _resourceIndex = findResourceIndex(topic);
```

### File 4: `src/services/progressTrackerService.js` (Line 319)
```javascript
// ❌ BEFORE
  const _ = someValue;

// ✅ AFTER - prefix with _ or remove
  const _unused = someValue;
```

### File 5: `src/services/csvParserService.js` (Line 54)
```javascript
// ❌ BEFORE
  data.forEach((row, index) => {
    // index is never used

// ✅ AFTER
  data.forEach((row) => {  // Remove unused index parameter
```

### File 6: `src/services/conceptAnalyzerService.js` (Line 315)
```javascript
// ❌ BEFORE
  const allEntries = Object.entries(keywordDataSource);
  const topicsToAnalyze = selectedTopics.length > 0 && !customSyllabusMap
    ? allEntries.filter(([topic]) => selectedTopics.includes(topic))
    // topic is not used after this

// ✅ AFTER
  const allEntries = Object.entries(keywordDataSource);
  const topicsToAnalyze = selectedTopics.length > 0 && !customSyllabusMap
    ? allEntries.filter(([t]) => selectedTopics.includes(t)) // Rename to avoid unused
```

### File 7: `src/services/llmService.js` (Line 25)
```javascript
// ❌ BEFORE
export const generateRevisionPlan = async (weakTopics, recommendations) => {
  // recommendations is defined but never used in the function
  try {
    let topicsText = weakTopics
      .map((t) => `${t.topic} (weakness: ${t.weaknessLevel})`)
      .join(', ');

// ✅ AFTER - Remove recommendations parameter if not used
export const generateRevisionPlan = async (weakTopics) => {
```

---

## FIX #6: Add Missing Python Dependencies
**Time to fix:** 2 minutes

**File:** `ml-service/requirements.txt`

```text
# ❌ BEFORE
flask==3.0.3
flask-cors==4.0.1
requests==2.32.3
gunicorn==22.0.0

# ✅ AFTER
flask==3.0.3
flask-cors==4.0.1
requests==2.32.3
gunicorn==22.0.0
python-dotenv==1.0.0
PyPDF2==4.1.1
```

---

## FIX #7: Complete analysisEngine.js
**Time to fix:** 10-15 minutes

**File:** `src/services/analysisEngine.js` (Line 215 cuts off)

The function `compareAnswerWithTopics` is incomplete. Line 215:
```javascript
const coveragePct = Math.min(Math.round(maxSim * 100), 100);
const isGap = coveragePct < 65;
```

**Need to complete with:**
```javascript
const coveragePct = Math.min(Math.round(maxSim * 100), 100);
const isGap = coveragePct < 65;

// Determine weakness level
const weaknessLevel =
  coveragePct < 25 ? 'Critical' :
  coveragePct < 45 ? 'High' :
  coveragePct < 65 ? 'Medium' : 'Low';

// Build result object
results.push({
  topic: topic.topic,
  subtopics: topic.subtopics || [],
  coverage: coveragePct,
  isGap,
  weaknessLevel: isGap ? weaknessLevel : 'Low',
  missingConcepts: isGap ? (topic.subtopics || []).slice(0, 5) : [],
  resources: buildResources(topic.topic),
});
```

And close the function:
```javascript
return results;
```

---

## FIX #8: Add Missing Environment Variables
**Time to fix:** 2 minutes

**File:** `.env`

```bash
# ✅ ADD THESE LINES if they're missing

# Optional Ollama configuration
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=tinyllama

# Optional AWS Textract (usually not needed, backup OCR)
VITE_AWS_ACCESS_KEY_ID=
VITE_AWS_SECRET_ACCESS_KEY=
VITE_AWS_REGION=us-east-1
```

---

## FIX #9: Fix PPTX File Type Detection
**Time to fix:** 5 minutes

**File:** `src/components/sttp/UploadPanel.jsx` (Lines 183-191)

```javascript
// ❌ BEFORE - treats .ppt and .pptx the same
if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
  try {
    const r = await extractTextFromPPTX(file);
    // ...
  } catch (_) {
    throw new Error(
      `Could not read "${file.name}" — export it as PDF first and re-upload.`
    );
  }
}

// ✅ AFTER - separate handling
if (file.name.endsWith('.pptx')) {
  // Modern Office Format - use JSZip parser
  try {
    const r = await extractTextFromPPTX(file);
    const text = r.extractedText?.trim();
    if (text && text.length > 20) return text;
    throw new Error('PPTX contains no extractable text');
  } catch (_) {
    throw new Error(
      `Could not read "${file.name}" — try exporting as PDF and re-upload.`
    );
  }
} else if (file.name.endsWith('.ppt')) {
  // Legacy Office Format - not supported by JSZip
  throw new Error(
    `Legacy .ppt format not supported. Please convert "${file.name}" to PDF or PPTX and re-upload.`
  );
}
```

---

## FIX #10: Update Build Scripts
**Time to fix:** 2 minutes

**File:** `package.json`

Add pre-build lint check:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "preview": "vite preview"
  }
}
```

Run before build:
```bash
npm run lint:fix
npm run build
```

---

## VERIFICATION CHECKLIST

After applying all fixes, run:

```bash
# 1. Fix linting issues
npm run lint:fix

# 2. Check if errors remain
npm run lint

# 3. Build the project
npm run build

# 4. Update Python service
cd ml-service
pip install -r requirements.txt
python app.py
```

Expected output after fixes:
- ✅ No ESLint errors
- ✅ Build completes successfully
- ✅ Python service starts without import errors
- ✅ Gemini API calls work with valid model names

---

## ESTIMATED TIME TO FIX ALL

| Fix | Time | Difficulty |
|-----|------|-----------|
| 1. Gemini models | 2 min | Easy |
| 2. process.env conversion | 5 min | Easy |
| 3. Remove motion imports | 10 min | Easy |
| 4. Fix typo | 1 min | Trivial |
| 5. Remove unused vars | 5 min | Easy |
| 6. Python dependencies | 2 min | Trivial |
| 7. Complete analysisEngine | 15 min | Medium |
| 8. Add env vars | 2 min | Trivial |
| 9. PPTX detection | 5 min | Easy |
| 10. Build scripts | 2 min | Trivial |
| **TOTAL** | **49 min** | **Easy-Medium** |

---

## SCRIPT TO APPLY SOME FIXES AUTOMATICALLY

Run this to auto-fix some issues:

```bash
# Fix unused variables and formatting
npm run lint:fix

# The following still need manual fixes:
# - Gemini model names (grep-search then manual edit)
# - process.env conversion (global find-replace)
# - Complete analysisEngine.js (manual coding)
```
