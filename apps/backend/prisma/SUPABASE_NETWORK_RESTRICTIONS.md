# 2.I.05 Review Supabase "Network Restrictions" (Allow only Backend IP)

Since this is a configuration task on the Supabase Dashboard, it cannot be implemented directly in the code. Please follow these steps to secure your production database:

## Instructions

1.  **Get Backend IP Address:**
    *   Identify the static Public IP address of your production backend server.
    *   *Note: If you are using serverless platforms (like Vercel/AWS Lambda) without a NAT Gateway, IP restrictions might be difficult as IPs change.*

2.  **Login to Supabase:**
    *   Go to [Supabase Dashboard](https://supabase.com/dashboard).
    *   Select your project (`ed_platform`).

3.  **Configure Network Restrictions:**
    *   Navigate to **Settings** > **Database**.
    *   Look for the **Network Restrictions** section.
    *   Toggle on "Enable Network Restrictions".
    *   Add your **Backend IP Address** (e.g., `203.0.113.1/32`).
    *   **Crucial:** Add your own **Personal IP Address** as well, so you can continue to access the database via pgAdmin or CLI tools.

4.  **Verification:**
    *   Try connecting from an unauthorized IP (e.g., a mobile network) - it should fail.
    *   The Backend should continue to work normally.