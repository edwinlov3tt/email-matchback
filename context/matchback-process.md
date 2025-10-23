Matchback Process Overview

 

Step 1: Receive 30-Day Active List

·         Obtain the 30-day active customer list from the client for the prior month (e.g., for September reporting).

 

Step 2: Prepare LeadMe File

·         Save a separate copy of the 30-day active list specifically for LeadMe.

·         Keep only the following fields: CustomerID, Name, Address, Phone Number, and Email.

·         Remove all other data to comply with LeadMe’s data-sharing restrictions.

 

Step 3: Merge Match Data

·         Merge the ‘matchflag’ column from the LeadMe file into the client’s 30-day active list.

 

Step 4: Send for Pattern Analysis

·         Send the updated 30-day active list (with the ‘matchflag’ column included) to Taylor at P&G for pattern analysis.

·         Taylor will return the file with color-coded results:

o    🟩 Green (1) – In Pattern: Repeat customers (no credit taken).

o    🟧 Orange (0) – Out of Pattern: Customers without an established pattern (credit taken).

·         Note: Only Out of Pattern (Orange) matches are credited.

 

Step 5: Merge Pattern Results

·         Merge Taylor’s ‘Pattern’ column into your 30-day active list.

·         I relabel the matchflag and pattern? Headers as (MATCH, PATTERN) and I highlight the headers. Makes it easier to identify.

 

Step 6: Build Pivot Tables

·         Create the following pivot tables to organize results:

o    Pivot Table 1: All Matched Sales

o    Pivot Table 2: New Customers

o    Pivot Table 3: Missing Email Addresses

 

Step 7: Finalize Reporting

·         Add matched details to the Excel tracking document.

·         Update the CAC Summary with matched results.

·         Note: These are the 2 items the client looks at and what they receive for reporting.

 

Pivot Table Creation Steps

Highlight the Raw Data
Select the entire sheet containing your raw data.
This is the range you’ll use to create your pivot tables.
Insert a Pivot Table
Go to the top ribbon and select Insert → PivotTable.
Create the First Pivot Table
When prompted, choose “New Workbook.”
Excel will generate a new tab containing your first Pivot Table workspace.
Create Additional Pivot Tables (2 & 3)
For the next two pivot tables, select “Existing Worksheet.”
Navigate to the tab where your first Pivot Table is located.
Select a few open cells where you want each additional Pivot Table to appear.
This tells Excel to place Pivot Table 2 and Pivot Table 3 in those designated cells.
 

Filters for each Pivot Table

 

All Matched Sales

·         Rows – Match and Pattern Columns from the raw data

·         Columns – Total Sames and Match Columns from the raw data

 



 

New Customers

·         Rows – Match and SignupDate from the raw data

·         Columns – Total Sales and SignupDate from the raw data

 



 

Missing Email Address

·         I have yet to get the pivot table to work on this every single time.

·         The first column shows the total number of records from the raw data tab.

·         The second column shows the number of missing emails from the raw data tab (any cell showing a blank)

·         The third column shows the percentage of missing emails.

 

 

Notes to Keep in Mind

 

In-Pattern Definition

In-Pattern Definition: A consumer is considered in-pattern when they have visited three times, regardless of whether they recently signed up.
Issue Identified: This method can be flawed — for example, if a consumer signs up in September but also visits three times that same month, the system incorrectly categorizes them as in-pattern.
Correction Approach:
These consumers should actually be considered out-of-pattern, since they are new sign-ups we can take credit for.
To address this, I manually review the document line by line to identify any consumers who fall into this scenario.
If they are incorrectly marked as in-pattern, I adjust the calculations to reflect them as out-of-pattern for accurate reporting.
 

Unique Identifier

CustomerID is used as the unique identifier between the 30-day active list and Taylor’s Pattern list.
 