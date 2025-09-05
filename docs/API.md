# Right Guard API Documentation

This document provides comprehensive documentation for the Right Guard Base Mini App API endpoints.

## Base URL

```
https://your-domain.com/api
```

## Authentication

Most endpoints require user authentication. The API uses Farcaster profiles for user identification.

## Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "data": any,
  "message": string (optional),
  "error": string (optional)
}
```

## Error Handling

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### Create or Update User

Create a new user or update an existing user's information.

**Endpoint:** `POST /api/auth`

**Request Body:**
```json
{
  "farcasterProfile": "string (required)",
  "selectedState": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "farcasterProfile": "string",
    "selectedState": "string",
    "premiumFeatures": ["string"],
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  },
  "message": "User created/updated successfully"
}
```

### Get User

Retrieve user information by Farcaster profile.

**Endpoint:** `GET /api/auth?farcasterProfile={profile}`

**Query Parameters:**
- `farcasterProfile` (required): The user's Farcaster profile

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "farcasterProfile": "string",
    "selectedState": "string",
    "premiumFeatures": ["string"],
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
}
```

---

## Legal Guide Endpoints

### Get Legal Guide

Retrieve or generate a legal guide for a specific state and language.

**Endpoint:** `GET /api/legal-guides?state={state}&language={language}`

**Query Parameters:**
- `state` (required): US state name (e.g., "California")
- `language` (required): Language code ("en" or "es")

**Response:**
```json
{
  "success": true,
  "data": {
    "guideId": "string",
    "state": "string",
    "language": "string",
    "title": "string",
    "content": "string (markdown format)",
    "script": "string",
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  },
  "message": "Guide generated and cached successfully"
}
```

### Create Legal Guide

Create a new legal guide (admin only).

**Endpoint:** `POST /api/legal-guides`

**Request Body:**
```json
{
  "state": "string (required)",
  "language": "string (required, 'en' or 'es')",
  "title": "string (required)",
  "content": "string (required)",
  "script": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "guideId": "string",
    "state": "string",
    "language": "string",
    "title": "string",
    "content": "string",
    "script": "string",
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  },
  "message": "Legal guide created successfully"
}
```

---

## Recording Endpoints

### Save Recording

Upload and save an incident recording to IPFS and database.

**Endpoint:** `POST /api/recordings`

**Request Body:** `multipart/form-data`
- `file` (required): Audio/video file
- `userId` (required): User ID
- `latitude` (required): Location latitude
- `longitude` (required): Location longitude
- `address` (optional): Human-readable address
- `notes` (optional): Additional notes

**Response:**
```json
{
  "success": true,
  "data": {
    "recordId": "string",
    "userId": "string",
    "timestamp": "ISO 8601 date",
    "location": {
      "latitude": number,
      "longitude": number,
      "address": "string"
    },
    "mediaUrl": "string (IPFS URL)",
    "notes": "string",
    "createdAt": "ISO 8601 date"
  },
  "message": "Recording saved successfully"
}
```

### Get Recordings

Retrieve user's incident recordings.

**Endpoint:** `GET /api/recordings?userId={userId}&limit={limit}&offset={offset}`

**Query Parameters:**
- `userId` (required): User ID
- `limit` (optional): Number of records to return (default: 10)
- `offset` (optional): Number of records to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "recordId": "string",
      "userId": "string",
      "timestamp": "ISO 8601 date",
      "location": {
        "latitude": number,
        "longitude": number,
        "address": "string"
      },
      "mediaUrl": "string",
      "notes": "string",
      "createdAt": "ISO 8601 date"
    }
  ]
}
```

### Delete Recording

Delete an incident recording.

**Endpoint:** `DELETE /api/recordings?recordId={recordId}&userId={userId}`

**Query Parameters:**
- `recordId` (required): Recording ID
- `userId` (required): User ID (for ownership verification)

**Response:**
```json
{
  "success": true,
  "message": "Recording deleted successfully"
}
```

---

## Alert Endpoints

### Send Alert

Send emergency alerts to specified recipients.

**Endpoint:** `POST /api/alerts`

**Request Body:**
```json
{
  "userId": "string (required)",
  "recipients": ["string (required, array of phone/email/farcaster)"],
  "incidentRecordId": "string (optional)",
  "alertType": "string (optional, 'emergency'|'recording'|'followUp')",
  "language": "string (optional, 'en'|'es')",
  "location": "string (optional)",
  "customMessage": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "alertId": "string",
        "userId": "string",
        "incidentRecordId": "string",
        "recipient": "string",
        "timestamp": "ISO 8601 date",
        "status": "string ('sent'|'delivered'|'failed')",
        "createdAt": "ISO 8601 date"
      }
    ],
    "summary": {
      "total": number,
      "successful": number,
      "failed": number
    }
  },
  "message": "Alerts sent: X successful, Y failed"
}
```

### Get Alerts

Retrieve user's alert history.

**Endpoint:** `GET /api/alerts?userId={userId}&incidentRecordId={recordId}&limit={limit}&offset={offset}`

**Query Parameters:**
- `userId` (required): User ID
- `incidentRecordId` (optional): Filter by incident record
- `limit` (optional): Number of records to return (default: 50)
- `offset` (optional): Number of records to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "alertId": "string",
      "userId": "string",
      "incidentRecordId": "string",
      "recipient": "string",
      "timestamp": "ISO 8601 date",
      "status": "string",
      "createdAt": "ISO 8601 date"
    }
  ]
}
```

### Update Alert Status

Update the delivery status of an alert.

**Endpoint:** `PATCH /api/alerts`

**Request Body:**
```json
{
  "alertId": "string (required)",
  "status": "string (required, 'sent'|'delivered'|'failed')"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alertId": "string",
    "userId": "string",
    "incidentRecordId": "string",
    "recipient": "string",
    "timestamp": "ISO 8601 date",
    "status": "string",
    "createdAt": "ISO 8601 date"
  },
  "message": "Alert status updated successfully"
}
```

---

## Payment Endpoints

### Purchase Premium Feature

Process a premium feature purchase using Base blockchain transaction.

**Endpoint:** `POST /api/payments`

**Request Body:**
```json
{
  "userId": "string (required)",
  "featureKey": "string (required)",
  "txHash": "string (required, Base transaction hash)",
  "amount": number (required)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "string",
      "farcasterProfile": "string",
      "selectedState": "string",
      "premiumFeatures": ["string"],
      "createdAt": "ISO 8601 date",
      "updatedAt": "ISO 8601 date"
    },
    "unlockedFeature": {
      "name": "string",
      "price": number,
      "description": "string"
    }
  },
  "message": "Feature unlocked successfully!"
}
```

### Get Premium Features

Retrieve user's premium feature status.

**Endpoint:** `GET /api/payments?userId={userId}`

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "unlocked": [
      {
        "key": "string",
        "name": "string",
        "price": number,
        "description": "string"
      }
    ],
    "available": [
      {
        "key": "string",
        "name": "string",
        "price": number,
        "description": "string"
      }
    ]
  }
}
```

### Validate Feature Access

Check if a user has access to a specific premium feature.

**Endpoint:** `PATCH /api/payments`

**Request Body:**
```json
{
  "userId": "string (required)",
  "featureKey": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasAccess": boolean,
    "feature": {
      "name": "string",
      "price": number,
      "description": "string"
    }
  }
}
```

---

## Data Models

### User
```typescript
interface User {
  userId: string;
  farcasterProfile?: string;
  selectedState: string;
  premiumFeatures: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Legal Guide
```typescript
interface LegalGuide {
  guideId: string;
  state: string;
  language: 'en' | 'es';
  title: string;
  content: string;
  script: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Incident Record
```typescript
interface IncidentRecord {
  recordId: string;
  userId: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  mediaUrl?: string;
  notes?: string;
  createdAt: Date;
}
```

### Alert Log
```typescript
interface AlertLog {
  alertId: string;
  userId: string;
  incidentRecordId: string;
  recipient: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'failed';
  createdAt: Date;
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Authentication endpoints: 10 requests per minute per IP
- Legal guide generation: 5 requests per minute per user
- Recording uploads: 3 requests per minute per user
- Alert sending: 10 alerts per hour per user
- Payment processing: 5 requests per minute per user

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_USER` | Invalid or missing user |
| `INVALID_STATE` | Invalid US state |
| `INVALID_LANGUAGE` | Invalid language code |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| `INVALID_TRANSACTION` | Invalid or unconfirmed blockchain transaction |
| `FEATURE_ALREADY_UNLOCKED` | Premium feature already unlocked |
| `INSUFFICIENT_FUNDS` | Transaction amount doesn't match feature price |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

---

## SDK Usage Examples

### JavaScript/TypeScript

```typescript
import { services } from '@/lib/services';

// Create user
const user = await services.auth.createOrUpdateUser('farcaster-username', 'California');

// Get legal guide
const guide = await services.legalGuide.getGuide('California', 'en');

// Save recording
const recording = await services.recording.saveRecording(
  file,
  userId,
  { latitude: 37.7749, longitude: -122.4194, address: 'San Francisco, CA' },
  'Traffic stop incident'
);

// Send alert
const alertResult = await services.alert.sendAlert(
  userId,
  ['+1234567890', 'user@example.com', '@farcaster-friend'],
  {
    alertType: 'emergency',
    location: 'San Francisco, CA',
    language: 'en'
  }
);

// Purchase premium feature
const purchase = await services.payment.purchaseFeature(
  userId,
  'stateSpecific',
  '0x1234...abcd',
  0.99
);
```

---

## Webhooks

Right Guard supports webhooks for real-time notifications:

### Alert Delivery Status
Webhook URL: `POST {your-webhook-url}`

Payload:
```json
{
  "event": "alert.delivered" | "alert.failed",
  "data": {
    "alertId": "string",
    "userId": "string",
    "recipient": "string",
    "status": "delivered" | "failed",
    "timestamp": "ISO 8601 date"
  }
}
```

### Premium Feature Purchase
Webhook URL: `POST {your-webhook-url}`

Payload:
```json
{
  "event": "feature.purchased",
  "data": {
    "userId": "string",
    "featureKey": "string",
    "txHash": "string",
    "amount": number,
    "timestamp": "ISO 8601 date"
  }
}
```

---

## Testing

Use the following test endpoints for development:

- **Test User:** `farcaster-test-user`
- **Test State:** `California`
- **Test Transaction Hash:** `0x1234567890abcdef1234567890abcdef12345678`

All test data is automatically cleaned up after 24 hours.

---

## Support

For API support, please contact:
- Email: api-support@rightguard.app
- Documentation: https://docs.rightguard.app
- Status Page: https://status.rightguard.app
