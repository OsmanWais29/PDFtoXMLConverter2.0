# Development Guide

This guide provides information for developers who want to contribute to the PDF to XML Converter project.

## Development Environment Setup

### Prerequisites

- Node.js 14.x or higher
- Java JDK 11 or higher (for running the Java PDF converter component)
- npm or yarn package manager
- Git

### Setting Up Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/OsmanWais29/PDFtoXMLConverter.git
   cd PDFtoXMLConverter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:8080 with hot reloading enabled.

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

## Key Components

### 1. PDF Parser

The PDF parser extracts data from Form 31 PDFs. It's implemented as a service in `src/services/pdfParser.js`. The primary functions are:

- `convertPDFtoXML`: Uses the Java converter to process PDFs
- `extractFormFields`: Extracts specific fields from the PDF document

### 2. XML Generator

The XML generator creates XML documents according to the ISED Canada schema. It's implemented in `src/services/xmlGenerator.js`. Key functions include:

- `generateXML`: Creates XML from structured data
- `validateXMLSchema`: Validates the generated XML against the XSD schema
- `ensureISEDCompliance`: Ensures the XML meets all ISED requirements

### 3. API Layer

The API endpoints are defined in `src/api/routes/convert.js` and their logic is implemented in `src/api/controllers/converter.js`.

## Testing

### Running Tests

```bash
npm test
```

This will run all tests in the `test/` directory using Mocha and Chai.

### Writing Tests

1. Create a new test file in the `test/` directory
2. Import required modules and the component you're testing
3. Write test cases using Mocha's `describe` and `it` functions
4. Use Chai's `expect` function for assertions

Example:
```javascript
const chai = require('chai');
const { expect } = chai;
const { generateXML } = require('../src/services/xmlGenerator');

describe('XML Generator', () => {
  it('should generate valid XML from form data', () => {
    const formData = { /* test data */ };
    const result = generateXML(formData, 'test.xml');
    expect(result).to.be.a('string');
    // More assertions...
  });
});
```

## Contribution Workflow

1. Create a fork of the repository
2. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add feature: description of your changes"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Create a pull request to the main repository

### Code Style

- Follow the existing code style in the project
- Use ESLint for JavaScript code linting
- Add JSDoc comments to document functions and components
- Use meaningful variable and function names

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if necessary
3. Fill out the pull request template with a description of your changes
4. Link any related issues
5. Wait for code review and address any feedback

## Adding New Features

### Adding a New API Endpoint

1. Define the route in `src/api/routes/convert.js`
2. Create the controller function in `src/api/controllers/converter.js`
3. Add any necessary services or utilities
4. Add tests for the new endpoint
5. Update API documentation

### Modifying the PDF Parser

The PDF parsing functionality relies on the Java converter in the `Converter/` directory. If you need to modify this:

1. Update the Java code in the PDFtoXML Java project
2. Build the JAR file
3. Replace the existing JAR in the `Converter/` directory
4. Update the interface in `src/services/pdfParser.js` if necessary

### Modifying the XML Schema

If the ISED schema changes, you'll need to:

1. Update the XSD schema in `schema/form31.xsd`
2. Modify the `src/models/form31.js` model to reflect the changes
3. Update the XML generation logic in `src/services/xmlGenerator.js`
4. Update tests to verify the new schema compatibility