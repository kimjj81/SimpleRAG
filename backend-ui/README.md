# SimpleRAG Backend UI

A comprehensive backoffice administration interface for the SimpleRAG application built with Next.js.

## Features

### 🏠 Dashboard
- **System Overview**: Real-time statistics showing total users, files, chat sessions, and messages
- **Recent Activity**: Quick view of recently uploaded files and chat sessions
- **Visual Statistics**: Clean cards displaying key metrics

### 👥 User Management
- **User Listing**: Complete user directory with search functionality
- **User Details**: View user information including permissions, status, and activity
- **User Statistics**: Active/inactive users, staff members, and registration dates
- **Advanced Filtering**: Search by username, email, or name

### 📁 File Management
- **File Upload**: Drag-and-drop file upload with support for multiple formats (TXT, PDF, DOC, DOCX, MD)
- **File Listing**: Comprehensive file browser with search and filtering
- **File Actions**: Download, view, and delete files
- **File Information**: File size, upload date, and metadata

### 💬 Chat Session Management
- **Session Overview**: View all chat sessions with user information
- **Session Statistics**: Message counts, active users, and session analytics
- **Message Viewer**: Detailed view of conversation history within sessions
- **Session Actions**: Delete sessions and view associated messages

### 📨 Chat Message Management
- **Message Browser**: View all messages across all sessions
- **Advanced Filtering**: Filter by role (user/assistant), search content, or session
- **Token Analytics**: View input/output token usage for cost tracking
- **Message Details**: Full message content with metadata

## Technology Stack

- **Frontend**: Next.js 14 with React 18
- **Styling**: Custom CSS with modern design system
- **Icons**: Lucide React for consistent iconography
- **Notifications**: React Hot Toast for user feedback
- **Date Handling**: date-fns for date formatting and manipulation

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Running Django backend with API endpoints

### Installation

1. Navigate to the backend-ui directory:
```bash
cd backend-ui
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Configuration

Create a `.env.local` file in the backend-ui directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## API Integration

The application integrates with the Django backend through REST API endpoints:

- `GET /api/users/` - List all users
- `GET /api/files/` - List all files
- `POST /api/files/upload/` - Upload new files
- `DELETE /api/files/{id}/` - Delete files
- `GET /api/chat-sessions/` - List chat sessions
- `DELETE /api/chat-sessions/{id}/` - Delete sessions
- `GET /api/chat-messages/` - List chat messages
- `GET /api/chat-messages/?session={id}` - Filter messages by session
- `DELETE /api/chat-messages/{id}/` - Delete messages

## Features in Detail

### Dashboard Analytics
- Real-time system statistics
- Recent activity monitoring
- Quick navigation to management sections

### Advanced Search & Filtering
- Global search across all data types
- Role-based filtering for messages
- User status filtering
- Date-based sorting

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for different screen sizes
- Touch-friendly interactions

### User Experience
- Loading states and error handling
- Toast notifications for actions
- Confirmation dialogs for destructive actions
- Intuitive navigation with active states

## File Structure

```
backend-ui/
├── components/
│   └── Layout.js          # Main layout with sidebar navigation
├── pages/
│   ├── _app.js           # Next.js app wrapper
│   ├── index.js          # Dashboard page
│   ├── users.js          # User management
│   ├── files.js          # File management
│   ├── chat-sessions.js  # Chat session management
│   └── chat-messages.js  # Chat message management
├── styles/
│   └── globals.css       # Global styles and design system
├── utils/
│   ├── api.js           # API client and utilities
│   └── helpers.js       # Helper functions for formatting
└── package.json         # Dependencies and scripts
```

## Customization

### Styling
The application uses a custom CSS design system. Key variables can be modified in `styles/globals.css`:

- Color scheme
- Typography
- Spacing and layout
- Component styles

### API Configuration
Update the API client in `utils/api.js` to modify:

- Base URL configuration
- Request/response handling
- Error handling
- Authentication (if needed)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new pages in the `pages/` directory
2. Add navigation items to `components/Layout.js`
3. Implement API calls in `utils/api.js`
4. Add styling in `styles/globals.css`

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

3. Configure environment variables for production API endpoints

## Contributing

1. Follow the existing code structure and naming conventions
2. Add proper error handling and loading states
3. Include responsive design considerations
4. Test all CRUD operations
5. Update documentation for new features

## Support

For issues and questions:
1. Check the Django backend API endpoints are running
2. Verify environment configuration
3. Check browser console for errors
4. Ensure proper CORS configuration on the backend