# API Key Guide

Complete guide for creating, managing, and using API keys in the Master Backend API.

## Table of Contents

- [API Key Format](#api-key-format)
- [Creating an API Key](#creating-an-api-key)
- [Using API Keys](#using-api-keys)
- [Managing API Keys](#managing-api-keys)
- [Permissions](#permissions)
- [Rate Limits](#rate-limits)
- [IP and Domain Restrictions](#ip-and-domain-restrictions)
- [Flexible Authentication](#flexible-authentication)
- [Security Best Practices](#security-best-practices)
- [Error Codes](#error-codes)
- [Troubleshooting](#troubleshooting)

## API Key Format

API keys follow this format:

- **Production**: `bmc_live_<48-character-hex-string>`
- **Development/Test**: `bmc_test_<48-character-hex-string>`

Example:
```
bmc_live_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6
```

## Creating an API Key

### Prerequisites

1. **Authenticate** - Login to get a JWT token
2. **Use JWT** - All API key management endpoints require JWT authentication

### Request

**Endpoint**: `POST /api/api-keys`

**Headers**:
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "My Production App",
  "description": "API key for production mobile app",
  "permissions": ["read", "write"],
  "rateLimit": {
    "requestsPerMinute": 100,
    "requestsPerHour": 5000,
    "requestsPerDay": 50000
  },
  "expiresInDays": 90,
  "allowedIps": ["192.168.1.100", "10.0.0.50"],
  "allowedDomains": ["example.com", "api.example.com"]
}
```

**Field Details**:
- `name` (required): 3-100 characters, identifies the key
- `description` (optional): Max 500 characters
- `permissions` (optional): Array of `["read", "write", "delete", "admin"]`. Defaults to `["read"]`
- `rateLimit` (optional): Custom rate limits
  - `requestsPerMinute`: 1-1000 (default: 60)
  - `requestsPerHour`: 1-100,000 (default: 1,000)
  - `requestsPerDay`: 1-1,000,000 (default: 10,000)
- `expiresInDays` (optional): 1-365 days. If omitted, key never expires
- `allowedIps` (optional): Array of IP addresses. If set, only these IPs can use the key
- `allowedDomains` (optional): Array of domains. If set, only requests from these domains are allowed

### Response

**Success (201)**:
```json
{
  "success": true,
  "message": "API key created successfully. Store it safely - you won't see it again",
  "data": {
    "apiKey": "bmc_live_a1b2c3d4e5f6...",
    "id": "507f1f77bcf86cd799439011",
    "name": "My Production App",
    "permissions": ["read", "write"],
    "expiresAt": "2026-05-20T10:00:00.000Z"
  }
}
```

⚠️ **CRITICAL**: The `apiKey` field in the response is the **only time** you'll see the plain key. Store it immediately - it cannot be retrieved later!

## Using API Keys

### Basic Usage

Include the API key in the `X-API-Key` header:

```bash
curl http://localhost:5000/api/demo/api-key-only \
  -H "X-API-Key: bmc_live_your_api_key_here"
```

### With Required Permissions

Some endpoints require specific permissions:

**Read-only endpoint**:
```bash
curl http://localhost:5000/api/demo/read-only \
  -H "X-API-Key: bmc_live_your_api_key_here"
```

**Write endpoint**:
```bash
curl -X POST http://localhost:5000/api/demo/write-required \
  -H "X-API-Key: bmc_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Managing API Keys

All management endpoints require JWT authentication (`Authorization: Bearer <token>`).

### Get All API Keys

**Endpoint**: `GET /api/api-keys`

**Response**:
```json
{
  "success": true,
  "data": {
    "apiKey": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "My Production App",
        "description": "API key for production mobile app",
        "permissions": ["read", "write"],
        "isActive": true,
        "usageCount": 1234,
        "lastUsedAt": "2026-02-19T10:00:00.000Z",
        "expiresAt": "2026-05-20T10:00:00.000Z",
        "createdAt": "2026-02-19T10:00:00.000Z"
      }
    ]
  }
}
```

Note: The actual key hash is never returned for security reasons.

### Update API Key

**Endpoint**: `PATCH /api/api-keys/:id`

**Request Body** (all fields optional):
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "permissions": ["read", "write", "delete"]
}
```

### Revoke API Key

**Endpoint**: `POST /api/api-keys/:id/revoke`

Revokes (disables) an API key but keeps the record. The key can be re-enabled by updating `isActive` to `true`.

**Response**:
```json
{
  "success": true,
  "message": "API key revoked successfully",
  "data": {
    "apiKey": { ... }
  }
}
```

### Delete API Key

**Endpoint**: `DELETE /api/api-keys/:id`

Permanently deletes an API key. This action cannot be undone.

**Response**:
```json
{
  "success": true,
  "message": "API key deleted sucessfully"
}
```

### Get Usage Statistics

**Endpoint**: `GET /api/api-keys/stats`

**Response**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalKeys": 5,
      "activeKeys": 3,
      "totalUsage": 12345
    }
  }
}
```

## Permissions

API keys can have one or more of these permissions:

- **read**: Read-only access to resources
- **write**: Create and update data
- **delete**: Delete data
- **admin**: Full administrative access

**Important**: 
- If no permissions are specified, defaults to `["read"]`
- Permissions are checked per-endpoint. An endpoint requiring `write` will reject a key with only `read` permission
- Multiple permissions can be combined: `["read", "write"]`

## Rate Limits

### Default Limits

Each API key has default rate limits:

- **60 requests per minute**
- **1,000 requests per hour**
- **10,000 requests per day**

### Custom Limits

You can set custom limits when creating a key:

```json
{
  "rateLimit": {
    "requestsPerMinute": 100,
    "requestsPerHour": 5000,
    "requestsPerDay": 50000
  }
}
```

**Limits**:
- Per minute: 1-1,000
- Per hour: 1-100,000
- Per day: 1-1,000,000

### Rate Limit Headers

Responses include rate limit information:

```
RateLimit-Limit: 60
RateLimit-Remaining: 45
RateLimit-Reset: 900
RateLimit-Policy: 100;w=900
```

## IP and Domain Restrictions

### IP Restrictions

Restrict API key usage to specific IP addresses:

```json
{
  "allowedIps": ["192.168.1.100", "10.0.0.50"]
}
```

- If `allowedIps` is set, **only** requests from these IPs will be accepted
- If `allowedIps` is empty/omitted, any IP can use the key
- Supports both IPv4 and IPv6 addresses

### Domain Restrictions

Restrict API key usage to specific domains:

```json
{
  "allowedDomains": ["example.com", "api.example.com"]
}
```

- If `allowedDomains` is set, **only** requests from these domains will be accepted
- Domain matching uses suffix matching (e.g., `example.com` matches `api.example.com`)
- If `allowedDomains` is empty/omitted, any domain can use the key

## Flexible Authentication

Some endpoints support **flexible authentication** - they accept either JWT tokens or API keys:

**Endpoint**: `GET /api/demo/flexible`

**With JWT**:
```bash
curl http://localhost:5000/api/demo/flexible \
  -H "Authorization: Bearer <jwt-token>"
```

**With API Key**:
```bash
curl http://localhost:5000/api/demo/flexible \
  -H "X-API-Key: bmc_live_your_api_key_here"
```

The endpoint will use whichever authentication method is provided.

## Security Best Practices

1. ✅ **Store API keys securely** - Use environment variables or secure secret management
2. ✅ **Never commit API keys to git** - Add `.env` to `.gitignore`
3. ✅ **Rotate keys regularly** - Create new keys and revoke old ones periodically
4. ✅ **Use principle of least privilege** - Grant only the permissions needed
5. ✅ **Set expiration dates** - Use `expiresInDays` to limit key lifetime
6. ✅ **Restrict by IP** - Use `allowedIps` for server-to-server communication
7. ✅ **Restrict by domain** - Use `allowedDomains` for web applications
8. ✅ **Revoke unused keys** - Disable keys that are no longer needed
9. ✅ **Monitor usage statistics** - Check `/api/api-keys/stats` regularly
10. ✅ **Use different keys per environment** - Separate keys for dev/staging/production

## Error Codes

### Authentication Errors

- **401 Unauthorized**:
  - `"API key is required. Please provide X-API-Key header"` - Missing API key header
  - `"Invalid API key"` - Key doesn't exist or is invalid
  - `"API key has expired"` - Key has passed its expiration date
  - `"Account associated with this API key is inactive"` - User account is deactivated/banned

### Authorization Errors

- **403 Forbidden**:
  - `"API key does not have 'write' permission"` - Insufficient permissions
  - `"IP address not allowed"` - Request IP not in `allowedIps`
  - `"Domain not allowed"` - Request domain not in `allowedDomains`

### Rate Limiting

- **429 Too Many Requests**:
  - `"Rate limit exceeded for this API key"` - Exceeded rate limit threshold

### Validation Errors

- **400 Bad Request**:
  - `"Invalid API key ID"` - Invalid MongoDB ObjectId format
  - `"Validation failed"` - Request body validation errors (see `errors` array)

### Not Found

- **404 Not Found**:
  - `"API key not found"` - Key doesn't exist or doesn't belong to the authenticated user

## Troubleshooting

### "Invalid API key" but key looks correct

- Check for extra spaces or newlines in the key
- Ensure you're using the correct environment prefix (`bmc_live_` vs `bmc_test_`)
- Verify the key hasn't been revoked (`isActive: false`)
- Check if the key has expired

### "IP address not allowed"

- Verify your server's public IP address
- Check if you're behind a proxy/CDN (IP might be the proxy's IP)
- Ensure `allowedIps` includes your current IP

### "Insufficient permissions"

- Check which permissions your key has: `GET /api/api-keys`
- Verify the endpoint's required permission
- Update the key with additional permissions if needed

### Rate limit issues

- Check current usage: `GET /api/api-keys/stats`
- Review rate limit headers in responses
- Consider increasing limits or implementing request queuing

### Key not found after creation

- The key is only shown **once** in the creation response
- If lost, you must create a new key
- Always store keys securely immediately after creation

---

**Need Help?** Check the API documentation or contact support.
