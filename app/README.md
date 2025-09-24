# Byte Digital - Advertising Platform Integration

A modern advertising platform integration system built with Remix, Shopify, and clean architecture principles.

## 📁 Project Structure

```
app/
├── components/           # Reusable UI components
│   ├── ConnectPrompt.jsx
│   ├── DateRangeControls.jsx
│   ├── IconHeader.jsx
│   └── KeyMetrics.jsx
├── config/              # Configuration files
│   └── app.server.js    # Application configuration
├── constants/           # Application constants
│   └── platforms.js     # Platform-specific constants
├── data/               # Mock data for testing
│   └── mockData.server.js
├── routes/             # Remix routes
│   └── ...
├── services/           # Business logic services
│   ├── connections.server.js  # Connection management
│   ├── google-ads.server.js   # Google Ads API service
│   └── meta-ads.server.js     # Meta Ads API service
└── utils/              # Utility functions
    ├── crypto.server.js       # Encryption utilities
    ├── dateUtils.js           # Date manipulation utilities
    └── formatters.js          # Data formatting utilities
```

## 🏗️ Architecture

### Clean Code Principles Applied

1. **Single Responsibility**: Each service handles one specific platform
2. **Separation of Concerns**: Business logic separated from UI components
3. **DRY (Don't Repeat Yourself)**: Common utilities extracted to shared modules
4. **Clear Naming**: Functions and variables have descriptive names
5. **Documentation**: Comprehensive JSDoc comments throughout

### Key Features

- ✅ **Mock Data Support**: Comprehensive mock data system for testing
- ✅ **Google Ads Integration**: Complete Google Ads API implementation
- ✅ **Meta Ads Integration**: Full Meta (Facebook) Ads API support
- ✅ **Clean Architecture**: Well-organized, maintainable code structure
- ✅ **Type Safety**: JSDoc annotations for better development experience

## 🔌 API Integration

### Google Ads API
- **Service**: `app/services/google-ads.server.js`
- **Features**: Metrics fetching, campaign management, authentication
- **API Version**: v14
- **Authentication**: OAuth2 with refresh tokens

### Meta Ads API
- **Service**: `app/services/meta-ads.server.js`
- **Features**: Insights, campaign data, token management
- **API Version**: v18.0
- **Authentication**: Long-lived access tokens

## 📊 Components

### KeyMetrics Component
- Displays platform-specific metrics in interactive cards
- Sparkline charts for trend visualization
- Dynamic metric selection
- Support for both Google and Meta platforms

### DateRangeControls Component
- Flexible date range picker
- Predefined date range presets
- Input validation and formatting
- Cache busting with random variations

## 🛠️ Utilities

### Date Utilities (`app/utils/dateUtils.js`)
- Date range presets (today, yesterday, last month, etc.)
- Date validation and manipulation
- Period comparison utilities

### Formatters (`app/utils/formatters.js`)
- Number formatting (1000 → 1k, 1000000 → 1M)
- Currency formatting
- Percentage formatting
- Date formatting for various uses

### Constants (`app/constants/platforms.js`)
- Platform identifiers and configurations
- Metric definitions and labels
- API endpoints and versions
- Chart colors and styling constants

## 🔒 Security

- Token encryption using `crypto.server.js`
- Secure storage of API credentials
- Environment-based configuration
- Proper error handling and validation

## 🧪 Testing & Development

### Mock Data System
- Realistic test data for both platforms
- Date-based variations for dynamic testing
- Easy switching between mock and real data
- Comprehensive coverage of all metrics

### Environment Configuration
- Test mode vs production mode
- Configurable API endpoints
- Mock connection capabilities
- Environment variable management

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   META_CLIENT_ID=your_meta_client_id
   META_CLIENT_SECRET=your_meta_client_secret
   SHOPIFY_APP_URL=your_shopify_app_url
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📝 Code Quality

- **ESLint**: Configured for consistent code style
- **Clean Naming**: No Turkish characters, descriptive English names
- **Documentation**: JSDoc comments for all functions
- **Error Handling**: Comprehensive error management
- **Type Safety**: JSDoc annotations for better IntelliSense

## 🔄 Data Flow

1. **User Selection**: Date range and platform selection
2. **API Service**: Platform-specific service handles API calls
3. **Data Processing**: Raw API data transformed to unified format
4. **Component Rendering**: Clean data displayed in responsive UI
5. **State Management**: Efficient state updates and caching

This architecture ensures maintainable, scalable, and clean code that follows modern development best practices.
