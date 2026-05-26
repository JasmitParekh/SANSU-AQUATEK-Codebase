# BOTS: PERSONAL INFORMATION — Reference

**Purpose:** Bot config for `PERSONAL INFORMATION` table in AppSheet.  
**Table:** `PERSONAL INFORMATION`  
**Last Updated:** 2026-05-26  

---

## Table of Contents

1. [Bot 1 — Call Script: PERSONAL INFORMATION](#1-bot-1--call-script-personal-information)
   - [1.1 Event](#11-event)
   - [1.2 Process](#12-process)
2. [Bot 2 — Run Action: EMPLOYEE CODE](#2-bot-2--run-action-employee-code)
   - [2.1 Event](#21-event)
   - [2.2 Process](#22-process)

---

## 1. Bot 1 — Call Script: PERSONAL INFORMATION

### 1.1 Event

| Property | Value |
|----------|-------|
| Event Name | `Data Change PERSONAL INFORMATION` |
| Event Source | App |
| Table | `PERSONAL INFORMATION` |
| On Add | ✅ |
| On Update | ✅ |
| On Delete | ✅ |

**Condition:**

```appsheet
OR(
  LEFT([PHOTO], 9) = "Pictures/",
  LEFT([SIGNATURE], 9) = "Pictures/"
)
```

---

### 1.2 Process

> 2 steps, identical in structure. Each calls `processAppSheetTrigger()` via the `HandleDocs` project, with only `columnName`, `newValue`, and `oldValue` changing per step.

**Common settings across all steps:**

| Property | Value |
|----------|-------|
| Step Type | Run a task → Custom task |
| Settings | Call a script |
| Apps Script Project | `HandleDocs` |
| Function Name | `processAppSheetTrigger(sheetName, columnName, empId, newValue, oldValue)` |
| `sheetName` | `PERSONAL INFORMATION` *(same for all steps)* |
| `empId` | `[EMPID]` *(same for all steps)* |

---

#### Step 1 — PHOTO Processing

| Parameter | Value |
|-----------|-------|
| `columnName` | `PHOTO` |
| `newValue` | `[PHOTO]` |
| `oldValue` | `[_THISROW_BEFORE].[PHOTO]` |

---

#### Step 2 — SIGNATURE Processing

| Parameter | Value |
|-----------|-------|
| `columnName` | `SIGNATURE` |
| `newValue` | `[SIGNATURE]` |
| `oldValue` | `[_THISROW_BEFORE].[SIGNATURE]` |

---

## 2. Bot 2 — Run Action: EMPLOYEE CODE

### 2.1 Event

| Property | Value |
|----------|-------|
| Event Name | `Data Change EMPLOYEE CODE` |
| Event Source | App |
| Table | `PERSONAL INFORMATION` |
| On Add | ❌ |
| On Update | ✅ |
| On Delete | ❌ |

**Condition:**

```appsheet
[_THISROW_BEFORE].[COMPANY] <> [_THISROW_AFTER].[COMPANY]
```

> Triggers only when the `COMPANY` value changes on an existing row.

---

### 2.2 Process

| Property | Value |
|----------|-------|
| Step Type | Run a data action |
| Action Name | `Recalculate Employee Code` |
| Action Type | Set row values |

**Columns set by this action:**

`EMPLOYEE CODE` =
```appsheet
SWITCH([COMPANY],
  "AQUATECH SERVICES", "AQS" & RIGHT("000" & (COUNT(FILTER("PERSONAL INFORMATION", [COMPANY] = "AQUATECH SERVICES")) + 1), 3),
  "AQUATEK ENGINEERS", "AQE" & RIGHT("000" & (COUNT(FILTER("PERSONAL INFORMATION", [COMPANY] = "AQUATEK ENGINEERS")) + 1), 3),
  "SANSU AQUATEK", "SAIPL" & RIGHT("00000" & (COUNT(FILTER("PERSONAL INFORMATION", [COMPANY] = "SANSU AQUATEK")) + 1), 5),
  ""
)
```
