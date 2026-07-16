How to Prevent Your Vibe-Coded App from Getting Hacked

5 fixes before you ship — plus 3 bonus hardening steps — with copy-paste prompts for your AI agent

Most AI-built apps get shipped with the login screen untouched from whatever the agent scaffolded on day one. That's the exact screen hackers probe first — it's the one door every user has to walk through, which makes it the highest-value target in the whole app.

Here's what to fix before launch, and what to hand your agent so it actually gets fixed.

01  Don't Trust the Frontend — Validate Everything Again on the Server

If your only checks live in the browser, they don't exist. Anyone can bypass client-side JS and send whatever they want straight to your API, so every field needs a second check on the backend: email format, password rules, username length, and any open text box that could carry a script tag.

Miss this and you're exposed to SQL injection (your database, exported in one request) and XSS (session tokens lifted off every user currently logged in). This is why injection attacks have sat in OWASP's top-3 list for years — it's the easiest hole to leave open.

Pick a validation library for your stack (Zod, Joi, Pydantic) and whitelist acceptable formats instead of trying to blacklist every bad input — you'll never catch them all that way.

🤖  PROMPT FOR YOUR AGENT

Audit this app's login and signup flow for a specific gap: are we trusting any input

that only got checked in the browser?

 

Go field by field — email, password, username, name — and make sure each one is

re-checked server-side no matter what the frontend already did.

 

Also handle: stripping script/HTML tags from free-text fields, rejecting malformed

input instead of trying to "clean" it silently, and keeping error responses generic

so a rejected field doesn't leak which one failed.

 

Pick whichever schema library fits this stack (Zod/Joi/Pydantic) and log rejected

submissions so I can see attack attempts later.

 

Walk me through what you changed, file by file.

02  Slow Down Brute-Force Attempts with Rate Limits and Lockouts

A script can throw thousands of password guesses at your login per second — that's brute force, and it's cheap for an attacker to run. Rate limiting caps how many attempts an IP gets per minute; account lockouts shut the door entirely after a handful of wrong tries.

The real-world stakes here are high: Verizon's 2025 breach report still names stolen credentials as the single most common way attackers get into systems. Without limits, your login is just a lock waiting to be picked.

A solid starting point: lock an account after 5 failed attempts for 15 minutes, block an IP temporarily past 20 requests/minute, and add increasing delay between each wrong guess so bots slow down even before the lockout kicks in.

🤖  PROMPT FOR YOUR AGENT

I want the login endpoint hardened against brute force. Two layers:

 

Layer 1 — per-IP throttling on /login, tuned so a real user never notices but a

script trying hundreds of combinations gets stopped fast.

 

Layer 2 — per-account protection: after repeated failures on the same account, slow

down each subsequent attempt (increasing delay) and lock the account temporarily

once a threshold is hit.

 

Use whatever fast key-value store is already available in this stack for tracking

attempts. Notify the user by email when their account gets locked. Important: the

failure response to the user should look identical whether they got rate-limited,

locked out, or just typed the wrong password.

 

Explain the thresholds you picked and why.

03  Hash Passwords — Plaintext Storage Means One Leak, Total Compromise

Assume your database will eventually leak. Companies far bigger than yours have had it happen. The only thing that protects your users at that point is whether their password was hashed before it ever touched the database.

Use bcrypt, Argon2, or scrypt — never MD5 or SHA-1, both of which are fast enough to crack at scale. Add a salt so two identical passwords don't produce the same hash, and set the cost factor high enough that hashing takes roughly a third of a second — annoying for your server, brutal for an attacker trying billions of combinations.

Over 19 billion plaintext passwords turned up in breaches in 2024 alone — and because people reuse passwords across sites, one leaked plaintext database can compromise a user's banking or email login too, not just yours.

🤖  PROMPT FOR YOUR AGENT

Check how passwords are currently stored in this app and fix it if they're not

properly hashed.

 

- Switch any plaintext, MD5, or SHA-1 password storage to bcrypt or Argon2id

- Use at least a cost factor of 12 for bcrypt

- Hash on both signup and password change

- Use constant-time comparison when checking passwords — not a regular string match

- Write a migration that rehashes existing passwords the next time each user logs in

- Search the whole codebase for any place a password might get logged in plaintext

  and remove it

 

Show me the updated auth logic and the migration script.

04  Rewrite Your Error Messages So They Don't Confirm Who's Registered

"That email isn't registered" sounds like a helpful error. It's actually confirmation for an attacker that every other email they try might belong to a real account. This is called email enumeration, and it's step one for building a target list for phishing or credential-stuffing campaigns.

The fix is boring on purpose: whether it's a wrong password, a wrong email, or a locked account, the user sees the same line — "Incorrect email or password." Password reset flows need the same treatment: "If that email is registered, you'll receive a link" rather than confirming existence either way.

🤖  PROMPT FOR YOUR AGENT

Review every auth-related error message in this codebase for information leaks.

 

- Any login failure (bad email or bad password) should return exactly:

  "Incorrect email or password"

- Locked accounts should show that same message — don't mention a lockout

- Password reset should say: "If that email is registered, you'll receive a reset

  link"

- Signup should never confirm whether an email is already taken

- Search the codebase for phrases like "not found," "doesn't exist," "invalid

  email," "already registered" and swap them for safe versions

 

Give me a list of what you changed and where.

05  Stop Rolling Your Own Auth — Use One That's Already Survived Years of Attacks

Auth looks simple until you're the one patching session hijacking bugs at 2am. Providers like Clerk, Supabase Auth, Firebase Auth, and Auth0 have already done that work — rotating tokens, OAuth logins, MFA, compliance certifications — across millions of production apps.

Clerk — best pick for React/Next.js apps, generous free tier, fastest to integrate
Supabase Auth — makes sense if you're already using Supabase for your DB
Firebase Auth — solid default for mobile-first apps
Auth0 — reach for this only if a B2B client specifically needs enterprise SSO
🤖  PROMPT FOR YOUR AGENT

Replace the custom auth in this app with [Clerk/Supabase Auth/Firebase Auth].

 

- Remove any homegrown password hashing, session, or JWT logic

- Wire up the provider's SDK for sign-in, sign-up, and sign-out

- Enable social login (Google/GitHub) through the provider

- Guard all private routes using the provider's middleware

- Set up user-creation/deletion webhooks if the provider supports them

- Only store non-sensitive data in our own DB — user ID, plan, preferences —

  nothing that resembles a credential

 

Give me the setup checklist: packages to install, env vars needed, and what the

middleware looks like after the swap.


BONUS: NEXT-LEVEL HARDENING

The five above stop the most common attacks on your login screen. These three catch the stuff that usually gets missed because it's not login-specific — it's scattered across the rest of your codebase.

06  Hunt Down Secrets Sitting in Your Code

Vibe-coding agents love to paste API keys directly into a config file or a frontend component because it "just works" in dev. The problem is that key then either ships to every browser that loads your app, or gets committed to a public GitHub repo the moment you push. Either way, it's no longer a secret.

🤖  PROMPT FOR YOUR AGENT

Scan this entire codebase for hardcoded secrets — API keys, tokens, passwords,

database URLs, anything that shouldn't be in plain source code.

 

For anything you find:

- Move it into environment variables instead

- Confirm it's not being bundled into any frontend/client-side code (check the

  build output, not just the source)

- Check if it's already been committed to git history, not just the current files

 

List every secret you found, where it was, and what you moved it to.

07  Check Your Dependencies for Known Vulnerabilities

Every package your agent installs is code you didn't write and probably didn't read. Some of them have publicly disclosed vulnerabilities — sitting in a public database, waiting for anyone to check if your app is still running the broken version.

🤖  PROMPT FOR YOUR AGENT

Run a dependency audit across this whole project.

 

- List every package with a known vulnerability and its severity

  (critical/high/medium/low)

- For each one, tell me if there's a safe update available, or if fixing it means

  a breaking change I need to review

- Update the ones that are safe to update automatically

- Flag anything critical that can't be auto-fixed so I can decide manually

 

Give me the before/after list.

08  Lock Down File Uploads So They Can't Become Code Execution

If your app lets users upload anything — a profile picture, a document, an attachment — that's a door into your server if it's not handled carefully. Checking the file extension isn't a real check; an attacker can rename a malicious script to photo.jpg and get past that instantly.

🤖  PROMPT FOR YOUR AGENT

Review every file upload feature in this app.

 

- Confirm we're validating actual file type and content, not just trusting the

  file extension or the name

- Confirm there's a reasonable file size cap

- Confirm uploaded files are stored somewhere they can never be executed as code —

  outside the web root, or in isolated storage like S3

- Confirm there's no path where an uploaded file could end up served with the

  wrong content-type and run in a browser

 

Show me what's currently in place and what you changed.


Run through this as a yes/no checklist on your own app, tonight, not next sprint:

Can I submit garbage to a form field and have the server accept it anyway? → if yes, fix #1
Can I mash the login button 50 times in a row without anything stopping me? → if yes, fix #2
If someone dumped my database right now, would passwords be readable as-is? → if yes, fix #3
Does a wrong email give me a different error than a wrong password? → if yes, fix #4
Am I the one maintaining session tokens, password resets, and OAuth by hand? → if yes, fix #5
Is there an API key sitting anywhere in my code I could paste into Slack right now? → if yes, fix #6
Do I actually know if any of my installed packages have a public CVE against them? → if yes, fix #7
Could someone rename a virus to .jpg and upload it to my app? → if yes, fix #8