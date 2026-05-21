# SITES — Schema Reference

**Purpose:** Column config, formulas, and logic for `SITES` table in AppSheet.
**Source Table:** `SITES` (from EMPLOYEE DETAILS SHEET)
**Last Updated:** 2026-05-20

---

## Table of Contents

1. [System Columns](#1-system-columns)
2. [Site Details](#2-site-details)
3. [Status & Dates](#3-status--dates)
4. [Virtual Columns](#4-virtual-columns)

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
| `SITEID` | ✅ | Text | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | Initial: `"SITE" & RIGHT("000" & (COUNT(SITES[_RowNumber]) + 1), 3)` |

---

## 2. Site Details

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `SITE NAME` | ✅ | Name | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | — |
| `GST NUMBER` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `LOCATION` | ✅ | LongText | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | — |
| `ATTENDANCE SALARY URL` | ✅ | Url | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `DRIVE URL` | ✅ | Url | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |

---

## 3. Status & Dates

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `START DATE` | ✅ | Date | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | — |
| `END DATE` | ✅ | Date | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | — |
| `STATUS` | ✅ | Enum | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | Values: `ACTIVE`, `INACTIVE` |

---

## 4. Virtual Columns

> Computed only. Not stored in sheet. Not editable.

| Column | Type | Search? | Referenced Table | Referenced Column | App Formula |
|--------|------|---------|-----------------|------------------|-------------|
| `Related DEPARTMENTSs` | List\<Ref\> | ✅ | `DEPARTMENTS` | `SITEID` | `REF_ROWS("DEPARTMENTS", "SITEID")` |
| `Related EMPLOYMENT DETAILSs` | List\<Ref\> | ✅ | `EMPLOYMENT DETAILS` | `SITEID` | `REF_ROWS("EMPLOYMENT DETAILS", "SITEID")` |
| `Related PERSONAL INFORMATIONs` | List\<Ref\> | ✅ | `PERSONAL INFORMATION` | `SITES` | `REF_ROWS("PERSONAL INFORMATION", "SITES")` |
