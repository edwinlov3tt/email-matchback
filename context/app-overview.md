### **Campaign Setup (Before Anything Starts)**

When you create a new campaign, the system sets up a dedicated workspace for that specific campaign. You enter basic information like the client name, campaign ID, which markets you're targeting, and when the email campaign will launch. The system then creates a unique email address for this campaign, something like "ClientName-CampaignID@yourcompany.matchbacktool.com". This email address becomes the central communication hub for all vendor interactions related to this campaign.

The system also sets up an automatic schedule based on the drop date. If your email campaign launches on September 8th, it automatically schedules reminders to collect client data around September 29th, send to the vendor by October 1st, and deliver final reports by October 5th. These dates can be adjusted, but having them automated means nothing falls through the cracks.

### **The Email Campaign Launches**

Your vendor sends out the marketing emails to their list on the scheduled drop date. They're targeting specific geographic areas based on what you've told them, but they don't know who the actual client is. A week later, they might do a "redrop" to people who opened but didn't take action. The vendor tracks who opens these emails and starts building their list of engaged recipients.

### **Client Data Collection (About 3 Weeks Later)**

The system automatically sends the client a notification that it's time to upload their sales data for the month. The client receives a secure upload link where they can drag and drop their Excel file containing all customer visits and sales from that month. This file typically has everything - customer IDs, names, addresses, emails, when they signed up, when they visited, how much they spent, which store locations they went to, everything.

As soon as the client uploads their file, the system immediately analyzes it. It checks how many records there are, how many are missing email addresses, whether there are any obvious data quality issues, and whether records from different markets got mixed together. If something looks wrong, like if 40% of records are missing emails when usually it's only 25%, the system alerts you immediately.

### **Preparing Data for the Vendor**

Here's where the privacy protection happens. The system makes a copy of the client's data and strips out everything that could identify the client's business. It removes sales amounts, store names, visit dates, internal customer IDs, and any other sensitive business information. What remains is just enough for the vendor to match against their email list: names, addresses, phone numbers, and email addresses.

But before sending this sanitized list, the system adds its own tracking ID to every single record. Each customer gets a unique identifier like "CAMP2024Q1-HOU-00001". This ID stays with that record throughout the entire process, so when the vendor sends back matches, we know exactly which original record each one corresponds to.

### **The Vendor Matching Process**

The sanitized file gets sent to the vendor through that dedicated campaign email address we set up earlier. The vendor receives this file and compares it against their list of people who opened or clicked the marketing emails. They're looking for matches based on email addresses primarily, but they can also match on name and address combinations.

The vendor doesn't just say "yes, this person was on our list." They actually have their own internal tracking that shows this person received and opened the email from the September 8th campaign. They can't see that this person spent $47.50 at the client's store on September 15th - they only know this person was on both lists.

Usually within 24-48 hours, the vendor sends back their results to the same campaign email address. The system automatically detects when this email arrives, extracts the attachment, and begins processing the matches.

### **Pattern Analysis - The Secret Sauce**

This is where it gets interesting. Not every match should count as a win for your email campaign. Some customers were already regular customers who would have come in anyway. The system needs to figure out who's "in pattern" (regular customers) versus "out of pattern" (customers influenced by the campaign).

The basic rule is if someone has visited three or more times in the month, they're considered "in pattern" and we don't take credit for that sale. But there's a critical flaw in this simple logic that the system automatically corrects. If someone just signed up this month AND visited three times, they're actually a new customer we should take credit for, even though the three-visit rule would incorrectly mark them as "in pattern."

The system automatically scans every matched record and checks: Did this person sign up in the same month as the campaign? If yes, and they're marked as "in pattern," the system overrides that classification. It keeps a detailed log of every override it makes and why.

### **Customer Classification**

While analyzing patterns, the system also classifies each customer into categories. It looks at when they signed up versus when they visited to determine if they're a "New Sign-up" (signed up this month), a "New Visitor" (signed up recently but just visited for the first time), or a "Winback" (hadn't visited in years but came back after the email).

This classification happens automatically based on the dates in the data. Someone who signed up 6 years ago but just visited for the first time after getting the email is a valuable winback customer. Someone who signed up and visited within 30 days is a new customer acquisition.

### **Report Generation**

The system automatically creates three main pivot tables that the client cares about. First, it shows all matched sales broken down by whether they're in or out of pattern. Second, it identifies new customers and calculates their value. Third, it accounts for records with missing email addresses, since these affect match rate accuracy.

But it doesn't stop there. The system generates a complete CAC (Customer Acquisition Cost) summary showing how much was spent on the campaign versus how much revenue it generated from out-of-pattern matches. It creates comparison reports showing this month's performance against previous months, broken down by market.

### **Quality Control and Alerts**

Throughout this entire process, the system is watching for problems. If the match rate is suspiciously low, it alerts you that something might be wrong with the vendor's matching process. If it sees addresses from Houston mixed in with Austin data, it flags that immediately. If the client uploads a file with a completely different format than usual, it adapts but notifies you about the change.

Every single data transformation is logged. You can see exactly which records were marked as matches, which pattern classifications were overridden, and why. This audit trail means you can always explain to a client why specific customers were or weren't counted as campaign-driven.

### **Final Delivery**

The system produces a clean, formatted Excel report that goes to the client showing exactly what business the email campaign drove. It clearly shows total matches, new customers acquired, revenue generated, and ROI. The client never sees the complexity happening behind the scenes - they just get clear answers about their campaign performance.

Meanwhile, your team has access to the full dashboard where you can drill down into any aspect of the process, adjust classifications if needed, and track trends across multiple campaigns and months.

### **Why This Works for Simpler Campaigns Too**

The beauty of this system is that it scales down gracefully. If you have a simpler campaign that doesn't track visits, the pattern analysis step just gets skipped. If there's only one market, the market separation doesn't run. If the client doesn't track "winback" customers, that classification doesn't appear in the reports.

The core pipeline remains the same: collect client data, sanitize it, send to vendor for matching, get matches back, calculate what you can take credit for, generate reports. Each campaign just uses the features it needs, making it workable for everything from a simple "did they buy after getting the email" campaign to complex multi-market, multi-touch attribution analysis like the Tide Cleaners example.

The system is essentially a smart assembly line that can handle different types of products (campaigns) by automatically adjusting which stations (features) are active for each one.