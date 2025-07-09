https://shopee-1.netlify.app/



---

## 🌐 Cloud-Only Setup

> **You do NOT need to run anything locally!**  
> All services are deployed and run in the cloud.

### 1. **Frontend (Netlify)**
- Deploys automatically from GitHub.
- Uses the Render backend API via the environment variable:  
  `REACT_APP_API_URL=https://shopee-o2b3.onrender.com`
- All product images use Cloudinary URLs.

### 2. **Backend (Render)**
- Deployed from GitHub.
- Connects to MongoDB Atlas and Cloudinary using environment variables.
- Always use `process.env.PORT` for the server port.

### 3. **Database (MongoDB Atlas)**
- Cloud-hosted, always online.
- No local database needed.

---

## ⚙️ Environment Variables

### **Frontend (Netlify)**
Set these in Netlify dashboard → Site settings → Environment variables:


### **Backend (Render)**
Set these in Render dashboard → Environment:



---

## 🛠️ How to Deploy

### **Frontend**
- Push changes to GitHub.
- Netlify auto-deploys from the main branch.
- To force a fresh build:  
  Go to Netlify → Deploys → "Clear cache and deploy site".

### **Backend**
- Push changes to GitHub.
- Render auto-deploys from the main branch.
- Check Render logs for errors after each deploy.

---

## 🧑‍💻 Local Development (Optional)

> **Not required for production!**  
> But you can run locally for testing:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## 🐞 Troubleshooting

- **502 Bad Gateway on frontend:**  
  Backend is down or sleeping (free Render plan). Wait a few seconds and refresh, or upgrade to a paid plan for 24/7 uptime.

- **Images not showing:**  
  Make sure all product image URLs are Cloudinary URLs.  
  All frontend pages should import and use the shared `getImageUrl` from `src/utils/api.js`.

- **"Failed to load products":**  
  Backend is unreachable, or database is empty.  
  Check Render logs and MongoDB Atlas.

- **Frontend only works when your computer is on:**  
  Your frontend is still using a local API URL.  
  Set `REACT_APP_API_URL` to your Render backend URL in Netlify.

---

## 📝 Notes

- **Free Render services sleep after inactivity.** Upgrade for always-on.
- **Never use `localhost` or your local IP in production.**
- **All environment variables must be set in the cloud dashboards.**
- **Check logs on Netlify and Render after every deploy.**

---

## 🙋‍♂️ Need Help?

If you get stuck, check:
- Netlify Deploy logs
- Render Service logs
- MongoDB Atlas dashboard

Or open an issue in this repo!

---

## 📦 Credits

- Built by [Madhujya phukan]
- Inspired by Shopee

---


