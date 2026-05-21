# DEPARTMENTS — Schema Reference

**Purpose:** Column config, formulas, and logic for `DEPARTMENTS` table in AppSheet.
**Source Table:** `DEPARTMENTS` (from EMPLOYEE DETAILS SHEET)
**Last Updated:** 2026-05-21

---

## Table of Contents

1. [System Columns](#1-system-columns)
2. [References](#2-references)
3. [Department Details](#3-department-details)
4. [Status & Dates](#4-status--dates)
5. [Virtual Columns](#5-virtual-columns)

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
| `DEPARTMENTID` | ✅ | Text | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | Initial: `"DE" & RIGHT("000" & (COUNT(DEPARTMENTS[_RowNumber]) + 1), 3)` |

---

## 2. References

> Ref columns linking to other tables. Display names shown in UI instead of IDs.

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Source Table | Display Name | Part Of? |
|--------|-------|------|------|------|-------|--------|---------|------|-------------|-------------|----------|
| `SITEID` | ✅ | Ref | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | `SITES` | `SITE` | ✅ |

---

## 3. Department Details

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `DEPARTMENT NAME` | ✅ | Name | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | — |

---

## 4. Status & Dates

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `START DATE` | ✅ | Date | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | — |
| `END DATE` | ✅ | Date | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | — |
| `STATUS` | ✅ | Enum | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | Values: `ACTIVE`, `INACTIVE` |

---

## 5. Virtual Columns

> Computed only. Not stored in sheet. Not editable.

| Column | Type | Search? | Referenced Table | Referenced Column | App Formula |
|--------|------|---------|-----------------|------------------|-------------|
| `Related EMPLOYMENT DETAILSs` | List\<Ref\> | ✅ | `EMPLOYMENT DETAILS` | `DEPARTMENTID` | `REF_ROWS("EMPLOYMENT DETAILS", "DEPARTMENTID")` |
