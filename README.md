# Light Novel Reader Website

A web application for reading and managing light novels with user accounts and admin features.

## Current Features
- User registration and login
- Novel browsing and reading
- Bookmarking system
- Reading history
- Admin panel for content management
- Dark/light theme
- Search functionality
- Responsive design

## How to Deploy

### Quick Deployment (Static Hosting)
You can deploy this site quickly using static hosting services:

1. **GitHub Pages**:
   - Create a GitHub repository
   - Push this code to the repository
   - Enable GitHub Pages in repository settings
   - Your site will be available at `https://[username].github.io/[repository-name]`

2. **Netlify**:
   - Create a Netlify account
   - Drag and drop this folder to Netlify
   - Your site will be deployed with a random URL
   - You can set up a custom domain in settings

3. **Vercel**:
   - Create a Vercel account
   - Import your GitHub repository
   - Your site will be automatically deployed

### Production Deployment Recommendations

The current version uses localStorage for data storage, which means:
- Data is stored in the user's browser
- Data isn't shared between users
- Admin content is only available locally

For a production environment, you should:

1. **Set up a Backend Server**:
   - Create an API server using Node.js/Express or similar
   - Replace localStorage calls with API requests
   - Add proper user authentication
   - Use a real database (e.g., MongoDB, PostgreSQL)

2. **Database Setup**:
```javascript
// Example database schema
Novels {
    id: string
    title: string
    author: string
    description: string
    coverUrl: string
    status: string
    tags: string[]
    chapters: [
        {
            number: number
            title: string
            content: string
            dateAdded: date
        }
    ]
    lastUpdated: date
}

Users {
    id: string
    username: string
    email: string
    passwordHash: string
    isAdmin: boolean
    bookmarks: [
        {
            novelId: string
            chapterNumber: number
            timestamp: date
        }
    ]
    readingHistory: [
        {
            novelId: string
            chapterNumber: number
            timestamp: date
        }
    ]
}
```

3. **Security Considerations**:
   - Implement proper authentication (JWT/sessions)
   - Add HTTPS
   - Sanitize user input
   - Implement rate limiting
   - Add CSRF protection

4. **File Storage**:
   - Set up cloud storage (e.g., AWS S3) for novel covers
   - Implement proper file upload handling

5. **Environment Setup**:
```bash
# Example .env file
DATABASE_URL=mongodb://...
JWT_SECRET=your-secret-key
S3_BUCKET=your-bucket
AWS_ACCESS_KEY=your-key
AWS_SECRET_KEY=your-secret
```

### Immediate Steps to Share

For now, you can share this site by:

1. ZIP the entire project
2. Upload to a static hosting service
3. Share the URL with others

Note: Since it uses localStorage:
- Each user will have their own local data
- Admins will need to add novels on their own instance
- Data won't sync between users

To make it fully functional for multiple users:
1. Create a backend API
2. Update the JavaScript files to use the API instead of localStorage
3. Deploy both frontend and backend
4. Set up a domain name

### Example Backend API Routes

```javascript
// Novel routes
GET    /api/novels             // Get all novels
GET    /api/novels/:id         // Get single novel
POST   /api/novels             // Create novel (admin)
PUT    /api/novels/:id         // Update novel (admin)
DELETE /api/novels/:id         // Delete novel (admin)

// Chapter routes
GET    /api/novels/:id/chapters      // Get all chapters
POST   /api/novels/:id/chapters      // Add chapter (admin)
PUT    /api/novels/:id/chapters/:num // Update chapter (admin)
DELETE /api/novels/:id/chapters/:num // Delete chapter (admin)

// User routes
POST   /api/auth/register      // Register new user
POST   /api/auth/login         // Login user
GET    /api/user/bookmarks     // Get user bookmarks
POST   /api/user/bookmarks     // Add bookmark
DELETE /api/user/bookmarks/:id // Remove bookmark
GET    /api/user/history       // Get reading history
```

## Development

To work on this project locally:

1. Clone the repository
2. Open the project folder
3. Use a local server (e.g., Live Server VS Code extension)
4. Open index.html in your browser

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
