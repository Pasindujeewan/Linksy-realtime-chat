# Sprint 1 Bug Reports

Sprint 1 execution status was reported as all passed. One image-selection defect was reported and is now fixed according to the user. Retest evidence was not provided.

| Bug ID | Summary | Severity | Priority | Status | Related case |
|---|---|---|---|---|---|
| BUG-2026-001 | Registration required a manually entered image URL instead of selecting and uploading an image | Medium | P1 | Fixed (user-reported) | AUTH-001 |

## BUG-2026-001 — Replace manual image URL input with image selection

- **Severity:** Medium
- **Priority:** P1
- **Status:** Fixed (user-reported; retest evidence not provided)
- **Area:** Authentication / profile image upload
- **Environment and build:** Not provided
- **Related test case:** AUTH-001
- **Preconditions:** Open the registration form.
- **Steps to reproduce:**
  1. Start registration.
  2. Try to provide a profile image.
- **Expected result:** The user can select an image from their device; it is uploaded to cloud storage, the returned image URL/token is stored automatically, and an appropriate error is shown if upload fails.
- **Actual result:** The form required the user to enter an image URL manually instead of selecting and uploading an image.
- **Reproducibility:** Not provided
- **Evidence:** Not provided
- **Impact/workaround:** Users had to supply an image URL manually.
- **Resolution:** Reported fixed. Fix/build details and retest evidence were not provided.

## Bug template

- **Bug ID:** `BUG-YYYY-NNN`
- **Severity:** Critical / High / Medium / Low
- **Priority:** P0 / P1 / P2
- **Status:** New / Triaged / In Progress / Fixed / Verified / Won't Fix
- **Area:** Authentication / User Management
- **Environment and build:**
- **Related test case:**
- **Preconditions:**
- **Steps to reproduce:**
- **Expected result:**
- **Actual result:**
- **Reproducibility:**
- **Evidence:** Sanitized screenshots, logs, or response data
- **Impact/workaround:**
- **Owner and resolution:**
