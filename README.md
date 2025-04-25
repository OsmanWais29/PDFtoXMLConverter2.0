# PDF to XML Converter

A complete application designed for converting bankruptcy Form 31 documents to XML format compliant with the ISED (Innovation, Science and Economic Development) Canada e-filing system schema.

## Features

- Convert Form 31 bankruptcy PDFs to ISED-compliant XML format
- Validate generated XML against official schema
- Upload and process multiple PDF files simultaneously
- Download converted XML files
- Track conversion status
- Simple and intuitive web interface
- Comprehensive API for integration with other systems

## Quick Start

### Prerequisites

- Node.js 14.x or higher
- Java Runtime Environment (JRE) 11 or higher
- NPM or Yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/OsmanWais29/PDFtoXMLConverter2.0.git
   cd PDFtoXMLConverter2.0
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

### Using Docker

1. Build the Docker image:
   ```bash
   docker build -t pdftoxmlconverter .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:8080 pdftoxmlconverter
   ```

## Documentation

- [API Documentation](./docs/api/README.md)
- [User Guide](./docs/user-guide/README.md)
- [Development Guide](./docs/development/README.md)

## Project Structure

```
PDFtoXMLConverter/
├── src/
│   ├── api/
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Middleware components
│   │   └── controllers/       # API controllers
│   ├── services/              # Business logic services
│   ├── models/                # Data models
│   ├── utils/                 # Utility functions
│   ├── config/                # Configuration files
│   └── app.js                 # Main application entry point
├── test/                      # Test files
├── public/                    # Frontend files
├── uploads/                   # Temporary storage for uploaded PDFs
├── output/                    # Generated XML files
├── schema/                    # XML schema definitions
├── .github/                   # GitHub configurations
└── docs/                      # Documentation
```

## Development

### Running in Development Mode

```bash
npm run dev
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Contributing

Please read our [Contributing Guide](./docs/development/README.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- ISED Canada for providing the XML schema specifications
- Contributors to open-source libraries used in this project
