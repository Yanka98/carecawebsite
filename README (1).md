# CareConnect PayFast Gateway

A Vercel serverless gateway that handles PayFast payments for CareConnect, bypassing Replit IP restrictions.

## Deployment

### 1. GitHub Setup
1. Create repository: `careconnect-payfast-gateway`
2. Upload all files from this folder
3. Commit and push

### 2. Vercel Deployment
1. Import project from GitHub
2. Deploy with default settings
3. Add environment variables (see below)
4. Redeploy

### 3. Environment Variables
```
PAYFAST_MODE=live
PAYFAST_MERCHANT_ID=30416437
PAYFAST_MERCHANT_KEY=pad4oqiwqejc2
PAYFAST_PASSPHRASE=Allcarerecruitment6
APP_BASE_URL=https://careca-yankavanwyk.replit.app
GATEWAY_BASE_URL=https://your-vercel-url.vercel.app
```

### 4. PayFast Configuration
Update PayFast merchant settings:
- **Notify URL**: `https://your-vercel-url.vercel.app/api/notify`

## Endpoints

- `GET /api/health` - Health check
- `GET /api/create-subscription` - Generate PayFast payment form
- `POST /api/notify` - PayFast ITN webhook handler

## Testing

```bash
# Health check
curl https://your-vercel-url.vercel.app/api/health

# Create subscription
curl https://your-vercel-url.vercel.app/api/create-subscription?name_first=Test&name_last=User&email_address=test@example.com
```

## Features

- ✅ Identical PayFast logic to main CareConnect app
- ✅ AWS infrastructure PayFast trusts
- ✅ Proper signature generation and validation
- ✅ ITN webhook forwarding to main app
- ✅ IP validation and security
- ✅ Comprehensive logging

This gateway solves PayFast 400 errors caused by IP whitelisting restrictions.