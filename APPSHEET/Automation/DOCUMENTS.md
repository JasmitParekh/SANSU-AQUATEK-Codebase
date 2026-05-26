# BOT: Data Change — Reference

**Purpose:** Bot config for document image processing in AppSheet.  
**Table:** `DOCUMENTS`  
**Last Updated:** 2026-05-22  

---

## Table of Contents

1. [Event](#1-event)
2. [Process](#2-process)
   - [Step 1 — AADHAR CARD](#step-1--aadhar-card-processing)
   - [Step 2 — I-CARD](#step-2--i-card-processing)
   - [Step 3 — PAN CARD](#step-3--pan-card-processing)
   - [Step 4 — POLICE VERIFICATION](#step-4--police-verification-processing)
   - [Step 5 — BANK PASSBOOK](#step-5--bank-passbook-processing)
   - [Step 6 — VOTING CARD](#step-6--voting-card-processing)
   - [Step 7 — MEDICAL REPORT](#step-7--medical-report-processing)

---

## 1. Event

| Property | Value |
|----------|-------|
| Event Name | `Data Change` |
| Event Source | App |
| Table | `DOCUMENTS` |
| On Add | ✅ |
| On Delete | ❌ |
| On Update | ✅ |

**Condition:**

```appsheet
OR(
  LEFT([AADHAR CARD], 9) = "Pictures/",
  LEFT([I-CARD], 9) = "Pictures/",
  LEFT([PAN CARD], 9) = "Pictures/",
  LEFT([POLICE VERIFICATION], 9) = "Pictures/",
  LEFT([BANK PASSBOOK], 9) = "Pictures/",
  LEFT([VOTING CARD], 9) = "Pictures/",
  LEFT([MEDICAL REPORT], 9) = "Pictures/"
)
```

---

## 2. Process

> All 7 steps are identical in structure. Each calls the same Apps Script function `processAppSheetTrigger()` via the `HandleDocs` project, with only `columnName`, `newValue`, and `oldValue` parameters changing per step.

**Common settings across all steps:**

| Property | Value |
|----------|-------|
| Step Type | Run a task → Custom task |
| Settings | Call a script |
| Apps Script Project | `HandleDocs` |
| Function Name | `processAppSheetTrigger(sheetName, columnName, empId, newValue, oldValue)` |
| `sheetName` | `DOCUMENTS` *(same for all steps)* |
| `empId` | `[EMPID]` *(same for all steps)* |

---

### Step 1 — AADHAR CARD Processing

| Parameter | Value |
|-----------|-------|
| `columnName` | `AADHAR CARD` |
| `newValue` | `[AADHAR CARD]` |
| `oldValue` | `[_THISROW_BEFORE].[AADHAR CARD]` |

---

### Step 2 — I-CARD Processing

| Parameter | Value |
|-----------|-------|
| `columnName` | `I-CARD` |
| `newValue` | `[I-CARD]` |
| `oldValue` | `[_THISROW_BEFORE].[I-CARD]` |

---

### Step 3 — PAN CARD Processing

| Parameter | Value |
|-----------|-------|
| `columnName` | `PAN CARD` |
| `newValue` | `[PAN CARD]` |
| `oldValue` | `[_THISROW_BEFORE].[PAN CARD]` |

---

### Step 4 — POLICE VERIFICATION Processing

| Parameter | Value |
|-----------|-------|
| `columnName` | `POLICE VERIFICATION` |
| `newValue` | `[POLICE VERIFICATION]` |
| `oldValue` | `[_THISROW_BEFORE].[POLICE VERIFICATION]` |

---

### Step 5 — BANK PASSBOOK Processing

| Parameter | Value |
|-----------|-------|
| `columnName` | `BANK PASSBOOK` |
| `newValue` | `[BANK PASSBOOK]` |
| `oldValue` | `[_THISROW_BEFORE].[BANK PASSBOOK]` |

---

### Step 6 — VOTING CARD Processing

| Parameter | Value |
|-----------|-------|
| `columnName` | `VOTING CARD` |
| `newValue` | `[VOTING CARD]` |
| `oldValue` | `[_THISROW_BEFORE].[VOTING CARD]` |

---

### Step 7 — MEDICAL REPORT Processing

| Parameter | Value |
|-----------|-------|
| `columnName` | `MEDICAL REPORT` |
| `newValue` | `[MEDICAL REPORT]` |
| `oldValue` | `[_THISROW_BEFORE].[MEDICAL REPORT]` |
