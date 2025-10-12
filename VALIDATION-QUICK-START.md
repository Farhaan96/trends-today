# Semantic Validation - Quick Start Card

**🚀 3-Step Validation (Run BEFORE Research)**

---

## Step 1: Semantic Similarity Check ⚡ (PRIMARY)

```bash
node utils/semantic-similarity-checker.js check "Your Title" "Brief description" [category]
```

**✅ PASS:** Similarity < 85% → **PROCEED**
**❌ FAIL:** Similarity ≥ 85% → **STOP** (get new topic)

---

## Step 2: Category Saturation Check 📊

```bash
node utils/content-diversity-manager.js analyze [category]
```

**✅ GOOD:** Topic not in oversaturatedTopics → **PROCEED**
**⚠️ WARNING:** Topic in oversaturatedTopics → **GET NEW TOPIC**

---

## Step 3: Get Unique Topics 💡 (If Needed)

```bash
node utils/smart-topic-discovery.js discover [category] 5
```

**Returns:** 5 unique topics ranked by uniqueness score (0-100%)

---

## Categories

`health` | `technology` | `science` | `space` | `psychology` | `culture`

---

## Quick Examples

### ✅ Good (Unique Topic)

```bash
$ node utils/semantic-similarity-checker.js check "Bioelectric Medicine" "Electric signals treat pain" health
→ 43% similarity ✅ PROCEED
```

### ❌ Bad (Duplicate Topic)

```bash
$ node utils/semantic-similarity-checker.js check "CRISPR Cures Baby" "Gene editing breakthrough" health
→ 91% similarity ❌ STOP
```

---

## Validation Checklist

```
✅ Pre-Flight Validation:
  □ Semantic check: PASSED (< 85%)
  □ Saturation check: PASSED (topic not oversaturated)
  □ Cross-category: PASSED (no overlap)
  □ Timestamp: [DATE]
```

---

## When Validation Fails

**Option 1:** Smart Topic Discovery

```bash
node utils/smart-topic-discovery.js discover [category] 5
```

**Option 2:** Gap Analysis

```bash
node utils/smart-topic-discovery.js gaps [category]
```

**Option 3:** Trending Topics

```bash
node utils/smart-topic-discovery.js trending [category]
```

---

## Similarity Scale

| Score   | Meaning      | Action                           |
| ------- | ------------ | -------------------------------- |
| 85-100% | Duplicate    | ❌ STOP                          |
| 70-84%  | Very similar | ⚠️ Review                        |
| 60-69%  | Related      | ✅ Proceed (ensure unique angle) |
| 0-59%   | Unique       | ✅ Proceed                       |

---

## Full Documentation

📚 See [SEMANTIC-VALIDATION-GUIDE.md](SEMANTIC-VALIDATION-GUIDE.md) for complete guide

---

**Last Updated:** 2025-01-11 | **Version:** 2.0
