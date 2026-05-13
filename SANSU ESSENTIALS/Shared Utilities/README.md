# Shared Utilities

## Overview
Google Apps Script (GAS) project providing shared utility functions organized by operational tiers. 

## Deployment Architecture
* **Type:** GAS Library
* **Library Identifier:** `SharedUtils`
* **Consumers:** Compliance Document Generation (GAS Library)

## Modules
* `exports.js`: Library export configurations and public API definitions.
* `tier1.js`: PURE UTILITY FUNCTIONS (No Dependencies).
* `tier2.js`: HEADER DETECTION FUNCTIONS.
* `tier3.js`: ADVANCED UTILITY FUNCTIONS (Use Tier 1 & 2).

## Usage Notes
* Functions from this library are accessed within consumer projects using the `SharedUtils.` prefix.
