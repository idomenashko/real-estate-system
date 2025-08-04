# מערכת נדל"ן - Real Estate System

מערכת חכמה לאיתור עסקאות נדל"ן מתחת לשווי השוק עבור סוכני נדל"ן.

## 🏗️ ארכיטקטורה

- **Frontend**: React.js
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Hosting**: Google Cloud Platform

## 🚀 התקנה והרצה

### דרישות מקדימות
- Node.js (v18+)
- MongoDB
- npm או yarn

### התקנה
```bash
# Clone הפרויקט
git clone [repository-url]
cd real-estate-system

# התקנת dependencies
npm install

# הגדרת משתני סביבה
cp .env.example .env
# ערוך את .env עם הפרטים שלך

# הרצת הפרויקט
npm run dev
```

## 📁 מבנה הפרויקט

```
real-estate-system/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # רכיבי React
│   │   ├── pages/         # דפי המערכת
│   │   ├── services/      # שירותי API
│   │   └── utils/         # פונקציות עזר
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── controllers/   # Controllers
│   │   ├── models/        # MongoDB Models
│   │   ├── routes/        # API Routes
│   │   ├── services/      # Business Logic
│   │   └── utils/         # פונקציות עזר
├── docs/                   # מסמכים
└── scripts/               # סקריפטים אוטומטיים
```

## 🔧 פיתוח

### כללי עבודה
1. **Git Flow**: תמיד עובדים על branch חדש
2. **Commits**: הודעות בעברית ברורות
3. **Testing**: בדיקות לכל פיצ'ר חדש
4. **Documentation**: תיעוד בעברית

### פקודות שימושיות
```bash
# יצירת branch חדש
git checkout -b feature/new-feature

# עדכון dependencies
npm update

# בדיקת קוד
npm run lint

# בנייה לפרודקשן
npm run build
```

## 📋 משימות נוכחיות

### שלב 1 - MVP
- [ ] הגדרת פרויקט React + Node.js
- [ ] מערכת אימות משתמשים
- [ ] מודלים בסיסיים למסד נתונים
- [ ] API בסיסי
- [ ] דף כניסה ודשבורד

## 🤝 תרומה לפרויקט

1. Fork הפרויקט
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. Commit השינויים (`git commit -m 'הוספת פיצ'ר מדהים'`)
4. Push ל-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

## 📞 תמיכה

לשאלות ותמיכה טכנית, פנה אל:
- Email: [your-email]
- WhatsApp: [your-phone]

## 📄 רישיון

פרויקט זה מוגן תחת רישיון MIT. 