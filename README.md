# 📝 Topicology - Modern Blog Platform

<div align="center">

![Topicology Banner](https://img.shields.io/badge/Topicology-Blog%20Platform-blue?style=for-the-badge&logo=blogger&logoColor=white)

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**A full-stack blog platform where users can share their stories, follow authors, and engage with content.**

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About The Project

**Topicology** is a modern, full-featured blog platform built with the MERN stack. It provides a Medium-like experience where users can write, share, and discover stories on various topics. The platform features a clean, responsive design with dark mode support, rich text editing, and social features like following authors and bookmarking posts.

### Why Topicology?

- 🚀 **Modern Stack** - Built with the latest versions of React 19, Express 5, and MongoDB
- 🎨 **Beautiful UI** - Clean, responsive design with dark/light mode
- ✍️ **Rich Text Editor** - TipTap-powered editor with formatting tools
- 🔐 **Secure Auth** - JWT-based authentication with Google OAuth support
- 📱 **Mobile Friendly** - Fully responsive design for all devices

---

## ✨ Features

### 🔐 Authentication & Authorization
- Email/Password authentication with JWT
- Google OAuth 2.0 integration
- Password reset via email
- Protected routes & role-based access

### 📝 Blog Management
- Create, edit, and delete blog posts
- Rich text editor with formatting options
- Feature image upload (Cloudinary)
- Public/Private visibility settings
- URL slug customization
- Category organization

### 💬 Social Features
- Like/Unlike blog posts
- Comment system with real-time updates
- Bookmark posts for later reading
- Follow/Unfollow authors
- View reading statistics

### 🎨 User Experience
- 🌙 Dark/Light mode toggle
- 📱 Fully responsive design
- ⚡ Fast page loads
- 🔍 Search functionality
- 📊 User profile with stats

---

## 🛠 Tech Stack

### Frontend
| Technology | Description |
|------------|-------------|
| **React 19** | UI library with hooks |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **React Router 7** | Client-side routing |
| **TipTap** | Rich text editor |
| **Axios** | HTTP client |
| **React Icons** | Icon library |

### Backend
| Technology | Description |
|------------|-------------|
| **Node.js** | JavaScript runtime |
| **Express.js 5** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose 9** | MongoDB ODM |
| **Passport.js** | Authentication middleware |
| **JWT** | Token-based auth |
| **Cloudinary** | Image hosting |
| **Nodemailer** | Email service |
| **Joi** | Input validation |

### DevOps
| Technology | Description |
|------------|-------------|
| **Docker** | Containerization |
| **Nginx** | Reverse proxy |

---

## 📸 Screenshots

<div align="center">

### Home Page
> *Screenshot of the home page with blog feed*

### Blog Editor
> *Screenshot of the TipTap rich text editor*

### Profile Page
> *Screenshot of user profile with stats*

### Dark Mode
> *Screenshot showcasing dark mode*

</div>

> 📌 **Note:** Add your screenshots to the `screenshots/` folder and update the paths above.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/blog-website.git
   cd blog-website
   ```

2. **Install Backend Dependencies**
   ```bash
   cd blog-backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../blog-frontend
   npm install
   ```

4. **Set up environment variables** (see below)

5. **Start the Backend Server**
   ```bash
   cd blog-backend
   npm run dev
   ```

6. **Start the Frontend Development Server**
   ```bash
   cd blog-frontend
   npm run dev
   ```

7. **Open your browser**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`

### Environment Variables

#### Backend (`blog-backend/.env`)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_URL=mongodb://localhost:27017/blog-website

# JWT
ACCESS_TOKEN_SECRET=your_jwt_secret_key
ACCESS_TOKEN_EXPIRY=7d

# Session
SESSION_SECRET=your_session_secret

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Email (SMTP)
SMTP_SERVICE=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

#### Frontend (`blog-frontend/.env`)
```env
VITE_API_URL=http://localhost:3000
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/sign-up` | Register new user |
| `POST` | `/api/v1/auth/login` | User login |
| `GET` | `/api/v1/auth/log-out` | User logout |
| `GET` | `/api/v1/auth/me` | Get current user |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset |
| `PATCH` | `/api/v1/auth/reset-password/:token` | Reset password |
| `PATCH` | `/api/v1/auth/update-password` | Update password |
| `GET` | `/api/v1/auth/google` | Google OAuth |

### Blogs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/blogs` | Get all public blogs |
| `GET` | `/api/v1/blogs/slug/:slug` | Get blog by slug |
| `GET` | `/api/v1/blogs/user-blogs` | Get user's blogs |
| `POST` | `/api/v1/blogs/create` | Create new blog |
| `PATCH` | `/api/v1/blogs/:blogId` | Update blog |
| `DELETE` | `/api/v1/blogs/:blogId` | Delete blog |

### Interactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/blogs/:blogId/like` | Like/Unlike blog |
| `GET` | `/api/v1/blogs/:blogId/like-status` | Check like status |
| `POST` | `/api/v1/blogs/:blogId/comments` | Add comment |
| `GET` | `/api/v1/blogs/:blogId/comments` | Get comments |
| `DELETE` | `/api/v1/blogs/comments/:commentId` | Delete comment |
| `POST` | `/api/v1/blogs/:blogId/bookmark` | Bookmark blog |
| `GET` | `/api/v1/blogs/bookMarked` | Get bookmarked blogs |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/blogs/categories` | Get all categories |
| `GET` | `/api/v1/blogs/categories/:slug` | Get blogs by category |
| `POST` | `/api/v1/blogs/category` | Create category |

### Connections
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/connections/follow` | Follow user |
| `POST` | `/api/v1/connections/unfollow` | Unfollow user |
| `GET` | `/api/v1/connections/followed-users` | Get followed users |
| `POST` | `/api/v1/connections/check-follow` | Check follow status |

---

## 📁 Project Structure

```
blog-website/
├── blog-backend/
│   ├── src/
│   │   ├── config/          # Passport configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── db/              # Database connection
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # External services
│   │   ├── utils/           # Utility functions
│   │   ├── app.js           # Express app
│   │   └── server.js        # Server entry point
│   ├── uploads/             # Temporary uploads
│   ├── Dockerfile
│   └── package.json
│
├── blog-frontend/
│   ├── src/
│   │   ├── api/             # API service functions
│   │   ├── assets/          # Static assets
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── routes/          # Route protection
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Root component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── README.md
```

---

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build backend
cd blog-backend
docker build -t blog-backend .

# Build frontend
cd ../blog-frontend
docker build -t blog-frontend .

# Run containers
docker run -d -p 3000:3000 --env-file .env blog-backend
docker run -d -p 80:80 blog-frontend
```

---

## 🤝 Contributing

Contributions are what make the open source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Your Name** - [@yourtwitter](https://twitter.com/yourtwitter) - your.email@example.com

Project Link: [https://github.com/yourusername/blog-website](https://github.com/yourusername/blog-website)

---

## 🙏 Acknowledgments

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TipTap Editor](https://tiptap.dev)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)
- [Passport.js](http://www.passportjs.org)

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

Made with ❤️ and JavaScript

</div>
