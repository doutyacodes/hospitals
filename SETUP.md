# Hospital Management System - Setup Guide

## 🏥 Project Overview
Modern hospital management system built with Next.js 15, featuring secure authentication, responsive design, and beautiful animations using Framer Motion.

## 🚀 Features
- **Secure Authentication**: JWT-based authentication with HTTP-only cookies
- **Modern UI/UX**: Blue and white theme with subtle animations
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Hospital Management**: Complete system for hospital administration
- **Database Integration**: Drizzle ORM with MySQL

## 📋 Prerequisites
- Node.js 18+ 
- MySQL database
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
1. Create a MySQL database named `healthcare_db`
2. Update the `.env.local` file with your database credentials:
```
DATABASE_URL="mysql://username:password@localhost:3306/healthcare_db"
```

### 3. Run Database Migrations
```bash
npx drizzle-kit push
```

### 4. Start Development Server
```bash
npm run dev
```

## 🔐 Authentication System

### Login Page (`/login`)
- Secure email/password authentication
- Modern responsive design with animations
- Remember me functionality
- Forgot password link (placeholder)

### Signup Page (`/signup`)
- Multi-step registration process:
  1. **Personal Information**: Name, email, phone
  2. **Security**: Password creation and confirmation
  3. **Hospital Details**: Complete hospital information
- Form validation and error handling
- Responsive 3-step wizard interface

### Dashboard Page (`/dashboard`)
- Protected route requiring authentication
- Hospital statistics and analytics
- Quick action buttons
- Recent activity feed
- Hospital status overview
- Modern responsive design

## 🛡️ Security Features
- **Middleware Protection**: Automatic route protection
- **JWT Authentication**: Secure token-based auth
- **HTTP-only Cookies**: XSS protection
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Server-side validation
- **CSRF Protection**: SameSite cookie policy

## 📱 Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Perfect tablet experience
- **Desktop Layout**: Full desktop functionality
- **Breakpoints**: sm, md, lg, xl, 2xl support
- **Touch Friendly**: Optimized for touch interactions

## 🎨 Theme & Styling
- **Color Scheme**: Blue and white professional theme
- **Typography**: Modern font hierarchy
- **Animations**: Framer Motion subtle animations
- **Components**: Reusable, accessible components
- **Icons**: SVG icons with hover states

## 📁 Project Structure
```
app/
├── (auth)/                 # Authentication pages
│   ├── login/             # Login page
│   ├── signup/            # Registration page
│   └── layout.jsx         # Auth layout
├── (innerpages)/          # Protected pages
│   ├── dashboard/         # Main dashboard
│   └── layout.jsx         # Inner pages layout
├── api/                   # API routes
│   └── auth/             # Authentication endpoints
│       ├── login/        # Login API
│       ├── signup/       # Registration API
│       ├── logout/       # Logout API
│       └── me/           # Current user API
├── globals.css           # Global styles
├── layout.js            # Root layout
└── page.js              # Home page (redirects to login)

lib/
├── db/
│   ├── index.js         # Database connection
│   └── schema.js        # Database schema
└── auth.js              # Authentication utilities

middleware.js            # Route protection middleware
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

## 🚀 Deployment Notes
1. Set up production database
2. Update environment variables
3. Configure secure cookies for production
4. Set up SSL/HTTPS
5. Configure CORS if needed

## 🔍 Testing
- Test responsive design on different screen sizes
- Verify authentication flow
- Check middleware protection
- Validate form submissions
- Test error handling

## 🏥 Hospital Admin Features
- Hospital registration and approval system
- Doctor management (planned)
- Appointment scheduling (planned)
- Patient management (planned)
- Revenue tracking (planned)
- Settings and configuration (planned)

## 🌟 Future Enhancements
- Email verification
- Password reset functionality
- Two-factor authentication
- Advanced analytics
- Mobile app support
- Integration with external systems

## 📞 Support
For technical support or questions, please refer to the project documentation or contact the development team.

---

**Built with ❤️ using Next.js 15, Drizzle ORM, and Framer Motion**