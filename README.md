# APUDSI News CMS

A content management system for news articles with RBAC (Role-Based Access Control).

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- MySQL database (or Aiven MySQL service)

### Initial Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your database credentials and other configuration options

4. Run the database setup script:
   ```bash
   npm run setup
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Access the application at http://localhost:3000

### Default Admin Login

After running the setup, you can login with:
- Email: admin@gmail.com
- Password: 12345678

## Features

- User authentication and role-based access control
- Article management (create, read, update, delete)
- Rich text editor for article content
- Image upload for article thumbnails
- Public API for accessing published news

## API Documentation

The API documentation is available at `/api/public/docs` once the application is running.

## License

This project is open source and available under the [MIT license](LICENSE).
