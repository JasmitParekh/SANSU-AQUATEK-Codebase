# ACTIONS — Reference

**Purpose:** Action config for AppSheet tables in EMPLOYEE DETAILS SHEET.  
**Last Updated:** 2026-05-22  

---

## Table of Contents

1. [EMPLOYMENT DETAILS](#1-employment-details)
   - [DOWNLOAD VIEW](#11-download-view)
2. [PERSONAL INFORMATION](#2-personal-information)
   - [DOWNLOAD FILTER](#21-download-filter)
   - [Go to Table View](#22-go-to-table-view)
   - [Open Gmail](#23-open-gmail)
   - [Recalculate Employee Code](#24-recalculate-employee-code)
   - [Show Permanent Map](#25-show-permanent-map)
3. [SITES](#3-sites)
   - [Show Map](#31-show-map)

---

## 1. EMPLOYMENT DETAILS

### 1.1 DOWNLOAD VIEW

| Property | Value |
|----------|-------|
| Action Name | `DOWNLOAD VIEW` |
| For a record of | `EMPLOYMENT DETAILS` |
| Do this | App: export this view to a CSV file *(not a row-level action)* |
| CSV File Locale | English (India) |
| Position | Prominent |

---

## 2. PERSONAL INFORMATION

### 2.1 DOWNLOAD FILTER

| Property | Value |
|----------|-------|
| Action Name | `DOWNLOAD FILTER` |
| For a record of | `PERSONAL INFORMATION` |
| Do this | App: export this view to a CSV file *(not a row-level action)* |
| CSV File Locale | English (India) |
| Position | Prominent |

---

### 2.2 Go to Table View

| Property | Value |
|----------|-------|
| Action Name | `Go to Table View` |
| For a record of | `PERSONAL INFORMATION` |
| Do this | App: go to another view within this app |
| Target | `LINKTOVIEW("EMPLOYEE DIRECTORY TABLE")` |
| Position | Prominent |
| Only if condition is true | `CONTEXT("View") = "EMPLOYEE DIRECTORY CARDS"` |

---

### 2.3 Open Gmail

| Property | Value |
|----------|-------|
| Action Name | `Open Gmail` |
| For a record of | `PERSONAL INFORMATION` |
| Do this | External: go to a website |
| Target | `"https://mail.google.com"` |
| Position | Prominent |
| Only if condition is true | `true` |

---

### 2.4 Recalculate Employee Code

| Property | Value |
|----------|-------|
| Action Name | `Recalculate Employee Code` |
| For a record of | `PERSONAL INFORMATION` |
| Do this | Data: set the values of some columns in this row |
| Position | Hide |
| Only if condition is true | `true` |

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

---

### 2.5 Show Permanent Map

| Property | Value |
|----------|-------|
| Action Name | `Show Permanent Map` |
| For a record of | `PERSONAL INFORMATION` |
| Do this | External: go to a website |
| Target | `CONCATENATE("https://www.google.com/maps/search/?api=1&query=", ENCODEURL([PERMANENT ADDRESS]))` |
| Position | Inline |
| Attach to Column | `PERMANENT ADDRESS` |
| Only if condition is true | `true` |

---

## 3. SITES

### 3.1 Show Map

| Property | Value |
|----------|-------|
| Action Name | `Show Map` |
| For a record of | `SITES` |
| Do this | External: go to a website |
| Target | `CONCATENATE("https://www.google.com/maps/search/?api=1&query=", ENCODEURL([LOCATION]))` |
| Position | Prominent |
| Only if condition is true | `true` |
