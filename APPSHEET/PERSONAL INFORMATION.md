This .md file contains complete schema about PERSONAL INFORMATION table from EMPLOYEE DETAILS SHEET.

---

## Column Configuration

| Column Name | Show? | Type | Require? | Key | Editable? | Label | Search? | PII? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `SR. NO.` | ❌ | `Number` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `EMPID` | ❌ | `Text` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `COMPANY` | ✅ | `Enum` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| `EMPLOYEE CODE` | ✅ | `Text` | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| `NAME` | ✅ | `Name` | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `FIRST NAME` | ✅ | `Name` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `FATHER'S/HUSBAND'S NAME` | ✅ | `Name` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `SURNAME` | ✅ | `Name` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `SEX` | ✅ | `Enum` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `DATE OF BIRTH` | ✅ | `Date` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `AGE` | ✅ | `Number` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `BLOOD GROUP` | ✅ | `Enum` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `PERMANENT ADDRESS` | ✅ | `LongText` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `CITY (PERMANENT)` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `PIN (PERMANENT)` | ✅ | `Number` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `DISTRICT (PERMANENT)` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `STATE (PERMANENT)` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `SAME AS PERMANENT?` | ✅ | `Yes/No` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `PRESENT ADDRESS` | ✅ | `LongText` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `CITY (PRESENT)` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `PIN (PRESENT)` | ✅ | `Number` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `DISTRICT (PRESENT)` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `STATE (PRESENT)` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `NATIONALITY` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `EDUCATION LEVEL` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `MOBILE NUMBER` | ✅ | `Phone` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| `NAME OF PERSON / RELATION IN CASE OF EMERGENCY` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| `EMERGENCY MOBILE NUMBER` | ✅ | `Phone` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `EMAIL` | ✅ | `Email` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `MARITAL STATUS` | ✅ | `Enum` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `SPOUSE NAME` | ✅ | `Name` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `RELIGION` | ✅ | `Enum` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `UAN` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `PAN` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `ESIC IP` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `LWF` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `NAME AS PER AADHAR` | ✅ | `Name` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `AADHAR NUMBER` | ✅ | `Number` | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| `BANK NAME` | ✅ | `Name` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `BANK ACCOUNT NUMBER` | ✅ | `Number` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `IFSC CODE` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `MARK OF IDENTIFICATION` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `NUMBER AND DATE OF CERTIFICATE OF FITNESS` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `NUMBER UNDER SECTION 68` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `ALPHABET ASSIGNED` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `NO. OF RELAY IF WORKING IN SHIFTS` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `POLICE VERIFICATION` | ✅ | `Yes/No` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| `PHOTO` | ✅ | `Image` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `SIGNATURE` | ✅ | `Image` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `REMARKS` | ✅ | `Text` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `Related EMPLOYMENT DETAILSs` | ✅ | `List` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `SITES` | ✅ | `Ref` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `STATUS \ DESIGNATION` | ✅ | `Text` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `Related DOCUMENTSs` | ✅ | `List` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `Page_1_Basic_Info` | ✅ | Show | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `Page_2_Contact` | ✅ | Show | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `Page_3_Government_Banking` | ✅ | Show | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `Page_4_Employement_&_Docs` | ✅ | Show | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Formulas and other details

#### 1. SR. NO.
* Initial Value:
```appsheet
MAX(PERSONAL INFORMATION[SL. NO.]) + 1
```
#### 2. EMPID
* Initial Value:
```appsheet
"EMP" & RIGHT("00000" & [SL. NO.], 5)
```
#### 3. COMPANY
* Enum Values: `AQUATEK SERVICE`, `SANSU AQUATEK`, `AQUATEK ENGINEERS`
* Allow other values: ❌
* Auto-complete other values: ✅
* Base type: `Text`
#### 4. EMPLOYEE CODE
* Initial Value:
```appsheet
SWITCH([COMPANY],
  "AQUATECH SERVICES", "AQS" & RIGHT("000" & (COUNT(FILTER("PERSONAL INFORMATION", [COMPANY] = "AQUATECH SERVICES")) + 1), 3),
  "AQUATEK ENGINEERS", "AQE" & RIGHT("000" & (COUNT(FILTER("PERSONAL INFORMATION", [COMPANY] = "AQUATEK ENGINEERS")) + 1), 3),
  "SANSU AQUATEK", "SAIPL" & RIGHT("00000" & (COUNT(FILTER("PERSONAL INFORMATION", [COMPANY] = "SANSU AQUATEK")) + 1), 5),
  ""
)
```
#### 5. NAME
* App Formula:
```appsheet
[FIRST NAME] & " " & 
IF(ISNOTBLANK([FATHER'S/HUSBAND'S NAME]), LEFT([FATHER'S/HUSBAND'S NAME], 1) & ". ", "") & 
[SURNAME]
```
#### 6. SEX
* Enum Values: `M`, `F`
* Allow other values: ❌
* Auto-complete other values: ✅
* Base type: `Text`
#### 7. AGE
* App Formula:
```appsheet
FLOOR(TOTALHOURS(TODAY() - [DATE OF BIRTH]) / 8766)
```
#### 8. BLOOD GROUP
* Enum Values: `A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-`
* Allow other values: ✅
* Auto-complete other values: ✅
* Base type: `Text`
#### 9. PRESENT ADDRESS, CITY (PRESENT), PIN (PRESENT), DISTRICT (PRESENT), STATE (PRESENT)
* Initial Value:
  + PRESENT ADDRESS : `IF([SAME AS PERMANENT?] = TRUE, [PERMANENT ADDRESS], "")`
  + CITY (PRESENT) : `IF([SAME AS PERMANENT?] = TRUE, [CITY (PERMANENT)], "")`
  + PIN (PRESENT) : `IF([SAME AS PERMANENT?] = TRUE, [PIN (PERMANENT)], "")`
  + DISTRICT (PRESENT) : `IF([SAME AS PERMANENT?] = TRUE, [DISTRICT (PERMANENT)], "")`
  + STATE (PRESENT) : `IF([SAME AS PERMANENT?] = TRUE, [STATE (PERMANENT)], "")`
* Reset on edit?
  + PRESENT ADDRESS :
    ```appsheet
    OR(
      [_THISROW_BEFORE].[SAME AS PERMANENT?] <> [_THISROW_AFTER].[SAME AS PERMANENT?],
      AND(
        [_THISROW_AFTER].[SAME AS PERMANENT?] = TRUE,
        [_THISROW_BEFORE].[PERMANENT ADDRESS] <> [_THISROW_AFTER].[PERMANENT ADDRESS]
      )
    )
    ```
  + CITY (PRESENT) :
    ```appsheet
    OR(
      [_THISROW_BEFORE].[SAME AS PERMANENT?] <> [_THISROW_AFTER].[SAME AS PERMANENT?],
      AND(
        [_THISROW_AFTER].[SAME AS PERMANENT?] = TRUE,
        [_THISROW_BEFORE].[CITY (PERMANENT)] <> [_THISROW_AFTER].[CITY (PERMANENT)]
      )
    )
    ```
  + PIN (PRESENT) :
    ```appsheet
    OR(
      [_THISROW_BEFORE].[SAME AS PERMANENT?] <> [_THISROW_AFTER].[SAME AS PERMANENT?],
      AND(
        [_THISROW_AFTER].[SAME AS PERMANENT?] = TRUE,
        [_THISROW_BEFORE].[PIN (PERMANENT)] <> [_THISROW_AFTER].[PIN (PERMANENT)]
      )
    )
    ```
  + DISTRICT (PRESENT) :
    ```appsheet
    OR(
      [_THISROW_BEFORE].[SAME AS PERMANENT?] <> [_THISROW_AFTER].[SAME AS PERMANENT?],
      AND(
        [_THISROW_AFTER].[SAME AS PERMANENT?] = TRUE,
        [_THISROW_BEFORE].[DISTRICT (PERMANENT)] <> [_THISROW_AFTER].[DISTRICT (PERMANENT)]
      )
    )
    ```
  + STATE (PRESENT) :
    ```appsheet
    OR(
      [_THISROW_BEFORE].[SAME AS PERMANENT?] <> [_THISROW_AFTER].[SAME AS PERMANENT?],
      AND(
        [_THISROW_AFTER].[SAME AS PERMANENT?] = TRUE,
        [_THISROW_BEFORE].[STATE (PERMANENT)] <> [_THISROW_AFTER].[STATE (PERMANENT)]
      )
    )
    ```
#### 10. MOBILE NUMBER, EMERGENCY MOBILE NUMBER
* Callable : ✅
* Textable : ✅
#### 11. MARITAL STATUS
* Enum Values: `MARRIED`, `UNMARRIED`
* Allow other values: ❌
* Auto-complete other values: ✅
* Base type: `Text`
#### 12. RELIGION
* Enum Values: `HINDU`, `MUSLIM`, `CHRISTIAN`
* Allow other values: ✅
* Auto-complete other values: ✅
* Base type: `Text`
#### 13. AADHAR NUMBER
* Valid If :
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
* Invalid value error : `"AADHAR NUMBER ALREADY EXISTS"`
#### 14. PHOTO, SIGNATURE
* Image/File folder path 
  + PHOTO : `"Pictures/Images"`
  + SIGNATURE: `"Pictures/Signatures"`
#### 15. Related EMPLOYMENT DETAILSs (virtual)
* App Formula: `REF_ROWS("EMPLOYMENT DETAILS", "EMPID")`
* Element Type: `Ref`
* Referenced table name: `EMPLOYMENT DETAILS`
* Description: EMPLOYMENT DETAILS entries that reference this entry in the EMPID column
#### 16. SITES (virtual)
* App Formula:
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
* Source table : `SITES`
#### 17. STATUS | DESIGNATION (virtual)
* App Formula :
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
#### 18. Related DOCUMENTSs (virtual)
* App Formula: `REF_ROWS("DOCUMENTS", "EMPID")`
* Type: `List`
* Element Type: `Ref`
* Referenced table name: `DOCUMENTS`
* Description: DOCUMENTS entries that reference this entry in the EMPID column
#### 19. Page_1_Basic_Info, Page_2_Contact, Page_3_Government_Banking, Page_4_Employement_&_Docs (virtual)
* App Formula : `""`
* Category: Page_Header
* Content:
  + Page_1_Basic_Info : `"1. BASIC INFORMATION"`
  + Page_2_Contact : `"2. CONTACT & ADDRESS"`
  + Page_3_Government_Banking : `"3. GOVERNMENT & BANKING DETAILS"`
  + Page_4_Employement_&_Docs : `"4. EMPLOYMENT AND DOCUMENTS"`
