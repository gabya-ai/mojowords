# Setting Up Google Vertex AI for Image Generation

Currently, the standard Gemini API Key (Free Tier) does not support the advanced image generation models (`Imagen 3`) required by this application. To enable the "Paint a Picture" feature, you need to set up **Google Cloud Vertex AI**.

The application is already built to automatically detect these credentials and switch to the `HybridAIClient`, enabling image generation.

## Prerequisite: Google Cloud Platform (GCP) Account
You need a Google Cloud account. New accounts often get $300 in free credits.

## Step 1: Create a Project & Enable APIs
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a **New Project** (e.g., named "mojowords-ai").
3.  Select your new project.
4.  In the search bar, type **"Vertex AI API"** and select it.
5.  Click **Enable**.

## Step 2: Create a Service Account
1.  Go to **IAM & Admin** > **Service Accounts**.
2.  Click **+ Create Service Account**.
3.  **Name**: `ai-renderer` (or similar).
4.  **Grant Access**: Search for and add the role **"Vertex AI User"**.
5.  Click **Done**.

## Step 3: Generate JSON Key
1.  Click on the newly created Service Account email (e.g., `ai-renderer@project-id.iam.gserviceaccount.com`).
2.  Go to the **Keys** tab.
3.  Click **Add Key** > **Create new key**.
4.  Select **JSON** and create.
5.  A file will download to your computer. **Keep this safe!**

## Step 4: Configure Environment Variables
Open your `.env.local` (or `.env`) file and add the following variables using the values from the downloaded JSON file:

```bash
# The ID of your GCP project (not the name, the ID)
GCP_PROJECT_ID="your-project-id"

# The location (us-central1 is standard for Imagen)
GCP_LOCATION="us-central1"

# The 'client_email' field from your JSON key
GCP_CLIENT_EMAIL="ai-renderer@your-project-id.iam.gserviceaccount.com"

# The 'private_key' field from your JSON key
# IMPORTANT: Copy the ENTIRE string, including "-----BEGIN UNKNOWN PRIVATE KEY-----" and "\n" characters.
# Paste it inside double quotes.
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCp..."
```

## Step 5: Restart & Verify
1.  Restart your development server (`Ctrl+C` then `npm run dev`).
2.  Watch the console logs on startup. You should see:
    ```
    [AI] Using HBIRD Client: Vertex (Text + Image)
    ```
    *(Or "Using Vertex AI Only" if you removed the API key)*
3.  Try "Paint a Picture" again!
