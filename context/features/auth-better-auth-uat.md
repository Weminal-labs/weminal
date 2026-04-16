# UAT: Auth — Better Auth Integration

> **Feature:** auth-better-auth
> **Status:** pending
> **Tested by:** —
> **Date tested:** —

Your app is running at **http://localhost:3000**. Open it in your browser, then work through these steps in order.

---

**Step 1 — Confirm the app loads while not logged in**

Go to: http://localhost:3000/hack

You should see: The main page loads with a list of opportunities. No login prompt blocks the page — you can browse freely. Any "Add" or "Edit" buttons should either be hidden or show a "Sign in" prompt instead of a working form.

If something looks wrong: Tell me "Step 1 didn't work" and describe what you see — for example, a blank page, a loading spinner that never stops, or an error message on screen.

---

**Step 2 — Confirm the nav shows "Sign in" when you are not logged in**

Stay on: http://localhost:3000/hack

Look at the navigation menu at the top of the page.

You should see: A "Sign in" link or button visible in the nav bar. You should NOT see a user avatar or a "Profile" link.

If something looks wrong: Tell me "Step 2 didn't work" — describe what the nav shows.

---

**Step 3 — Confirm /profile redirects you to /login when not logged in**

Go to: http://localhost:3000/profile

You should see: The browser automatically redirects you away from /profile and lands you on http://localhost:3000/login?next=/profile. The URL in your browser's address bar should contain `next=/profile`. The login page should show a "Sign in to Weminal" card with a "Continue with GitHub" button.

If something looks wrong: Tell me "Step 3 didn't work" — note whether the URL changed and what you see on screen.

---

**Step 4 — Log in with GitHub**

On the login page at http://localhost:3000/login:

Do this:
1. Click the "Continue with GitHub" button.
2. GitHub will open — if you are not already signed into GitHub, sign in with your GitHub username and password.
3. If GitHub asks you to authorise "Weminal" — click the green "Authorize" button.
4. Wait for the page to redirect back to the app.

You should see: You land back on the app at http://localhost:3000/hack (or wherever you were before). The page loads normally. The login page is no longer shown.

If something looks wrong: Tell me "Step 4 didn't work" — note what GitHub said (for example, if it showed an error, or if the page redirected to somewhere unexpected).

---

**Step 5 — Confirm the nav updates after login**

After logging in, look at the navigation menu.

You should see: Your GitHub profile picture (or avatar) and a "Profile" link in the nav bar. The "Sign in" link should be gone.

If something looks wrong: Tell me "Step 5 didn't work" — describe what the nav still shows.

---

**Step 6 — Check the Account section on your profile page**

Go to: http://localhost:3000/profile

You should see: A section labelled "Account" (or similar) that shows your GitHub avatar, your display name, and your email address — all pulled from your GitHub account. There should also be a "Sign out" button.

If something looks wrong: Tell me "Step 6 didn't work" — describe what is missing or what shows blank.

---

**Step 7 — Test sign out**

On the profile page, click the "Sign out" button.

You should see: You are redirected away from the profile page — most likely to http://localhost:3000. The nav bar should now show "Sign in" again instead of your avatar. If you go to http://localhost:3000/profile again it should redirect you back to /login.

After confirming this works, log back in again (repeat Step 4) before continuing.

---

**Step 8 — Test wallet linking with an invalid Solana address**

Go to: http://localhost:3000/profile

Find the "Wallet Linking" section (or "Wallet" section).

Do this:
1. Click into the Solana Address field.
2. Type something invalid — for example: `notavalidaddress`
3. Click Save (or press Tab to move focus away from the field).

You should see: An error message near the Solana field — something like "Invalid Solana address" or "Address format is incorrect". The address should NOT be saved.

If something looks wrong: Tell me "Step 8 didn't work" — note whether no error appeared, or whether it saved the invalid address anyway.

---

**Step 9 — Test wallet linking with a valid Solana address**

Still in the Wallet section on http://localhost:3000/profile:

Do this:
1. Clear the Solana Address field.
2. Type this valid test address: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`
3. Click Save.

You should see: A success notification (a small pop-up or "toast" message) confirming the address was saved — something like "Wallet updated" or "Saved". The address should remain visible in the field after saving.

If something looks wrong: Tell me "Step 9 didn't work" — note whether you got an error, no feedback at all, or the field cleared itself.

---

**Step 10 — Generate a new API key**

Still on http://localhost:3000/profile, find the "API Keys" section.

Do this:
1. Click "Generate new key" (or similar button).
2. A dialog should appear asking for a label. Type a name — for example: `My test key`
3. Click "Generate" (or "Create").

You should see: The raw API key displayed once in a highlighted box or code block. It should start with `wem_` followed by a string of letters and numbers. There should be a warning message like "This key won't be shown again" and a copy button. Copy the full key — you will need it in Step 12.

If something looks wrong: Tell me "Step 10 didn't work" — note whether the dialog didn't open, the key didn't appear, or the key doesn't start with `wem_`.

---

**Step 11 — Confirm the key appears in your keys list**

Close the key generation dialog (click Done, Close, or press Escape).

You should see: The API keys table now shows a row for "My test key" (the label you entered). The table should show the label, a short prefix of the key (the first few characters), a created date, and a "Revoke" button. The full raw key should NOT be visible — only the short prefix.

If something looks wrong: Tell me "Step 11 didn't work" — note whether the table is empty or the row is missing fields.

---

**Step 12 — Test revoking an API key**

In the API keys table, find the "My test key" row and click its "Revoke" button.

Do this:
1. Click "Revoke".
2. A confirmation dialog should appear asking you to confirm. Click "Revoke" (or "Confirm").

You should see: The key disappears from the table. A success notification may appear confirming revocation.

If something looks wrong: Tell me "Step 12 didn't work" — note whether the dialog didn't appear, the key stayed in the table, or you got an error.

---

**Step 13 — Check Builder Activity section**

Still on http://localhost:3000/profile, scroll to the "Builder Activity" section.

You should see: Three subsections — "Opportunities created", "Ideas submitted", and "Hackathons entered". Each should show a count. If you have not created anything yet, each count will be 0 and you should see empty-state messages like "No opportunities yet" with a link to add one. The section should not be blank or show a loading spinner that never finishes.

If something looks wrong: Tell me "Step 13 didn't work" — note whether the section is completely missing, shows an error, or is stuck loading.

---

**Step 14 — Test that write actions are protected when you generate a fresh key and use it wrong**

Go back to: http://localhost:3000/profile

Generate another new API key (repeat Step 10). Copy the full `wem_...` key.

Now open a new browser tab and go to: http://localhost:3000/api/v1/opportunities

You should see: A list of opportunities in JSON format (this is a public read endpoint — no key needed). This confirms the public endpoints are still open.

Next, in the same tab, change the URL to: http://localhost:3000/api/v1/me/activity

You should see: A JSON response with your activity data — opportunities, ideas, and hackathons counts. If you see a 401 error or "Authentication required" message instead, something is wrong — tell me "Step 14 didn't work" along with exactly what appeared on screen.

---

**Step 15 — Confirm anonymous users cannot reach the activity endpoint after you sign out**

Do this:
1. Go to http://localhost:3000/profile and click "Sign out".
2. After signing out, go directly to: http://localhost:3000/api/v1/me/activity

You should see: An error response — the page or JSON should say something like "Authentication required" or show a 401 status. You should NOT see your personal activity data.

If something looks wrong: Tell me "Step 15 didn't work" — describe what appeared (for example, if your data still showed up after signing out).

---

## When you're done testing

Tell me one of these:

- **"Everything looks good"** — and I'll mark the UAT as passed and move on to the next task
- **"Step [N] didn't work"** — describe what you saw and I'll fix it
- **"I saw an error"** — copy and paste any red text or error messages you see on screen

---

> UAT written: 2026-04-16
> Covers: OAuth login, route protection, nav auth states, wallet linking (valid + invalid), API key generate/revoke, Builder Activity rendering, public vs protected endpoint access
