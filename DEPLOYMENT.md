# 🚀 Production Deployment Guide for Vercel

This guide will help you deploy your Text-to-Speech application to Vercel in production.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab Repository**: Your code should be in a Git repository
3. **ElevenLabs API Key**: Get your API key from [elevenlabs.io](https://elevenlabs.io)
4. **Firebase Project**: Set up Firebase for authentication and database
5. **PayPal Business Account**: For payment processing

## 🔧 Environment Variables Setup

### In Vercel Dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the following variables:

```bash
# Required for API functionality
ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key

# Optional - for better logging
NODE_ENV=production
```

### Client-Side Environment Variables:

These should be prefixed with `VITE_` and added to Vercel:

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

## 🚀 Deployment Steps

### 1. Connect Repository

1. In Vercel dashboard, click "New Project"
2. Import your Git repository
3. Vercel will auto-detect the framework

### 2. Configure Build Settings

- **Framework Preset**: Other
- **Build Command**: `cd client && npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `npm install`

### 3. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

## 🔍 Post-Deployment Checklist

### ✅ Verify API Endpoints

Test your API endpoints:
```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Test voice generation (with proper headers)
curl -X POST https://your-domain.vercel.app/api/generate-voice \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello world","voiceId":"your_voice_id"}'
```

### ✅ Check Client Functionality

1. **Authentication**: Test login/signup
2. **Voice Generation**: Generate audio files
3. **Payment**: Test PayPal integration
4. **Database**: Verify Firestore operations

### ✅ Performance Optimization

1. **Bundle Analysis**: Check bundle size in Vercel
2. **Caching**: Verify proper headers are set
3. **CDN**: Ensure static assets are served from CDN

## 🛠️ Troubleshooting

### Common Issues:

1. **API 500 Errors**: Check environment variables
2. **CORS Issues**: Verify CORS configuration in server.js
3. **Build Failures**: Check dependency versions
4. **Environment Variables**: Ensure all required vars are set

### Debug Commands:

```bash
# Check Vercel logs
vercel logs

# Check build output
vercel build

# Test locally with Vercel
vercel dev
```

## 🔒 Security Considerations

1. **API Keys**: Never expose in client-side code
2. **CORS**: Restrict origins to your domain
3. **Rate Limiting**: Implement proper rate limiting
4. **Input Validation**: Validate all user inputs
5. **HTTPS**: Ensure all traffic uses HTTPS

## 📊 Monitoring

1. **Vercel Analytics**: Enable in dashboard
2. **Error Tracking**: Monitor API errors
3. **Performance**: Track Core Web Vitals
4. **Uptime**: Monitor service availability

## 🔄 Updates and Maintenance

1. **Automatic Deployments**: Push to main branch triggers deployment
2. **Environment Variables**: Update in Vercel dashboard
3. **Dependencies**: Keep packages updated
4. **Backups**: Regular database backups

## 📞 Support

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**Happy Deploying! 🎉** 