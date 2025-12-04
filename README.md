# 🍽️ FoodieCircle – Local Food Lovers Network

A full-stack MERN application where users explore local foods, share reviews, and interact with a community of food enthusiasts.  
This project is created for **Assignment B12-A10_category-0007**, following all required rules and features.

---

## 🌐 Live Links

**🔗 Client (Firebase Hosting):**  
https://foodie-circle.web.app

**🔗 Server (Vercel Hosting):**  
https://local-food-lovers-server-six.vercel.app

**🔗 Client (Github):**  
https://github.com/ahzahid81/local-food-lovers-client

**🔗 Server (Github):**  
https://github.com/ahzahid81/local-food-lovers-server

---

## ✨ Website Features

- Dynamic homepage with Hero Slider and 6 Featured Top-Rated Reviews.
- Firebase Authentication (Email/Password + Google Login).
- Add Review, Edit Review, Delete Review (Protected Routes).
- View all community reviews on the All Reviews page.
- Search reviews by food name (MongoDB `$regex` search).
- “My Reviews” page shows reviews submitted by logged-in user.
- Favorites System (Challenge requirement completed).
- Fully responsive design using Tailwind CSS + DaisyUI.
- Persistent authentication — user stays logged in on refresh.
- Custom 404 Error Page.
- Clean, modern UI design built for best user experience.

---

## 🛠️ Technologies Used

### **Client**
- React  
- React Router  
- Tailwind CSS  
- DaisyUI  
- Firebase Authentication  
- React Hook Form  
- TanStack React Query  

### **Server**
- Node.js  
- Express.js  
- MongoDB Atlas  
- Vercel Serverless Hosting  
- Firebase 

---

## 📦 Core Functionalities

### ✔ Authentication
- Register with: Name, Email, Password, Confirm Password, Photo URL  
- Password validation (uppercase + lowercase + minimum 6 chars)  
- Login via Email/Password  
- Google Login  
- User stays logged in after page reload  

### ✔ Review System (CRUD)
- Add Review (Protected)
- Edit Review (Protected)
- Delete Review (Protected)
- View Review Details
- All Reviews page (Public)
- Sorted by latest date

### ✔ Favorites System (Challenge)
- Add review to Favorites  
- My Favorites page  
- Prevent duplicate favorites  
- Delete favorite item (optional but included)

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|--------|-------------|
| GET | `/` | API status check |
| GET | `/reviews` | Get all reviews |
| GET | `/reviews/top` | Get top-rated 6 reviews |
| GET | `/reviews/:id` | Get review by ID |
| POST | `/reviews` | Add new review |
| PUT | `/reviews/:id` | Update review |
| DELETE | `/reviews/:id` | Delete review |
| GET | `/my-reviews?email=` | Get user’s own reviews |
| POST | `/favorites` | Add to favorites |
| GET | `/favorites?email=` | Get user's favorites |
| DELETE | `/favorites/:id` | Remove favorite |