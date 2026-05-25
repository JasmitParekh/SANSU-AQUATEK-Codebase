# FORMAT RULES — Reference

**Purpose:** Format rule config for AppSheet tables in EMPLOYEE DETAILS SHEET.  
**Last Updated:** 2026-05-25  

---

## Table of Contents

1. [Highlight Left Employees — `PERSONAL INFORMATION`](#1-highlight-left-employees--personal-information)
2. [Highlight Left Employees 2 — `EMPLOYMENT DETAILS`](#2-highlight-left-employees-2--employment-details)
3. [Highlight Closed Sites — `SITES`](#3-highlight-closed-sites--sites)

---

## 1. Highlight Left Employees — `PERSONAL INFORMATION`

| Property | Value |
|----------|-------|
| Rule Name | `Highlight Left Employees` |
| For this data | `PERSONAL INFORMATION` |
| Condition | `CONTAINS([STATUS \| DESIGNATION], "LEFT")` |
| Text Color | 🔴 Red |

**Columns to format:**

<table>
  <tr>
    <td>EMPLOYEE CODE</td>
    <td>NAME</td>
    <td>SITES</td>
    <td>STATUS \ DESIGNATION</td>
  </tr>
</table>

---

## 2. Highlight Left Employees 2 — `EMPLOYMENT DETAILS`

| Property | Value |
|----------|-------|
| Rule Name | `Highlight Left Employees 2` |
| For this data | `EMPLOYMENT DETAILS` |
| Condition | `CONTAINS([STATUS], "LEFT")` |
| Text Color | 🔴 Red |

**Columns to format:**

<table>
  <tr>
    <td>SL. NO.</td>
    <td>EMPID</td>
    <td>SITEID</td>
    <td>DEPARTMENTID</td>
    <td>DESIGNATION</td>
  </tr>
  <tr>
    <td>CATEGORY</td>
    <td>SALARY</td>
    <td>DATE OF INTERVIEW</td>
    <td>DATE OF JOINING</td>
    <td>DATE OF EXIT</td>
  </tr>
  <tr>
    <td>REASON FOR EXIT</td>
    <td>STATUS</td>
    <td>View Ref (EMPID) (action)</td>
    <td>View Ref (SITEID) (action)</td>
    <td>View Ref (DEPARTMENTID) (action)</td>
  </tr>
</table>

---

## 3. Highlight Closed Sites — `SITES`

| Property | Value |
|----------|-------|
| Rule Name | `Highlight Closed Sites` |
| For this data | `SITES` |
| Condition | `CONTAINS([STATUS], "INACTIVE")` |
| Text Color | 🔴 Red |

**Columns to format:**

<table>
  <tr>
    <td>SITEID</td>
    <td>SITE NAME</td>
    <td>GST NUMBER</td>
    <td>LOCATION</td>
  </tr>
  <tr>
    <td>START DATE</td>
    <td>END DATE</td>
    <td>Related EMPLOYMENT DETAILSs</td>
    <td>Related PERSONAL INFORMATIONs</td>
  </tr>
</table>
