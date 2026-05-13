# Compliance Document Generation

## Overview
Google Apps Script (GAS) project containing the core logic to generate and update statutory compliance documents. 

## Deployment Architecture
* **Type:** GAS Library
* **Library Identifier:** `Documents`
* **Consumers:** Site-specific GAS projects
* **Dependencies:** Requires the `SharedUtils` GAS library.

## Modules
* `employeeDetails.js`: Core employee data handling.
* `attendanceSalarySheet.js`: Attendance and payroll logic.
* `ESIC-PF.js`: Employee State Insurance and Provident Fund calculations.
* `bonus.js`: Bonus computation logic.
* `form-18.js`: Form-18 generation.

## Usage Notes
* When calling functions from site-specific scripts, prefix with the library identifier (e.g., `Documents.functionName()`).
* Date logic parameters across compliance scripts use `0` for the previous month and `1` for the current month.
