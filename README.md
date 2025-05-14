# HomeCook Delivery Platform Backend

This is the backend for an on-demand home cook food delivery platform built with the MERN stack (MongoDB, Express, React, Node.js).

## Project Structure

```
├── config              # Database configuration
├── controllers         # Request handlers
├── middleware          # Custom middleware
├── models              # Mongoose models
├── routes              # API routes
├── utils               # Utility functions
├── .env.example        # Example environment variables
├── server.js           # Main application file
└── package.json        # Project dependencies
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the server: `npm run dev`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user/chef
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - User logout

### Chefs
- `GET /api/chefs` - Get all chefs
- `GET /api/chefs/nearby` - Get nearby chefs (based on location)
- `GET /api/chefs/:id` - Get a specific chef
- `PUT /api/chefs/:id` - Update chef profile
- `GET /api/chefs/:id/menus` - Get menus from a specific chef

### Menus
- `GET /api/menus` - Get all menu items
- `POST /api/menus` - Create a new menu item (chef only)
- `GET /api/menus/:id` - Get a specific menu item
- `PUT /api/menus/:id` - Update a menu item (chef only)
- `DELETE /api/menus/:id` - Delete a menu item (chef only)

### Orders
- `GET /api/orders` - Get all orders (filtered by user role)
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get a specific order
- `PUT /api/orders/:id/status` - Update order status (chef or admin only)
- `PUT /api/orders/:id/review` - Add review to an order (user only)

## Technologies Used

- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- GeoJSON for location-based services