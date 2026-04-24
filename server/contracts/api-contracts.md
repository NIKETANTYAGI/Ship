# SwiftRoute API Contracts
# Version: 1.0
# Last Updated: March 22, 2025
# Base URL: http://localhost:3001 (development)
# Base URL: https://api.swiftroute.in (production)

---

## IMPORTANT RULES FOR ALL DEVELOPERS

1. Every request that needs login must send this header:
   Authorization: Bearer <your_jwt_token>

2. Every response follows this format:
   Success: { "success": true, "data": { ... } }
   Error:   { "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable message" } }

3. All amounts are in PAISE not rupees
   Example: Rs 114.46 = 11446 paise

4. All dates are in ISO 8601 format
   Example: "2025-03-22T14:30:00.000Z"

5. All IDs are UUIDs
   Example: "550e8400-e29b-41d4-a716-446655440000"

---

## ERROR CODES — ALL POSSIBLE ERROR CODES

AUTH_001 = Phone number is invalid or missing
AUTH_002 = OTP has expired (5 minutes passed)
AUTH_003 = OTP is incorrect
AUTH_004 = Too many OTP attempts — account blocked for 30 minutes
AUTH_005 = JWT token is invalid or malformed
AUTH_006 = JWT token has expired — user must login again
AUTH_007 = User not found with this phone number
AUTH_008 = Account is suspended

USER_001 = User already exists with this phone number
USER_002 = User already exists with this email
USER_003 = KYC verification failed
USER_004 = Profile update failed — invalid data

SHIPMENT_001 = Pickup pincode not serviceable
SHIPMENT_002 = Delivery pincode not serviceable
SHIPMENT_003 = No couriers available for this route
SHIPMENT_004 = Shipment not found
SHIPMENT_005 = Shipment cannot be cancelled — already picked up
SHIPMENT_006 = Invalid weight — must be between 1 gram and 50000 grams
SHIPMENT_007 = AWB number not found

PAYMENT_001 = Payment order creation failed
PAYMENT_002 = Payment verification failed — invalid signature
PAYMENT_003 = Payment already processed
PAYMENT_004 = Refund initiation failed
PAYMENT_005 = Promo code not found
PAYMENT_006 = Promo code expired
PAYMENT_007 = Promo code already used
PAYMENT_008 = Minimum order amount not met for this promo code
PAYMENT_009 = Wallet balance insufficient

ADDRESS_001 = Pincode not found in database
ADDRESS_002 = Address not found
ADDRESS_003 = Cannot delete default address — set another as default first

VALIDATION_001 = Required field missing
VALIDATION_002 = Invalid field format
VALIDATION_003 = Field value out of allowed range

SERVER_001 = Internal server error — try again
SERVER_002 = Service temporarily unavailable
SERVER_003 = Courier API is down — try again in a few minutes

---

## ═══════════════════════════════════
## SECTION 1 — AUTH APIs
## ═══════════════════════════════════

### POST /auth/send-otp
Send OTP to a phone number for login or registration.

REQUEST BODY:
{
  "phone": "9876543210"         // required, 10 digits, no +91 prefix
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "expires_in": 300,          // seconds — OTP valid for 5 minutes
    "masked_phone": "98XXXXX210"
  }
}

ERROR RESPONSES:
400 { "success": false, "error": { "code": "AUTH_001", "message": "Invalid phone number" } }
429 { "success": false, "error": { "code": "AUTH_004", "message": "Too many attempts. Try after 30 minutes." } }

NOTES:
- In development mode OTP prints in server console — no real SMS sent
- In production mode real SMS sent via MSG91
- OTP is 6 digits
- Max 5 attempts per phone per hour


### POST /auth/verify-otp
Verify OTP and get JWT tokens. Works for both login and registration.

REQUEST BODY:
{
  "phone": "9876543210",       // required
  "otp": "123456"              // required, 6 digits
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",     // JWT — expires in 7 days
    "refresh_token": "eyJhbGc...",    // JWT — expires in 30 days
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "is_new_user": true               // true if first time login — show registration flow
  }
}

ERROR RESPONSES:
400 { "success": false, "error": { "code": "AUTH_003", "message": "Incorrect OTP" } }
400 { "success": false, "error": { "code": "AUTH_002", "message": "OTP has expired. Request a new one." } }


### POST /auth/refresh
Get new access token using refresh token.

REQUEST BODY:
{
  "refresh_token": "eyJhbGc..."   // required
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",    // new access token
    "expires_in": 604800             // seconds = 7 days
  }
}

ERROR RESPONSES:
401 { "success": false, "error": { "code": "AUTH_006", "message": "Refresh token expired. Please login again." } }


### POST /auth/logout
Logout user — invalidates refresh token.

HEADERS: Authorization: Bearer <token>

REQUEST BODY: {} (empty)

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}

---

## ═══════════════════════════════════
## SECTION 2 — USER APIs
## ═══════════════════════════════════

### POST /users/register
Register user profile after first OTP verification.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "name": "Rahul Sharma",          // required, min 2 chars, max 100 chars
  "email": "rahul@gmail.com",      // optional but recommended
  "referral_code": "FRIEND2024"    // optional — referral code of person who referred
}

SUCCESS RESPONSE (201):
{
  "success": true,
  "data": {
    "user_id": "550e8400-...",
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "email": "rahul@gmail.com",
    "kyc_status": "pending",
    "wallet_balance": 0,
    "referral_code": "RAHUL2024",   // their unique code to share
    "created_at": "2025-03-22T14:30:00.000Z"
  }
}

ERROR RESPONSES:
409 { "success": false, "error": { "code": "USER_001", "message": "User already registered" } }
409 { "success": false, "error": { "code": "USER_002", "message": "Email already in use" } }


### GET /users/profile
Get logged-in user profile.

HEADERS: Authorization: Bearer <token>

NO REQUEST BODY

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "user_id": "550e8400-...",
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "email": "rahul@gmail.com",
    "kyc_status": "verified",       // pending | verified | failed
    "wallet_balance": 50000,        // in paise — Rs 500.00
    "referral_code": "RAHUL2024",
    "total_shipments": 12,
    "created_at": "2025-03-22T14:30:00.000Z"
  }
}

ERROR RESPONSES:
401 { "success": false, "error": { "code": "AUTH_005", "message": "Invalid or missing token" } }


### PATCH /users/profile
Update user profile — name and email only.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "name": "Rahul Kumar",           // optional
  "email": "newemail@gmail.com"    // optional
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "user_id": "550e8400-...",
    "name": "Rahul Kumar",
    "email": "newemail@gmail.com",
    "updated_at": "2025-03-22T15:00:00.000Z"
  }
}


### POST /users/kyc/initiate
Start Aadhaar OTP KYC process.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "aadhaar_number": "123456789012"  // required, 12 digits, no spaces
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "session_id": "digio_session_xxx",   // store this — needed for verify step
    "message": "OTP sent to Aadhaar linked mobile number",
    "expires_in": 600                    // 10 minutes
  }
}


### POST /users/kyc/verify
Verify Aadhaar OTP to complete KYC.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "session_id": "digio_session_xxx",  // from initiate response
  "otp": "123456"                     // OTP received on Aadhaar-linked phone
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "kyc_status": "verified",
    "message": "KYC verified successfully. Your account is now fully activated."
  }
}

ERROR RESPONSES:
400 { "success": false, "error": { "code": "USER_003", "message": "KYC verification failed. Incorrect OTP." } }

---

## ═══════════════════════════════════
## SECTION 3 — ADDRESS APIs
## ═══════════════════════════════════

### POST /address/search
Search for an address using natural language or landmark.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "query": "near India Gate Delhi",  // required — any text or landmark
  "limit": 5                         // optional — default 5, max 10
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "results": [
      {
        "address": "India Gate, Rajpath, New Delhi",
        "pincode": "110001",
        "city": "New Delhi",
        "state": "Delhi",
        "score": 0.94              // relevance — 1.0 is perfect match
      }
    ]
  }
}


### GET /pincodes/check
Check if both pickup and delivery pincodes are serviceable.

HEADERS: Authorization: Bearer <token>

QUERY PARAMS:
pickup=110001&delivery=400001

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "pickup": {
      "pincode": "110001",
      "city": "New Delhi",
      "serviceable": true
    },
    "delivery": {
      "pincode": "400001",
      "city": "Mumbai",
      "serviceable": true
    },
    "both_serviceable": true
  }
}

ERROR RESPONSE when not serviceable (200 — not an error, just a result):
{
  "success": true,
  "data": {
    "pickup": { "pincode": "110001", "city": "New Delhi", "serviceable": true },
    "delivery": { "pincode": "734003", "city": "Darjeeling", "serviceable": false },
    "both_serviceable": false,
    "message": "Delivery pincode 734003 is not serviceable yet",
    "nearest_serviceable": "734001"
  }
}


### POST /users/addresses
Save a new address to address book.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "label": "home",                          // home | work | other
  "full_address": "42 Lajpat Nagar Market", // required
  "pincode": "110024",                      // required, 6 digits
  "city": "New Delhi",                      // required
  "state": "Delhi",                         // required
  "landmark": "Near Metro Station",         // optional
  "is_default": false                       // optional
}

SUCCESS RESPONSE (201):
{
  "success": true,
  "data": {
    "address_id": "550e8400-...",
    "label": "home",
    "full_address": "42 Lajpat Nagar Market",
    "pincode": "110024",
    "city": "New Delhi",
    "state": "Delhi",
    "is_default": false,
    "created_at": "2025-03-22T14:30:00.000Z"
  }
}


### GET /users/addresses
Get all saved addresses for logged-in user.

HEADERS: Authorization: Bearer <token>

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "addresses": [
      {
        "address_id": "550e8400-...",
        "label": "home",
        "full_address": "42 Lajpat Nagar Market",
        "pincode": "110024",
        "city": "New Delhi",
        "state": "Delhi",
        "is_default": true
      }
    ],
    "total": 3
  }
}


### PUT /users/addresses/:address_id
Update a saved address.

HEADERS: Authorization: Bearer <token>

REQUEST BODY: Same fields as POST /users/addresses — all optional

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "address_id": "550e8400-...", "updated_at": "2025-03-22T14:30:00.000Z" }
}


### DELETE /users/addresses/:address_id
Delete a saved address.

HEADERS: Authorization: Bearer <token>

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": { "message": "Address deleted successfully" }
}

ERROR RESPONSES:
400 { "success": false, "error": { "code": "ADDRESS_003", "message": "Cannot delete default address" } }

---

## ═══════════════════════════════════
## SECTION 4 — COURIER RATE APIs
## ═══════════════════════════════════

### GET /couriers/rates
Get shipping rates from all available couriers.

HEADERS: Authorization: Bearer <token>

QUERY PARAMS:
pickup=110001
delivery=400001
weight=1000          // in grams — 1000 = 1kg
length=20            // cm — optional
width=15             // cm — optional
height=10            // cm — optional
is_cod=false         // optional — filter couriers that support COD

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "pickup_pincode": "110001",
    "delivery_pincode": "400001",
    "weight_grams": 1000,
    "cached": false,              // true if returned from Redis cache
    "couriers": [
      {
        "courier_id": "delhivery",
        "courier_name": "Delhivery",
        "logo_url": "https://...",
        "price_paise": 8900,       // Rs 89.00
        "official_eta_days": 3,
        "ai_eta_days": 4,          // AI predicted real delivery time
        "ai_confidence": 0.82,     // 0 to 1
        "cod_available": true,
        "cod_fee_paise": 2500,
        "pickup_sla_hours": 2,     // pickup within 2 hours
        "rating": 4.2,
        "is_sponsored": true,      // show SPONSORED badge
        "tags": ["fastest", "cod_available"]
      },
      {
        "courier_id": "dtdc",
        "courier_name": "DTDC",
        "price_paise": 7500,
        "official_eta_days": 4,
        "ai_eta_days": 5,
        "ai_confidence": 0.79,
        "cod_available": true,
        "cod_fee_paise": 2500,
        "pickup_sla_hours": 4,
        "rating": 3.8,
        "is_sponsored": false,
        "tags": ["cheapest"]
      }
    ],
    "expires_at": "2025-03-22T14:45:00.000Z"   // cache expires — refresh after this
  }
}

ERROR RESPONSES:
400 { "success": false, "error": { "code": "SHIPMENT_001", "message": "Pickup pincode not serviceable" } }
400 { "success": false, "error": { "code": "SHIPMENT_003", "message": "No couriers available for this route" } }

---

## ═══════════════════════════════════
## SECTION 5 — SHIPMENT APIs
## ═══════════════════════════════════

### POST /shipments/create
Create a draft shipment before payment.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "pickup_address": {
    "full_address": "42 Lajpat Nagar Market",
    "pincode": "110024",
    "city": "New Delhi",
    "state": "Delhi",
    "name": "Rahul Sharma",
    "phone": "9876543210"
  },
  "delivery_address": {
    "full_address": "Flat 204 Andheri West",
    "pincode": "400053",
    "city": "Mumbai",
    "state": "Maharashtra",
    "name": "Priya Kumar",
    "phone": "9123456789"
  },
  "courier_id": "delhivery",
  "weight_grams": 1000,
  "length_cm": 20,              // optional
  "width_cm": 15,               // optional
  "height_cm": 10,              // optional
  "parcel_type": "parcel",      // document | parcel | fragile | liquid
  "is_cod": false,
  "cod_amount_paise": 0,        // required if is_cod=true
  "pickup_instructions": "Ring bell twice"  // optional
}

SUCCESS RESPONSE (201):
{
  "success": true,
  "data": {
    "shipment_id": "550e8400-...",
    "status": "draft",
    "amount_paise": 8900,
    "gst_paise": 1602,
    "total_paise": 10502,
    "created_at": "2025-03-22T14:30:00.000Z"
  }
}


### GET /shipments/:shipment_id
Get full details of a shipment.

HEADERS: Authorization: Bearer <token>

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "shipment_id": "550e8400-...",
    "status": "in_transit",
    "awb_number": "1234567890",
    "courier_id": "delhivery",
    "courier_name": "Delhivery",
    "pickup_address": { ... },
    "delivery_address": { ... },
    "weight_grams": 1000,
    "amount_paise": 8900,
    "total_paise": 10502,
    "is_cod": false,
    "evidence_uploaded": true,
    "evidence_hash": "abc123...",
    "label_url": "https://s3.../label.pdf",
    "created_at": "2025-03-22T14:30:00.000Z",
    "booked_at": "2025-03-22T14:35:00.000Z"
  }
}


### GET /users/shipments
Get all shipments for logged-in user with pagination.

HEADERS: Authorization: Bearer <token>

QUERY PARAMS:
page=1               // default 1
limit=20             // default 20, max 50
status=in_transit    // optional filter: draft|pending|booked|picked|in_transit|out_for_delivery|delivered|rto|cancelled

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "shipments": [ { ... } ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}


### GET /shipments/search
Search shipments by AWB, city, or courier name.

HEADERS: Authorization: Bearer <token>

QUERY PARAMS:
q=SR123              // search term

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "shipments": [ { ... } ],
    "total": 2
  }
}


### POST /shipments/:shipment_id/cancel
Cancel a shipment and trigger refund.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "reason": "Changed my mind"  // optional
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "shipment_id": "550e8400-...",
    "status": "cancelled",
    "refund_amount_paise": 10502,
    "refund_to": "wallet",           // wallet | original_payment_method
    "refund_eta": "Instant to wallet | 3-5 days to bank"
  }
}

ERROR RESPONSES:
400 { "success": false, "error": { "code": "SHIPMENT_005", "message": "Shipment already picked up. Cannot cancel." } }


### POST /shipments/:shipment_id/confirm-delivery
Confirm delivery by entering OTP.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "otp": "4821"    // 4-digit OTP sent to receiver
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "shipment_id": "550e8400-...",
    "status": "delivered",
    "delivered_at": "2025-03-22T16:30:00.000Z"
  }
}

---

## ═══════════════════════════════════
## SECTION 6 — PAYMENT APIs
## ═══════════════════════════════════

### POST /payments/initiate
Create Razorpay payment order for a shipment.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "shipment_id": "550e8400-...",       // required
  "use_wallet": false,                 // optional — use wallet balance
  "promo_code": "FIRST50"             // optional
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "order_id": "order_rzp_xxx",       // pass to Razorpay SDK on frontend
    "amount_paise": 10502,             // total to pay
    "wallet_used_paise": 0,            // amount deducted from wallet
    "final_amount_paise": 10502,       // amount to charge via Razorpay
    "razorpay_key": "rzp_test_xxx",    // public key for Razorpay SDK
    "discount_paise": 0,               // discount if promo applied
    "currency": "INR"
  }
}

ERROR RESPONSES:
400 { "success": false, "error": { "code": "PAYMENT_005", "message": "Invalid promo code" } }
400 { "success": false, "error": { "code": "PAYMENT_009", "message": "Insufficient wallet balance" } }


### POST /payments/webhook
Razorpay calls this endpoint automatically after payment.
NOT called by frontend — called by Razorpay servers only.

HEADERS:
x-razorpay-signature: sha256_signature_from_razorpay

REQUEST BODY: Razorpay webhook payload (raw JSON)

SUCCESS RESPONSE (200):
{ "received": true }

NOTES:
- Always return 200 even if processing fails — Razorpay retries on non-200
- Verify signature before processing
- Idempotent — safe to receive same event twice


### POST /payments/apply-promo
Validate and get discount amount for a promo code.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "code": "FIRST50",
  "shipment_id": "550e8400-..."
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "code": "FIRST50",
    "discount_type": "flat",          // flat | percentage
    "discount_paise": 5000,           // Rs 50 discount
    "original_amount_paise": 10502,
    "final_amount_paise": 5502,
    "message": "Coupon applied! You save Rs 50"
  }
}

ERROR RESPONSES:
400 { "success": false, "error": { "code": "PAYMENT_006", "message": "Promo code has expired" } }
400 { "success": false, "error": { "code": "PAYMENT_007", "message": "You have already used this code" } }

---

## ═══════════════════════════════════
## SECTION 7 — TRACKING APIs
## ═══════════════════════════════════

### GET /tracking/:awb
Get full tracking timeline for a shipment.

HEADERS: Authorization: Bearer <token>

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "awb": "1234567890",
    "courier": "Delhivery",
    "current_status": "out_for_delivery",
    "current_location": "Mumbai Andheri Hub",
    "official_eta": "2025-03-22",
    "ai_eta": "2025-03-23",
    "delivery_otp": "4821",             // only shown when out_for_delivery
    "events": [
      {
        "status": "out_for_delivery",
        "location": "Mumbai Andheri Hub",
        "description": "Shipment out for delivery",
        "timestamp": "2025-03-22T07:15:00.000Z"
      },
      {
        "status": "in_transit",
        "location": "Mumbai Sorting Facility",
        "description": "Arrived at destination city hub",
        "timestamp": "2025-03-21T23:00:00.000Z"
      }
    ]
  }
}

ERROR RESPONSES:
404 { "success": false, "error": { "code": "SHIPMENT_007", "message": "AWB not found" } }


### POST /tracking/webhooks/delhivery
Delhivery calls this to update shipment status.
NOT called by frontend.

### POST /tracking/webhooks/dtdc
DTDC calls this to update shipment status.
NOT called by frontend.

---

## ═══════════════════════════════════
## SECTION 8 — EVIDENCE VAULT APIs
## ═══════════════════════════════════

### POST /evidence/upload
Upload packing photo or video for Evidence Vault.

HEADERS:
Authorization: Bearer <token>
Content-Type: multipart/form-data

REQUEST BODY (multipart form):
shipment_id: "550e8400-..."
file: <binary file data>           // JPG, PNG, or MP4 — max 50MB

SUCCESS RESPONSE (201):
{
  "success": true,
  "data": {
    "evidence_id": "550e8400-...",
    "file_url": "https://s3.../evidence/xxx.mp4",
    "file_hash": "a3f4b2c1d5e6...",    // SHA-256 hash — tamper proof
    "file_size_bytes": 2450000,
    "uploaded_at": "2025-03-22T14:30:00.000Z",
    "message": "Evidence secured. Hash stored permanently."
  }
}


### GET /evidence/:shipment_id
Get evidence for a shipment.

HEADERS: Authorization: Bearer <token>

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "evidence_id": "550e8400-...",
    "file_url": "https://s3.../evidence/xxx.mp4",
    "file_hash": "a3f4b2c1d5e6...",
    "uploaded_at": "2025-03-22T14:30:00.000Z"
  }
}

---

## ═══════════════════════════════════
## SECTION 9 — WALLET APIs
## ═══════════════════════════════════

### GET /wallet/balance
Get current wallet balance.

HEADERS: Authorization: Bearer <token>

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "balance_paise": 50000,          // Rs 500.00
    "balance_display": "Rs 500.00"   // formatted for display
  }
}


### POST /wallet/add
Initiate wallet top-up via Razorpay.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "amount_paise": 50000    // Rs 500 — min 1000 paise (Rs 10), max 1000000 paise (Rs 10000)
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "order_id": "order_rzp_xxx",
    "amount_paise": 50000,
    "razorpay_key": "rzp_test_xxx",
    "currency": "INR"
  }
}


### GET /wallet/transactions
Get wallet transaction history with pagination.

HEADERS: Authorization: Bearer <token>

QUERY PARAMS:
page=1
limit=20

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transaction_id": "550e8400-...",
        "type": "credit",                    // credit | debit
        "amount_paise": 10000,
        "description": "Referral bonus — Priya joined",
        "balance_after_paise": 60000,
        "created_at": "2025-03-22T10:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 8, "total_pages": 1 }
  }
}


### POST /wallet/withdraw
Withdraw wallet balance to bank account.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "amount_paise": 30000,       // min 10000 paise (Rs 100)
  "bank_account_number": "1234567890",
  "ifsc_code": "HDFC0001234",
  "account_holder_name": "Rahul Sharma"
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "withdrawal_id": "550e8400-...",
    "amount_paise": 30000,
    "bank_account": "XXXX7890",
    "estimated_credit": "1-3 business days",
    "status": "processing"
  }
}

---

## ═══════════════════════════════════
## SECTION 10 — COD APIs
## ═══════════════════════════════════

### POST /cod/collect
Record COD collection by courier agent.

HEADERS: Authorization: Bearer <token>  // courier partner token

REQUEST BODY:
{
  "awb_number": "1234567890",
  "collected_amount_paise": 85000
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "collection_id": "550e8400-...",
    "awb": "1234567890",
    "collected_amount_paise": 85000,
    "platform_fee_paise": 2125,          // 2.5% platform fee
    "net_payout_paise": 82875,
    "payout_eta": "Within 48 hours",
    "collected_at": "2025-03-22T16:30:00.000Z"
  }
}

---

## ═══════════════════════════════════
## SECTION 11 — RETURNS APIs
## ═══════════════════════════════════

### POST /shipments/return
Initiate a return shipment.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "original_shipment_id": "550e8400-...",
  "reason": "wrong_item",        // wrong_item | damaged | buyer_cancelled | other
  "reason_description": "Wrong color delivered",  // optional
  "pickup_slot_date": "2025-03-23",
  "pickup_slot_time": "2pm-6pm"
}

SUCCESS RESPONSE (201):
{
  "success": true,
  "data": {
    "return_shipment_id": "550e8400-...",
    "return_awb": "RET1234567890",
    "return_label_url": "https://s3.../return-label.pdf",
    "pickup_date": "2025-03-23",
    "pickup_slot": "2pm-6pm",
    "return_shipping_fee_paise": 7900
  }
}

---

## ═══════════════════════════════════
## SECTION 12 — DISPUTES APIs
## ═══════════════════════════════════

### POST /disputes
Raise a dispute for a shipment.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "shipment_id": "550e8400-...",
  "type": "weight_mismatch",     // weight_mismatch | damage | not_delivered | wrong_delivery | cod_not_remitted
  "description": "Charged for 2kg but parcel was 500g",
  "evidence_ids": ["550e8400-..."]   // optional — link Evidence Vault files
}

SUCCESS RESPONSE (201):
{
  "success": true,
  "data": {
    "dispute_id": "550e8400-...",
    "dispute_reference": "DSP20250322XXXX",
    "status": "open",
    "expected_resolution": "3-5 business days",
    "created_at": "2025-03-22T14:30:00.000Z"
  }
}


### GET /disputes/:dispute_id
Get dispute status and activity log.

HEADERS: Authorization: Bearer <token>

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "dispute_id": "550e8400-...",
    "type": "weight_mismatch",
    "status": "under_review",     // open | under_review | resolved_for_user | resolved_for_courier | closed
    "activity": [
      { "event": "Dispute received", "timestamp": "..." },
      { "event": "Assigned to ops team", "timestamp": "..." }
    ],
    "resolution": null             // filled when resolved
  }
}

---

## ═══════════════════════════════════
## SECTION 13 — AI + MISC APIs
## ═══════════════════════════════════

### POST /ai/predict-eta
Get AI predicted delivery time.

HEADERS: Authorization: Bearer <token>

REQUEST BODY:
{
  "courier_id": "delhivery",
  "pickup_pincode": "110001",
  "delivery_pincode": "400001",
  "weight_grams": 1000,
  "day_of_week": 1                // 0=Monday, 6=Sunday
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "predicted_days": 4,
    "confidence": 0.82,
    "official_eta_days": 3,
    "note": "Based on 847 historical deliveries on this route"
  }
}


### GET /health
Server health check — used by monitoring tools.

NO AUTH REQUIRED

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-03-22T14:30:00.000Z",
    "services": {
      "database": "ok",
      "redis": "ok",
      "kafka": "ok",
      "mongodb": "ok"
    },
    "version": "1.0.0"
  }
}

---

## ═══════════════════════════════════
## SECTION 14 — ADMIN APIs
## All admin routes require admin JWT token
## ═══════════════════════════════════

### POST /admin/login
Admin login with email and password.

REQUEST BODY:
{
  "email": "admin@swiftroute.in",
  "password": "secure_password"
}

SUCCESS RESPONSE (200):
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "admin_id": "550e8400-...",
    "role": "superadmin"           // superadmin | ops | finance
  }
}


### GET /admin/users
List all users with filters.

HEADERS: Authorization: Bearer <admin_token>

QUERY PARAMS:
page=1
limit=20
kyc_status=pending        // optional filter
search=rahul              // optional search by name or phone


### GET /admin/users/:user_id
Get full user profile for admin.


### PATCH /admin/users/:user_id/kyc
Manually approve or reject KYC.

REQUEST BODY:
{
  "action": "approve",        // approve | reject
  "reason": "Documents verified manually"
}


### POST /admin/users/:user_id/suspend
Suspend or ban a user account.

REQUEST BODY:
{
  "action": "suspend",        // suspend | ban | reactivate
  "reason": "Fraud detected",
  "duration_hours": 24        // only for suspend — null means permanent
}


### GET /admin/shipments
List all shipments with filters.

QUERY PARAMS:
page=1, limit=20, status=in_transit, courier_id=delhivery, date_from=2025-03-01


### GET /admin/disputes
List all disputes requiring attention.

QUERY PARAMS:
page=1, limit=20, status=open


### PATCH /admin/disputes/:dispute_id/resolve
Resolve a dispute with compensation.

REQUEST BODY:
{
  "outcome": "resolved_for_user",    // resolved_for_user | resolved_for_courier
  "compensation_paise": 12000,
  "notes": "Courier confirmed incorrect weight billing"
}


### POST /admin/announcements
Send announcement to users.

REQUEST BODY:
{
  "title": "New Feature: International Shipping",
  "message": "You can now ship to 220+ countries!",
  "target": "all",          // all | domestic_users | international_users
  "channels": ["push", "whatsapp", "sms"]
}


### POST /admin/promos
Create a promo code.

REQUEST BODY:
{
  "code": "SUMMER50",
  "discount_type": "flat",          // flat | percentage
  "discount_paise": 5000,
  "min_order_paise": 10000,
  "valid_from": "2025-04-01",
  "valid_until": "2025-04-30",
  "total_uses_limit": 1000,
  "per_user_limit": 1
}


### GET /admin/payouts/pending
Get all pending COD payouts.


### POST /admin/payouts/process-all
Process all pending COD payouts in batch via Cashfree.