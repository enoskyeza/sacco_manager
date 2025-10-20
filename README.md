# Tamiti SACCO Manager - Frontend

Modern SACCO management system built with React, TypeScript, and Vite.

## 🚀 Phase 1: Foundation & Authentication

### Features Implemented
- ✅ User authentication (JWT with cookie-based refresh tokens)
- ✅ Protected routes
- ✅ Dashboard layout with sidebar and navbar
- ✅ Responsive design with Tailwind CSS
- ✅ Seamless integration with Django backend

---

## 🔧 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Tailwind CSS** - Utility-first styling

---

## 🏗️ Project Structure

```
src/
├── api/                  # API clients
│   ├── client.ts         # Axios instance with interceptors
│   └── auth.ts           # Authentication API
├── components/           # Reusable components
│   ├── layout/           # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navbar.tsx
│   └── common/           # Common UI components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state
├── pages/                # Page components
│   ├── auth/
│   │   └── Login.tsx
│   └── dashboard/
│       └── Dashboard.tsx
├── routes/               # Routing logic
│   └── ProtectedRoute.tsx
├── types/                # TypeScript types
│   └── index.ts
└── utils/                # Utility functions
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v21.x)
- Django backend running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔐 Authentication Flow

1. **Login**: User enters username & password
2. **Backend**: Django validates and returns:
   - `access` token (15 min lifetime)
   - `user` object
   - Sets `refresh_token` httpOnly cookie
3. **Frontend**: Stores access token in localStorage
4. **API Requests**: Axios adds `Authorization: Bearer <token>` header
5. **Token Refresh**: On 401, automatically calls `/api/auth/token/refresh/`
6. **Logout**: Clears tokens and cookies

---

## 🔑 Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 📝 Test Credentials

Use the Django users you've created:
- Username: [your username]
- Password: [your password]

---

## 🎯 Next Steps (Phase 2)

- [ ] Implement SACCO context (multi-tenancy)
- [ ] Build Members module (CRUD)
- [ ] Add React Query for data fetching
- [ ] Implement search and filters
- [ ] Add loading states and error handling
- [ ] Build Transactions module

---

## 🐛 Troubleshooting

### CORS Issues
Make sure Django `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`:

```python
# Django settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
CORS_ALLOW_CREDENTIALS = True
```

### 401 Errors
- Check if Django backend is running
- Verify access token is being sent in headers
- Check refresh token cookie is present

### Styling not working
```bash
# Reinstall Tailwind
npm install -D tailwindcss postcss autoprefixer
```

---

## 📦 Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the color scheme.

### Logo
Replace the logo in the sidebar by editing `Sidebar.tsx`.

---

**Built with ❤️ by Tamiti Studio**
