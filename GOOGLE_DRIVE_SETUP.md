# Google Drive Upload Setup Guide

This guide will help you set up automatic Excel file uploads to Google Drive for the PPE Stock Management System.

## Overview

The system can automatically upload daily transaction reports to your Google Drive using Google Apps Script. This requires a one-time setup process.

## Prerequisites

- Google account with access to Google Drive
- Google Apps Script access (usually included with Google Workspace)
- Basic understanding of copy/paste operations

## Step-by-Step Setup

### Step 1: Create Google Apps Script Project

1. Open your web browser and go to [https://script.google.com](https://script.google.com)
2. Sign in with your Google account
3. Click **"New Project"** (+ icon in top-left)
4. You'll see a default `Code.gs` file with some sample code

### Step 2: Replace the Default Code

1. Select all the default code in the editor
2. Delete it completely
3. Copy and paste the following code:

```javascript
/**
 * PPE Stock Management - Google Drive Upload Handler
 * This script receives Excel files from the PPE management system
 * and saves them to a specified Google Drive folder
 */

function doPost(e) {
  try {
    // Log the incoming request for debugging
    console.log('Received upload request:', e.parameter);
    
    // Get the uploaded file data
    const fileBlob = e.parameter.file;
    const fileName = e.parameter.fileName || `PPE_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Validate that we received a file
    if (!fileBlob) {
      throw new Error('No file data received');
    }
    
    // IMPORTANT: Replace 'YOUR_FOLDER_ID_HERE' with your actual Google Drive folder ID
    const DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID_HERE';
    
    // Get the target folder
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // Create the file in the folder
    const file = folder.createFile(fileBlob);
    file.setName(fileName);
    
    // Set file description
    file.setDescription(`PPE Transaction Report uploaded on ${new Date().toLocaleString()}`);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        fileId: file.getId(),
        fileName: fileName,
        uploadTime: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error for debugging
    console.error('Upload error:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the script works
 * You can run this from the Apps Script editor to test
 */
function testFunction() {
  console.log('PPE Upload Handler is ready!');
  return 'Script is working correctly';
}
```

### Step 3: Configure Your Google Drive Folder

1. Open [Google Drive](https://drive.google.com)
2. Create a new folder for PPE reports (or use an existing one)
   - Right-click in Drive → "New" → "Folder"
   - Name it something like "PPE Transaction Reports"
3. Open the folder by double-clicking it
4. Look at the URL in your browser's address bar
5. Copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the long string after `/folders/`
   - Example: If URL is `https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`
   - Then folder ID is: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### Step 4: Update the Script with Your Folder ID

1. Go back to your Apps Script project
2. Find the line: `const DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID_HERE';`
3. Replace `YOUR_FOLDER_ID_HERE` with your actual folder ID
4. Example: `const DRIVE_FOLDER_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';`

### Step 5: Save and Name Your Project

1. Click the "Save" button (💾 icon) or press Ctrl+S
2. Click on "Untitled project" at the top
3. Rename it to something like "PPE Upload Handler"
4. Click "Save"

### Step 6: Deploy as Web App

1. Click the **"Deploy"** button in the top-right corner
2. Select **"New deployment"**
3. Click the gear icon (⚙️) next to "Type"
4. Select **"Web app"**
5. Configure the deployment:
   - **Description**: "PPE File Upload Handler"
   - **Execute as**: "Me (your-email@domain.com)"
   - **Who has access**: Choose one:
     - "Anyone" (if you want it publicly accessible)
     - "Anyone with Google account" (recommended)
     - "Anyone within your organization" (if using Google Workspace)
6. Click **"Deploy"**

### Step 7: Authorize the Script

1. You'll see an "Authorize access" dialog
2. Click **"Authorize access"**
3. Choose your Google account
4. You may see a warning "Google hasn't verified this app"
5. Click **"Advanced"** → **"Go to PPE Upload Handler (unsafe)"**
6. Click **"Allow"** to grant permissions

### Step 8: Copy the Web App URL

1. After successful deployment, you'll see a "Web app URL"
2. **Copy this entire URL** - it should look like:
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```
3. Keep this URL safe - you'll need it for the next step

### Step 9: Configure the PPE Management System

1. Open your PPE Management System code
2. Find the file `src/App.js`
3. Look for the line: `const GAS_ENDPOINT = "";`
4. Paste your Web App URL between the quotes:
   ```javascript
   const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbz.../exec";
   ```
5. Save the file

### Step 10: Test the Upload

1. Run your PPE Management System
2. Create a test transaction (issue some PPE to an employee)
3. Click the **"☁️ Upload to Drive"** button
4. Check your Google Drive folder - you should see the uploaded Excel file

## Troubleshooting

### Common Issues and Solutions

**Issue**: "Script function not found"
- **Solution**: Make sure you copied the entire script code correctly

**Issue**: "Folder not found" error
- **Solution**: Double-check your folder ID is correct and the folder exists

**Issue**: "Permission denied"
- **Solution**: Make sure the script is deployed with "Execute as: Me" and you've authorized it

**Issue**: "Upload failed" message
- **Solution**: Check the browser console for detailed error messages

### Testing Your Setup

You can test your Apps Script directly:

1. In Apps Script editor, click "Run" → select "testFunction"
2. Check the execution log for any errors
3. If successful, you should see "Script is working correctly"

### Security Considerations

- The Web App URL contains a secret token - don't share it publicly
- Consider restricting access to "Anyone within your organization" if using Google Workspace
- Regularly review the files being uploaded to ensure they contain expected data

### Updating the Script

If you need to modify the script:

1. Make changes in the Apps Script editor
2. Save the changes
3. Click "Deploy" → "Manage deployments"
4. Click the edit icon (✏️) next to your deployment
5. Click "Deploy" to update

The Web App URL will remain the same, so you don't need to update your PPE system.

## Support

If you encounter issues:

1. Check the Apps Script execution log for detailed error messages
2. Verify your folder ID is correct
3. Ensure the PPE system has the correct Web App URL
4. Contact your IT administrator for additional support

## Advanced Configuration

### Custom File Naming

You can modify the script to use custom file naming patterns:

```javascript
// Custom file naming with timestamp
const fileName = `PPE_Report_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;

// Include company name
const fileName = `CompanyName_PPE_${new Date().toISOString().split('T')[0]}.xlsx`;
```

### Multiple Folders

To save files to different folders based on date or other criteria:

```javascript
// Create monthly folders
const monthYear = new Date().toISOString().substring(0, 7); // YYYY-MM
const monthlyFolderId = getOrCreateMonthlyFolder(monthYear);
const folder = DriveApp.getFolderById(monthlyFolderId);
```

### Email Notifications

Add email notifications when files are uploaded:

```javascript
// After successful file creation
GmailApp.sendEmail(
  'admin@yourcompany.com',
  'PPE Report Uploaded',
  `New PPE transaction report uploaded: ${fileName}`
);
```

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Compatible with**: Google Apps Script, Google Drive API v3