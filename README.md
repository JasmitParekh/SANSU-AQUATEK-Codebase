# SANSU AQUATEK Codebase

Centralized repository for SANSU AQUATEK internal workflow automations.

## Overview
This repository hosts custom Google Apps Script modules and AppSheet formula documentation used for data management and automation.

## Components

### 1. Google Apps Script
Source code for backend automations and triggers.
* **Compliance System:** Automated generation of labor registers (Form-A, Form-13, Form-15). 
  * *Note:* Date logic parameters use `0` for the previous month and `1` for the current month.
* **Email Migration:** Utilities handling the transition from Zoho to Google Workspace.

### 2. AppSheet Logic
Documentation of complex relational logic, tracked here since AppSheet lacks native version control.
* **Employee Management:** Relational schema definitions, automated compliance checks, and virtual column formulas.

## Maintenance
* **Apps Script:** Changes should be managed via `clasp` (`clasp pull` / `clasp push`).
* **AppSheet:** Update the respective markdown files manually whenever modifying AppFormulas, Valid_If, or Show_If conditions directly in the AppSheet editor.
