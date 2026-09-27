# MediFlow Final v30

Frontend/demo e-channeling system for Sri Lankan healthcare workflows.

## Finalized NEW record behavior
- New appointments and payment records receive a `NEW` badge.
- `NEW` is shown for up to 24 hours from the record's real `createdAt` timestamp.
- Performing a successful action on the record clears `NEW` immediately.
- Actioned state is persisted per logged-in user in localStorage.
- Refreshing the page does not restore `NEW` after it was actioned.
- A 30-second UI ticker removes expired 24-hour `NEW` badges while the app is open.
- The record itself is never deleted by the NEW logic.
- Records without a real creation timestamp are not falsely marked NEW.

## Billing / balance
- Admin Billing shows paid, unpaid, pending-verification and refunded records.
- Received amount is calculated from confirmed payment transactions.
- Balance is `max(0, invoice total - confirmed received)`.
- Pending/rejected/refunded transactions are not counted as received.
- Filtered Received and Balance totals update with billing filters.
- Clear All removes records from the current user's view only; it does not delete database records.

## Role-specific Clear All
Admin, Doctor and Patient have view-only clear controls for applicable appointment, payment and notification lists.

## Project structure
```text
index.html
css/style.css
js/db.js
js/app.js
js/forms/patient-registration.js
forms/patient-registration.html
schema.sql
```

## Validation
- Sri Lankan phone formats supported and normalized to `07XXXXXXXX`.
- NIC optional; valid NIC derives DOB and gender.
- Emergency phone optional.
- Card demo validation includes Luhn number check, expiry, CVV and cardholder validation.

## Security note
This is a frontend/localStorage demo. Passwords and records are stored in browser storage. Real deployment requires a secure backend, authenticated APIs, database access controls, OTP/email verification and a PCI-compliant payment gateway. Never use real card numbers in this demo.

## Verification performed for this build
- JavaScript syntax checks for all JS files.
- Local HTML/CSS/JS reference-path checks.
- NEW 24-hour expiry test.
- NEW actioned-state persistence test.
- Billing balance tests for unpaid and partial-payment cases.
- Billing UI balance rendering test.
- Action-handler coverage check.
- ZIP integrity check.

A full interactive browser test depends on a working browser runtime; the build was not represented as fully browser-click-tested when that runtime was unavailable.
