# 📚 Library ID Card Management System

A **modern web application** for managing student ID cards in a library setting, featuring **3D visualization**, **QR code scanning**, and **real-time updates**.

## 🚀 Features

- 🎴 **3D ID Card Gallery** with interactive viewing
- 📷 **QR Code scanning** for quick student lookup
- 📂 **CSV bulk import** support
- 🎨 **Custom card layout** editor
- ☁️ **Local Cloud synchronization**
- 📱 **Responsive design** for mobile and desktop
- 🔍 **AR QR scanner** integration


## 🛠️ Technology Stack

| Layer        | Technologies |
|--------------|--------------|
| **Frontend** | React (TypeScript), Vite, Tailwind CSS, shadcn/ui |
| **Backend**  | Express.js, Zod, REST APIs |
| **State Mgmt** | TanStack Query | 
| **File Storage** | Local & Cloud Sync |

## 🧠 Architecture & Design

### 🖥️ Frontend
- **Component-Based UI** for reusability
- **TypeScript** for type safety
- **Custom Hooks** to separate business logic
- **Responsive Layout** with Tailwind CSS
- **3D ID Cards** using Three.js + R3F

### 🧰 Backend
- **RESTful APIs** for CRUD operations
- **Shared Type Definitions** across frontend & backend
- **File Upload Support** with secure storage
- **Zod Validation** for API safety
- **Session-Based Authentication**


## 📁 Project Structure

```
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript definitions
├── server/                # Backend application
│   ├── routes.ts         # API routes
│   └── storage.ts        # Storage implementation
└── shared/               # Shared code
    └── schema.ts        # Database schema
```

## 💡 Key Features Explained

### 3D Card Gallery
- Interactive 3D viewing of ID cards
- Smooth animations and transitions
- Custom controls for rotation and zoom

### QR Code Integration
- Real-time scanning capability
- Quick student information lookup
- Mobile-friendly implementation

### Data Management
- Bulk import via CSV
- Custom card layout editor
- Real-time data synchronization

## 🔧 Configuration

The application can be configured through:
- `theme.json`: UI theme customization
- `.env`: Environment variables (create through Replit Secrets)
- `tailwind.config.ts`: Styling configuration

## 🤝 Contributing

1. Fork the project
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License
