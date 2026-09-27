# Suggested REST API contract
POST /api/auth/login
POST /api/auth/register/patient
POST /api/auth/forgot-password/request
POST /api/auth/forgot-password/verify
GET /api/doctors?specialty=&&search=
POST /api/admin/doctors
PATCH /api/admin/doctors/:id
DELETE /api/admin/doctors/:id
POST /api/admin/doctors/:id/leave
GET /api/patients/:id
GET /api/appointments
POST /api/appointments
PATCH /api/appointments/:id
POST /api/appointments/:id/reschedule
POST /api/appointments/:id/cancel
POST /api/payments/create
POST /api/payments/webhook
GET /api/payments
GET /api/notifications
PATCH /api/notifications/read-all
POST /api/reviews
GET /api/reports/summary
GET /api/audit

Recommended production auth: HttpOnly secure session cookies or short-lived access tokens + refresh tokens, server-side role authorization, password hashing (Argon2id/bcrypt), rate limiting, OTP verification, audit logging and HTTPS.

POST /api/doctors/{doctorId}/schedules — date-specific working hours and slots
POST /api/appointments/{appointmentId}/payments — Card or Bank Transfer from patient; Admin cashier payments are Cash only
POST /api/payments/{paymentId}/verify — Admin verifies uploaded bank receipt
