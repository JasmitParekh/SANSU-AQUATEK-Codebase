# EMPLOYMENT DETAILS — Schema Reference

**Purpose:** Column config, formulas, and logic for `EMPLOYMENT DETAILS` table in AppSheet.
**Source Table:** `EMPLOYMENT DETAILS` (from EMPLOYEE DETAILS SHEET)
**Last Updated:** 2026-05-20

---

## Table of Contents

1. [System Columns](#1-system-columns)
2. [References](#2-references)
3. [Role & Classification](#3-role--classification)
4. [Dates & Exit](#4-dates--exit)
5. [Complex Formulas Reference](#5-complex-formulas-reference)

---

## Column Table Key

| Symbol | Meaning |
|--------|---------|
| ✅ | Yes |
| ❌ | No |
| — | Not applicable |

**Columns:** `Show?` · `Type` · `Req?` (Required) · `Key?` · `Edit?` (Editable) · `Label?` · `Search?` · `PII?`

---

## 1. System Columns

> Auto-generated. Used as primary key. Not editable by user.

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `SL. NO.` | ❌ | Number | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Initial: `MAX(EMPLOYMENT DETAILS[SL. NO.]) + 1` |

---

## 2. References

> Ref columns linking to other tables. Display names shown in UI instead of IDs.

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Source Table | Display Name | Part Of? |
|--------|-------|------|------|------|-------|--------|---------|------|-------------|-------------|----------|
| `EMPID` | ✅ | Ref | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | `PERSONAL INFORMATION` | `NAME` | ✅ |
| `SITEID` | ✅ | Ref | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | `SITES` | `SITE` | ❌ |
| `DEPARTMENTID` | ✅ | Ref | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | `DEPARTMENTS` | `DEPARTMENT` | ❌ |

---

## 3. Role & Classification

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `DESIGNATION` | ✅ | Enum | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | Allow other: ✅ · Auto-complete: ✅ · Base type: Text |
| `CATEGORY` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | App Formula: IFS on DESIGNATION → see [§5.1](#51-category) |
| `SALARY` | ✅ | Price | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | — |
| `STATUS` | ✅ | Enum | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | Values: `ACTIVE`, `LEFT` · Allow other: ❌ · Auto-complete: ✅ · Base type: Text |

---

## 4. Dates & Exit

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `DATE OF INTERVIEW` | ✅ | Date | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | — |
| `DATE OF JOINING` | ✅ | Date | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | — |
| `DATE OF EXIT` | ✅ | Date | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | — |
| `REASON FOR EXIT` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | — |

---

## 5. Complex Formulas Reference

### 5.1 CATEGORY

App Formula — derives skill category from DESIGNATION:

```appsheet
IFS(
  ISBLANK([DESIGNATION]), "",
  OR(
    CONTAINS([DESIGNATION], "HELPER"),
    CONTAINS([DESIGNATION], "FIREMAN")
  ), "UNSKILLED",
  TRUE, "SKILLED"
)
```

> Logic: blank DESIGNATION → empty. HELPER or FIREMAN → `UNSKILLED`. Everything else → `SKILLED`.
