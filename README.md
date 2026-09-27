# Store Discovery Community

A static-first community homepage with Vercel serverless APIs for protected admin access and shared content. The public site stays static; admin pages and admin APIs require a signed session cookie.

## Deploy from GitHub to Vercel

1. Push this repository to GitHub and import it into Vercel. Use the repository root as the project root and the `Other` framework preset. No build command is required; Vercel serves the static files, runs the routing proxy, and deploys the functions in `api/`.
2. Create an Upstash Redis database through the Vercel Marketplace and connect it to this project. Copy its REST URL and token into the project environment variables.
3. Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` in Vercel Project Settings for the Production environment. Add the appropriate variables separately for Preview and Development if those deployments are needed.
4. Use a unique admin username, a long random password, and a random session secret of at least 32 characters. Generate a secret locally with PowerShell:

   ```powershell
   $bytes = New-Object byte[] 48
   $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
   $rng.GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   ```

5. Redeploy after setting the variables. Open `/admin/login`; Vercel's pre-cache routing proxy checks the signed session before it serves `/admin`, `/admin.html`, `/admin.js`, or any admin API. Unauthenticated page requests go to sign-in, and API requests receive `401`.

Never commit real values from `.env` or Vercel settings. `.env.example` contains placeholders only. Keep production credentials out of Preview deployments unless preview access is intentionally restricted.

## Data and privacy

Homepage content, store submissions, and shopper signups are stored in the connected Redis database and shared across deployments. Member and store submission records are not written to browser storage or committed to Git. Admin login uses an eight-hour HttpOnly, Secure-in-production, SameSite=Strict cookie; sign-in attempts are rate-limited in Redis.

Before collecting real member information, publish actual Privacy Policy and Terms pages, decide on a retention/deletion schedule, and confirm the Redis region and access policy meet your requirements. The footer policy links are placeholders because no legal text or social profiles were supplied.

## Local preview

The static homepage can be opened directly or served from localhost. Without Vercel Functions and Upstash configured, homepage content falls back to browser-local preview data; form submissions will not be shared. Production login and admin persistence require deployment with the environment variables above. Do not use local preview behavior as a substitute for production authentication.
