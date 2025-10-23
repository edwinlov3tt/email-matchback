## FEATURE:

Multi-tenant matchback automation platform that processes email campaign data to determine actual business impact. The system needs to:
- Create campaign-specific email endpoints for vendor communication
- Process Excel files from clients containing sales/visit data
- Sanitize data to protect client identity from vendors
- Track records through the entire pipeline with internal IDs
- Perform "In Pattern" analysis to identify campaign-driven vs regular customers
- Auto-correct pattern flaws (new signups with 3+ visits)
- Classify customers as New Signup/New Visitor/Winback
- Generate pivot tables and Excel reports
- Handle multiple geographic markets with automatic separation
- Calculate ROAS and Cost per Customer metrics

## EXAMPLES:

Place in examples/ folder:
- Sample Excel files showing client data structure (with Visit columns)
- Vendor match response format
- Pattern analysis logic implementation
- Pivot table generation code
- Email endpoint handling pattern

## DOCUMENTATION:

- ExcelJS documentation: https://github.com/exceljs/exceljs
- Bull Queue documentation: https://docs.bullmq.io/
- SendGrid API: https://docs.sendgrid.com/
- NestJS documentation: https://docs.nestjs.com/
- Sample matchback Excel files (attached in conversation)

## OTHER CONSIDERATIONS:

Critical Business Rules:
- Vendor must NEVER know client identity
- Client must NEVER know about vendor involvement
- Pattern correction: New signups with 3+ visits in same month should be OUT of pattern
- Excel date serial numbers need conversion (Excel epoch: 1900-01-01)
- 24-48 hour vendor turnaround time expected
- Support for campaigns WITHOUT visit tracking (simpler variant)
- Missing email addresses (~25%) need special handling
- Market mixing detection is critical for data quality