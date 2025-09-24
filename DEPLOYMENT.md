# Deployment Guide

## Environment Variables

Set the following environment variables for production deployment:

### Google Ads API
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Meta Ads API  
```bash
META_CLIENT_ID=your_meta_client_id
META_CLIENT_SECRET=your_meta_client_secret
```

### App Configuration
```bash
NODE_ENV=production
SHOPIFY_APP_URL=https://your-app-url.com
APP_ENCRYPTION_KEY=your_64_character_hex_key
```

## Environment Modes

### Development Mode
- Active when `NODE_ENV !== 'production'`
- Uses mock OAuth connections
- Returns mock data instead of real API calls
- Displays "Test Mode" badges on UI components

### Production Mode
- Active when `NODE_ENV=production`
- Uses real OAuth flows
- Makes actual API calls to Google Ads and Meta Ads
- Fetches live data from connected accounts

## API Integrations

### Google Ads API
- OAuth 2.0 authentication
- Secure encrypted refresh token storage
- Fetches metrics and campaign data
- Supports date range filtering

### Meta Ads API  
- Facebook OAuth authentication
- Encrypted long-lived access token storage
- Retrieves data from Meta Business API
- Supports Facebook and Instagram ads

## Database Schema

The application uses these tables:
- `Shop`: Shopify store information
- `AdPlatformConnection`: Platform connection status
- `GoogleConnection`: Google Ads OAuth and account data
- `MetaConnection`: Meta Ads OAuth and account data

## Security Features

1. **Encryption**: All OAuth tokens encrypted with AES-256-GCM
2. **Environment Variables**: Sensitive data stored in environment variables
3. **Secure Headers**: HTTPS required in production
4. **Token Refresh**: Automatic refresh for expired tokens

## Deployment Checklist

1. ✅ Configure environment variables
2. ✅ Run database migrations
3. ✅ Create Google Ads API project and configure OAuth consent
4. ✅ Create Meta Developer App and complete business verification
5. ✅ Update redirect URIs in platform settings
6. ✅ Ensure SSL certificate is installed
7. ✅ Update webhook URLs in Shopify Partner Dashboard

## Monitoring

Monitor these logs in production:
- OAuth flow success/error states
- API rate limit violations
- Token refresh failures
- Database connection issues

## Support

For troubleshooting:
1. Check application logs
2. Verify environment variables are correctly set
3. Check API quota limits
4. Verify platform service status
