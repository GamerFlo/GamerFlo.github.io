# Simple JS Backend Server

A lightweight Node.js backend server for storing and managing data (JSON or text) with RESTful API endpoints.

## Features

- **Data Storage**: Store JSON objects or plain text data
- **RESTful API**: Full CRUD operations (Create, Read, Update, Delete)
- **In-Memory Storage**: Fast data access (data persists only during server runtime)
- **JSON & Text Support**: Handles both JSON objects and plain text strings
- **Error Handling**: Comprehensive error responses with meaningful messages
- **Lightweight**: Minimal dependencies, easy to deploy

## Quick Start

### Prerequisites

- Node.js (version 12 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GamerFlo/GamerFlo.github.io.git
cd GamerFlo.github.io
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will start on port 3000 by default. Visit `http://localhost:3000` to see the API information.

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information and available endpoints |
| POST | `/data` | Store new data (JSON or text) |
| GET | `/data` | Retrieve all stored data |
| GET | `/data/:id` | Retrieve specific data by ID |
| PUT | `/data/:id` | Update existing data |
| DELETE | `/data/:id` | Delete specific data |

## Usage Examples

### 1. Store JSON Data
```bash
curl -X POST http://localhost:3000/data \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "age": 30, "city": "New York"}'
```

### 2. Store Text Data
```bash
curl -X POST http://localhost:3000/data \
  -H "Content-Type: text/plain" \
  -d "Hello, this is a simple text message!"
```

### 3. Get All Data
```bash
curl http://localhost:3000/data
```

### 4. Get Specific Data by ID
```bash
curl http://localhost:3000/data/1
```

### 5. Update Data
```bash
curl -X PUT http://localhost:3000/data/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "age": 25, "city": "Los Angeles"}'
```

### 6. Delete Data
```bash
curl -X DELETE http://localhost:3000/data/1
```

## Response Format

All responses follow a consistent JSON format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* actual data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Data Structure

Each stored item has the following structure:

```json
{
  "id": 1,
  "data": "your-actual-data",
  "type": "json|text",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "lastModified": "2024-01-01T12:30:00.000Z"
}
```

## Environment Variables

- `PORT`: Server port (default: 3000)

Example:
```bash
PORT=8080 npm start
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Project Structure
```
├── server.js          # Main server file
├── package.json       # Project configuration
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Limitations

- **In-Memory Storage**: Data is lost when the server restarts
- **No Authentication**: All endpoints are publicly accessible
- **No Persistence**: For persistent storage, consider adding a database
- **Single Instance**: Data is not shared between multiple server instances

## Future Enhancements

- Add persistent storage (file-based or database)
- Implement authentication and authorization
- Add data validation and schemas
- Include rate limiting
- Add logging capabilities
- Support for file uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

ISC License - see the LICENSE file for details.

## Support

For issues and questions, please create an issue in the GitHub repository.