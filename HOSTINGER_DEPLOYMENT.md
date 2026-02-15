# 🚀 Hostinger Deployment Guide - JJ Art Academy Admin Panel

## 📦 What's Included in the `dist` folder

Your production build is ready in the `dist` folder with:
- ✅ Optimized JavaScript and CSS bundles
- ✅ `.htaccess` file for Apache (SPA routing + API proxy)
- ✅ All assets and images
- ✅ HTTP backend configuration (http://93.127.194.118:8095)

---

## 🌐 Hostinger Deployment Steps

### Step 1: Access Hostinger File Manager

1. Log in to your **Hostinger account** at https://hpanel.hostinger.com
2. Navigate to **Files** → **File Manager**
3. Or use **FTP/SFTP** client (FileZilla recommended)

### Step 2: Prepare Your Domain Directory

**Option A: Main Domain (example.com)**
- Navigate to `public_html/` folder

**Option B: Subdomain (admin.example.com)**  
1. Go to **Domains** → **Subdomains**
2. Create subdomain: `admin.example.com`
3. Navigate to the subdomain folder (usually `public_html/admin/`)

**Option C: Subfolder (example.com/admin)**
- Create folder: `public_html/admin/`

### Step 3: Upload Files

#### Using File Manager (Recommended for simplicity):

1. **Clear the target directory**
   - Delete any existing files in `public_html/` (or subdomain folder)
   - Keep `cgi-bin` folder if it exists

2. **Upload the dist folder contents**
   - Go to your local: `C:\Users\moham\Desktop\WebAr\JJ-ART-ADMIN-PANEL\ADMIN_PANEL_ART_ACADEMY\dist`
   - **Select ALL files inside `dist` folder** (including hidden `.htaccess`)
   - Upload to Hostinger's `public_html/` folder

3. **Verify .htaccess**
   - In File Manager, enable **Show Hidden Files** (⚙️ Settings)
   - Confirm `.htaccess` file is present

#### Using FileZilla (FTP):

1. **Connect to Hostinger**
   - Host: Your FTP hostname (find in Hostinger → FTP Accounts)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

2. **Upload**
   - Local site: Navigate to `dist` folder
   - Remote site: Navigate to `public_html/`
   - Select all files → Right-click → Upload
   - Ensure `.htaccess` transfers (enable "Show hidden files" in FileZilla settings)

### Step 4: Configure Environment Variables (If needed)

If you need to change Cloudinary settings:

1. In File Manager, create a new file: `config.js` in `public_html/`
2. Or edit the built files (not recommended)

> **Note:** Environment variables are baked into the build at compile time. To change them, rebuild locally with new `.env` values and re-upload.

### Step 5: Test Your Deployment

1. **Visit your domain**: http://yourdomain.com (or subdomain)
2. **Test these features**:
   - ✅ Homepage loads correctly
   - ✅ Navigation works (React Router)
   - ✅ API calls work (check Network tab in browser DevTools)
   - ✅ Image uploads work (Cloudinary)
   - ✅ Login/authentication functions

3. **Check API connectivity**:
   - Open browser DevTools (F12) → Network tab
   - Perform an action that calls the API
   - Verify requests go to: `http://93.127.194.118:8095/api/...`

---

## 🔧 Troubleshooting

### Issue 1: "404 Not Found" on page refresh

**Solution:** `.htaccess` not working
```bash
# Verify in Hostinger File Manager:
1. Check .htaccess exists in public_html/
2. Enable "Show Hidden Files" to see it
3. Ensure mod_rewrite is enabled (usually enabled by default on Hostinger)
```

### Issue 2: API calls fail / CORS errors

**Solution:** Backend not accessible
```bash
# Check:
1. Backend is running at http://93.127.194.118:8095
2. Backend has CORS enabled for your domain
3. Check browser console for specific errors
```

**Fix CORS on Backend:**
The backend needs to allow your domain:
```java
// Add to backend CORS configuration
@CrossOrigin(origins = {"http://yourdomain.com", "https://yourdomain.com"})
```

### Issue 3: Blank page / White screen

**Solution:** Check browser console
```bash
# Common causes:
1. Missing environment variables (rebuild needed)
2. JavaScript errors (check Console tab)
3. Incorrect base path (check vite.config.js base setting)
```

### Issue 4: Images not loading

**Solution:** Check Cloudinary configuration
- Verify `VITE_CLOUDINARY_CLOUD_NAME` is correct
- Verify `VITE_CLOUDINARY_UPLOAD_PRESET` is correct
- Rebuild if these changed

---

## 🔄 Updating Your Deployment

When you make code changes:

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Upload new dist**:
   - Delete old files in `public_html/`
   - Upload new `dist` folder contents
   - **Don't forget `.htaccess`**

3. **Clear browser cache**:
   - Press `Ctrl + Shift + R` (hard refresh)
   - Or clear cache in browser settings

---

## 🔒 Security Recommendations

### 1. Enable HTTPS (Free SSL on Hostinger)

1. Go to Hostinger → **SSL** → **Install SSL**
2. Update backend to allow HTTPS:
   ```java
   @CrossOrigin(origins = {"https://yourdomain.com"})
   ```

### 2. Update .htaccess for HTTPS redirect

Add to top of `.htaccess`:
```apache
# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 3. Protect .env files (Already handled)

The `.env` file is not in the `dist` folder, so it's safe.

---

## 📊 Performance Optimization

Already included in your build:
- ✅ Gzip compression (.htaccess)
- ✅ Asset caching (1 year for images, 1 month for JS/CSS)
- ✅ Minified JS/CSS bundles
- ✅ Code splitting

---

## 🆘 Quick Support Checklist

Before asking for help, verify:
- [ ] All files from `dist` folder uploaded
- [ ] `.htaccess` file present and visible
- [ ] Domain/subdomain configured correctly
- [ ] Backend API is running and accessible
- [ ] Browser console shows no errors (F12)
- [ ] Hard refresh attempted (Ctrl + Shift + R)

---

## 📁 File Structure on Hostinger

```
public_html/                    ← Your domain root
├── .htaccess                   ← Apache configuration (MUST be present)
├── index.html                  ← Main HTML file
├── assets/                     ← Built JS, CSS, images
│   ├── index-xxxxx.js         ← Main JavaScript bundle
│   ├── index-xxxxx.css        ← Main CSS bundle
│   └── ...                    ← Other assets
└── favicon.ico                ← (if you have one)
```

---

## ✅ Deployment Checklist

- [ ] Built project with `npm run build`
- [ ] Copied `.htaccess` to `dist` folder
- [ ] Uploaded all files from `dist` to `public_html/`
- [ ] Verified `.htaccess` is present on server
- [ ] Tested domain in browser
- [ ] Checked API calls work
- [ ] Tested navigation and routing
- [ ] Tested authentication/login
- [ ] Enabled HTTPS (recommended)
- [ ] Cleared browser cache

---

## 🎯 Next Steps

1. **Set up automatic deployments** (optional):
   - Use GitHub Actions to auto-deploy on push
   - Or use FTP deployment scripts

2. **Monitor your site**:
   - Set up Google Analytics
   - Monitor error logs in Hostinger

3. **Backup regularly**:
   - Download your `public_html` folder monthly
   - Keep local `dist` folder backups

---

**Need Help?** 
- Hostinger Support: Available 24/7 via chat
- Check browser Console (F12) for specific errors
- Verify backend is accessible: http://93.127.194.118:8095/api/

**Your admin panel is now ready to deploy! 🎉**
