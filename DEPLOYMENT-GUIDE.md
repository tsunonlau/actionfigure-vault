# 🚀 Step-by-Step Guide: Deploy ActionFigure Vault to GitHub & Cloud Platform

This guide will help you publish your PayPal-integrated ActionFigure Vault website to GitHub and deploy it to a free cloud platform so PayPal's server-side shipping callbacks work properly.

## Prerequisites

- All project files downloaded from the previous conversation
- Git installed on your computer
- GitHub account (free)
- Code editor (VS Code, etc.)

## 📁 Step 1: Organize Your Project Files

1. Create a new folder on your computer called `actionfigure-vault`
2. Download and place all these files in the folder:
   - `client.js`
   - `server.js`
   - `index.html`
   - `styles.css`
   - `package.json`
   - `.env.example`
   - `.env`
   - `QUICKSTART.md`

3. Your folder structure should look like:
   ```
   actionfigure-vault/
   ├── client.js
   ├── server.js
   ├── index.html
   ├── styles.css
   ├── package.json
   ├── .env.example
   ├── .env
   └── QUICKSTART.md
   ```

## 🔐 Step 2: Set Up Environment Variables

1. Open `.env` file and add your PayPal credentials:
   ```
   PAYPAL_CLIENT_ID=your_actual_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_actual_paypal_client_secret
   PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
   NODE_ENV=development
   ```

2. **Important**: Never commit `.env` to GitHub - it contains sensitive information!

## 📋 Step 3: Create .gitignore File

1. Create a new file called `.gitignore` in your project folder
2. Add this content to prevent sensitive files from being uploaded to GitHub:
   ```
   # Dependencies
   node_modules/
   
   # Environment variables
   .env
   
   # Logs
   *.log
   debug-shipping.log
   
   # OS files
   .DS_Store
   Thumbs.db
   
   # IDE files
   .vscode/
   .idea/
   
   # Runtime files
   *.pid
   *.seed
   *.pid.lock
   ```

## 🔧 Step 4: Initialize Git Repository

Open terminal/command prompt in your project folder and run:

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: ActionFigure Vault with PayPal integration"

# Set main branch
git branch -M main
```

## 🐱 Step 5: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in top right corner → "New repository"
3. Repository settings:
   - Repository name: `actionfigure-vault`
   - Description: "ActionFigure Vault - PayPal integrated e-commerce site with shipping callbacks"
   - Set to Public (required for free deployment)
   - Don't initialize with README (we already have files)
4. Click "Create repository"

## 🔗 Step 6: Connect Local Repository to GitHub

Copy the commands from GitHub's "Quick setup" section and run in your terminal:

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/actionfigure-vault.git

# Push code to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## ☁️ Step 7: Deploy to Free Cloud Platform (Render)

### Why Render?
- Free tier available
- Easy GitHub integration
- Supports Node.js
- Provides HTTPS URLs (required for PayPal)

### Deploy Steps:

1. Go to [Render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your `actionfigure-vault` repository
5. Configure deployment:
   - **Name**: `actionfigure-vault`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

## 🔐 Step 8: Set Environment Variables on Render

1. In Render dashboard, go to your service
2. Click "Environment" tab
3. Add these variables:
   ```
   PAYPAL_CLIENT_ID = your_actual_paypal_client_id
   PAYPAL_CLIENT_SECRET = your_actual_paypal_client_secret
   PAYPAL_BASE_URL = https://api-m.sandbox.paypal.com
   NODE_ENV = production
   ```
4. Click "Save Changes"

## 🌐 Step 9: Get Your Public URL

1. After deployment completes, Render will provide a public URL like:
   `https://actionfigure-vault-abc123.onrender.com`
2. Save this URL - you'll need it for PayPal configuration

## 🔧 Step 10: Update PayPal Configuration

1. Open your deployed website
2. In browser developer tools, update the PayPal SDK URL in `index.html`:
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD&intent=capture"></script>
   ```
3. Make sure your client.js has the correct server URL:
   ```javascript
   SERVER_URL: 'https://your-app-name.onrender.com' // Your actual Render URL
   ```

## ✅ Step 11: Test PayPal Shipping Callbacks

1. Visit your deployed website
2. Add products to cart
3. Click PayPal checkout button
4. Enter shipping address during checkout
5. Check Render logs for shipping callback activity:
   - Go to Render dashboard → Your service → Logs tab
   - Look for shipping callback logs when you change address/shipping options

## 🐛 Step 12: Monitor and Debug

### View Logs:
- **Render**: Dashboard → Service → Logs tab
- **Local testing**: Your terminal where you run `node server.js`

### Common Issues:
- **"doesn't send to this location"**: Check shipping callback logs for address validation
- **No callbacks received**: Verify your public URL is accessible
- **Environment variables**: Ensure all PayPal credentials are set correctly

## 📝 Step 13: Making Updates

To update your deployed site:

```bash
# Make your changes to files
# Add and commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

Render will automatically redeploy when you push to GitHub.

## 🎯 Summary Checklist

- [ ] Project files organized in folder
- [ ] `.env` configured with PayPal credentials
- [ ] `.gitignore` created to protect sensitive files
- [ ] Git repository initialized and committed
- [ ] GitHub repository created and code pushed
- [ ] Render account created and service deployed
- [ ] Environment variables set on Render
- [ ] Public URL obtained and PayPal configured
- [ ] Shipping callbacks tested and working

## 🆘 Troubleshooting

### PayPal Callbacks Not Working:
1. Check Render logs during checkout
2. Verify your public URL is accessible
3. Ensure shipping callback endpoint returns proper JSON Patch format

### Deployment Issues:
1. Check Render build logs for errors
2. Verify `package.json` has correct dependencies
3. Ensure `NODE_ENV` is set correctly

### Local vs Production Differences:
- **Local**: `http://localhost:3000` (callbacks won't work)
- **Production**: `https://your-app.onrender.com` (callbacks work)

## 📞 Next Steps

Once deployed:
1. Test all PayPal checkout flows
2. Monitor shipping callback logs
3. Test different countries/addresses
4. Verify order completion and data storage

Your ActionFigure Vault is now live with working PayPal shipping callbacks! 🎉

---

## 📚 Additional Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [Render Documentation](https://render.com/docs)
- [GitHub Documentation](https://docs.github.com/)
- [Node.js Deployment Guide](https://nodejs.org/en/docs/guides/)