# PERSONAL INFORMATION — Schema Reference

**Purpose:** Column config, formulas, and logic for `PERSONAL INFORMATION` table in AppSheet.
**Source Table:** `PERSONAL INFORMATION` (from EMPLOYEE DETAILS SHEET)
**Last Updated:** 19-05-2026

---

## Table of Contents

1. [System Columns](#1-system-columns)
2. [Basic Information](#2-basic-information)
3. [Contact & Address](#3-contact--address)
4. [Government & Banking](#4-government--banking)
5. [Employment & Compliance](#5-employment--compliance)
6. [Media & Remarks](#6-media--remarks)
7. [Virtual Columns](#7-virtual-columns)
8. [Page Header Columns](#8-page-header-columns)
9. [Complex Formulas Reference](#9-complex-formulas-reference)

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

> Auto-generated. Not shown in UI. Not editable by user.

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `SR. NO.` | ❌ | Number | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Initial: `MAX(PERSONAL INFORMATION[SL. NO.]) + 1` |
| `EMPID` | ❌ | Text | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Initial: `"EMP" & RIGHT("00000" & [SL. NO.], 5)` |
| `EMPLOYEE CODE` | ✅ | Text | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | Initial: SWITCH by COMPANY → see [§9.1](#91-employee-code) |

---

## 2. Basic Information

> Matches **Page 1 — Basic Information** in AppSheet form.

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `COMPANY` | ✅ | Enum | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | Values: `AQUATEK SERVICE`, `SANSU AQUATEK`, `AQUATEK ENGINEERS` |
| `NAME` | ✅ | Name | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | App Formula: `[FIRST NAME] & " " & IF(ISNOTBLANK([FATHER'S/HUSBAND'S NAME]), LEFT([FATHER'S/HUSBAND'S NAME], 1) & ". ", "") & [SURNAME]` |
| `FIRST NAME` | ✅ | Name | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `FATHER'S/HUSBAND'S NAME` | ✅ | Name | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `SURNAME` | ✅ | Name | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `SEX` | ✅ | Enum | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | Values: `M`, `F` |
| `DATE OF BIRTH` | ✅ | Date | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `AGE` | ✅ | Number | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | App Formula: `FLOOR(TOTALHOURS(TODAY() - [DATE OF BIRTH]) / 8766)` |
| `BLOOD GROUP` | ✅ | Enum | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | Values: `A+` `A-` `B+` `B-` `O+` `O-` `AB+` `AB-` · Allow other: ✅ |
| `NATIONALITY` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | — |
| `EDUCATION LEVEL` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `MARITAL STATUS` | ✅ | Enum | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | Values: `MARRIED`, `UNMARRIED` · Allow other: ❌ |
| `SPOUSE NAME` | ✅ | Name | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `RELIGION` | ✅ | Enum | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | Values: `HINDU`, `MUSLIM`, `CHRISTIAN` · Allow other: ✅ |
| `MARK OF IDENTIFICATION` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |

---

## 3. Contact & Address

> Matches **Page 2 — Contact & Address** in AppSheet form.

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `MOBILE NUMBER` | ✅ | Phone | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | Callable ✅ · Textable ✅ |
| `EMAIL` | ✅ | Email | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `NAME OF PERSON / RELATION IN CASE OF EMERGENCY` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | — |
| `EMERGENCY MOBILE NUMBER` | ✅ | Phone | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | Callable ✅ · Textable ✅ |
| `PERMANENT ADDRESS` | ✅ | LongText | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `CITY (PERMANENT)` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `PIN (PERMANENT)` | ✅ | Number | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `DISTRICT (PERMANENT)` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `STATE (PERMANENT)` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `SAME AS PERMANENT?` | ✅ | Yes/No | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | Drives initial value + reset for all PRESENT fields |
| `PRESENT ADDRESS` | ✅ | LongText | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | Initial: `IF([SAME AS PERMANENT?] = TRUE, [PERMANENT ADDRESS], "")` · Reset: see [§9.2](#92-present-address-reset-conditions) |
| `CITY (PRESENT)` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | Initial: `IF([SAME AS PERMANENT?] = TRUE, [CITY (PERMANENT)], "")` · Reset: see [§9.2](#92-present-address-reset-conditions) |
| `PIN (PRESENT)` | ✅ | Number | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | Initial: `IF([SAME AS PERMANENT?] = TRUE, [PIN (PERMANENT)], "")` · Reset: see [§9.2](#92-present-address-reset-conditions) |
| `DISTRICT (PRESENT)` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | Initial: `IF([SAME AS PERMANENT?] = TRUE, [DISTRICT (PERMANENT)], "")` · Reset: see [§9.2](#92-present-address-reset-conditions) |
| `STATE (PRESENT)` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | Initial: `IF([SAME AS PERMANENT?] = TRUE, [STATE (PERMANENT)], "")` · Reset: see [§9.2](#92-present-address-reset-conditions) |

---

## 4. Government & Banking

> Matches **Page 3 — Government & Banking Details** in AppSheet form.

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `UAN` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `PAN` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `ESIC IP` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `LWF` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `NAME AS PER AADHAR` | ✅ | Name | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `AADHAR NUMBER` | ✅ | Number | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | Valid If: unique across table · Error: `"AADHAR NUMBER ALREADY EXISTS"` · see [§9.3](#93-aadhar-uniqueness-check) |
| `BANK NAME` | ✅ | Name | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `BANK ACCOUNT NUMBER` | ✅ | Number | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |
| `IFSC CODE` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | — |

---

## 5. Employment & Compliance

> Matches **Page 4 — Employment & Docs** in AppSheet form.

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `NUMBER AND DATE OF CERTIFICATE OF FITNESS` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | — |
| `NUMBER UNDER SECTION 68` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | — |
| `ALPHABET ASSIGNED` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | — |
| `NO. OF RELAY IF WORKING IN SHIFTS` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | — |
| `POLICE VERIFICATION` | ✅ | Yes/No | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | — |

---

## 6. Media & Remarks

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `PHOTO` | ✅ | Image | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | Folder: `Pictures/Images` |
| `SIGNATURE` | ✅ | Image | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | Folder: `Pictures/Signatures` |
| `REMARKS` | ✅ | Text | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | — |

---

## 7. Virtual Columns

> Computed only. Not stored in sheet. Not editable.

| Column | Type | Search? | Source Table | App Formula |
|--------|------|---------|-------------|-------------|
| `Related EMPLOYMENT DETAILSs` | List\<Ref\> | ✅ | `EMPLOYMENT DETAILS` | `REF_ROWS("EMPLOYMENT DETAILS", "EMPID")` |
| `Related DOCUMENTSs` | List\<Ref\> | ✅ | `DOCUMENTS` | `REF_ROWS("DOCUMENTS", "EMPID")` |
| `SITES` | Ref | ✅ | `SITES` | SELECT latest EMPLOYMENT DETAILS row by DATE OF JOINING → return SITEID · see [§9.4](#94-sites-virtual) |
| `STATUS \ DESIGNATION` | Text | ✅ | `EMPLOYMENT DETAILS` | Concat STATUS + DESIGNATION from latest employment row · see [§9.5](#95-status--designation-virtual) |

---

## 8. Page Header Columns

> Virtual display-only columns. Category: `Page_Header`. App Formula: `""`.

| Column | Content |
|--------|---------|
| `Page_1_Basic_Info` | `"1. BASIC INFORMATION"` |
| `Page_2_Contact` | `"2. CONTACT & ADDRESS"` |
| `Page_3_Government_Banking` | `"3. GOVERNMENT & BANKING DETAILS"` |
| `Page_4_Employement_&_Docs` | `"4. EMPLOYMENT AND DOCUMENTS"` |

---

## 9. Complex Formulas Reference

### 9.1 EMPLOYEE CODE

Initial Value — switches prefix and counter by COMPANY:

```appsheet
SWITCH([COMPANY],
  "AQUATECH SERVICES", "AQS" & RIGHT("000" & (COUNT(FILTER("PERSONAL INFORMATION", [COMPANY] = "AQUATECH SERVICES")) + 1), 3),
  "AQUATEK ENGINEERS", "AQE" & RIGHT("000" & (COUNT(FILTER("PERSONAL INFORMATION", [COMPANY] = "AQUATEK ENGINEERS")) + 1), 3),
  "SANSU AQUATEK",     "SAIPL" & RIGHT("00000" & (COUNT(FILTER("PERSONAL INFORMATION", [COMPANY] = "SANSU AQUATEK")) + 1), 5),
  ""
)
```

---

### 9.2 PRESENT Address Reset Conditions

Each PRESENT field resets when: (a) `SAME AS PERMANENT?` toggle changes, OR (b) toggle is TRUE and matching PERMANENT field changes.

Pattern same for all 5 fields — example for `PRESENT ADDRESS`:

```appsheet
OR(
  [_THISROW_BEFORE].[SAME AS PERMANENT?] <> [_THISROW_AFTER].[SAME AS PERMANENT?],
  AND(
    [_THISROW_AFTER].[SAME AS PERMANENT?] = TRUE,
    [_THISROW_BEFORE].[PERMANENT ADDRESS] <> [_THISROW_AFTER].[PERMANENT ADDRESS]
  )
)
```

Replace `[PERMANENT ADDRESS]` with the matching permanent field for other columns:
- `CITY (PRESENT)` → `[CITY (PERMANENT)]`
- `PIN (PRESENT)` → `[PIN (PERMANENT)]`
- `DISTRICT (PRESENT)` → `[DISTRICT (PERMANENT)]`
- `STATE (PRESENT)` → `[STATE (PERMANENT)]`

---

### 9.3 Aadhar Uniqueness Check

Valid If formula — rejects duplicate Aadhar across all rows:

```appsheet
ISBLANK(
  FILTER(
    "PERSONAL INFORMATION", 
    AND(
      ([AADHAR NUMBER] = [_THIS]), 
      ([_RowNumber] <> [_THISROW].[_RowNumber])
    )
  )
)
```

Invalid value error: `"AADHAR NUMBER ALREADY EXISTS"`

---

### 9.4 SITES (Virtual)

Finds SITEID from the most recent EMPLOYMENT DETAILS row for this employee:

```appsheet
ANY(
  SELECT(
    EMPLOYMENT DETAILS[SITEID],
    [SL. NO.] = MAXROW(
      "EMPLOYMENT DETAILS", 
      "DATE OF JOINING", 
      [EMPID] = [_THISROW].[EMPID]
    )
  )
)
```

---

### 9.5 STATUS | DESIGNATION (Virtual)

Concats STATUS and DESIGNATION from most recent EMPLOYMENT DETAILS row:

```appsheet
ANY(
  SELECT(
    EMPLOYMENT DETAILS[STATUS],
    [SL. NO.] = MAXROW(
      "EMPLOYMENT DETAILS", 
      "DATE OF JOINING", 
      [EMPID] = [_THISROW].[EMPID]
    )
  )
)
& " | " &
ANY(
  SELECT(
    EMPLOYMENT DETAILS[DESIGNATION],
    [SL. NO.] = MAXROW(
      "EMPLOYMENT DETAILS", 
      "DATE OF JOINING", 
      [EMPID] = [_THISROW].[EMPID]
    )
  )
)
```
