# AI-Enhanced PDF to XML Converter for Bankruptcy Form 31

A specialized AI-powered converter that transforms bankruptcy Form 31 documents from various formats (scanned, handwritten, faxed, emailed) into ISED Canada-compliant XML format.

## Project Overview

This solution focuses on high accuracy document processing with continuous improvement through machine learning and an intuitive prompt-based human review interface. Unlike general practice management systems, this tool specializes exclusively in excellent document conversion that improves over time.

### Key Features

- **Multi-format Document Support**: Processes various document formats including scans, handwritten forms, faxes, and emailed documents
- **AI-powered OCR Engine**: Combines multiple OCR engines for improved accuracy
- **Smart Field Extraction**: Maps extracted text to specific Form 31 fields
- **Business Rules Validation**: Ensures data compliance and logical consistency
- **Prompt-Based Human Review**: Intuitive interface for verifying and correcting extracted data
- **ISED-Compliant XML Generation**: Creates properly formatted XML that meets Canadian government standards
- **Continuous Learning**: Improves over time by learning from human corrections

## System Architecture

The system consists of six core components:

1. **Document Processing Pipeline**: Handles document upload, enhancement and storage
2. **AI OCR Engine**: Extracts text from documents using multiple OCR engines
3. **Business Rules Engine**: Validates extracted data against Form 31 requirements
4. **Prompt-Based Human Review Interface**: Provides an intuitive interface for reviewing and correcting extracted data
5. **XML Generation**: Creates ISED-compliant XML output
6. **Continuous Learning System**: Improves accuracy over time based on human corrections

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB
- Java 11+ (for PDF services)
- Docker (optional, for containerized deployment)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/OsmanWais29/PDFtoXMLConverter2.0.git
   cd PDFtoXMLConverter2.0
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/pdfToXml
   STORAGE_PATH=./uploads
   OCR_API_KEY=your_ocr_api_key
   ```

4. Start the application:
   ```
   npm start
   ```

## Usage

### Document Upload

1. Navigate to the web interface at `http://localhost:3000`
2. Click "Upload Document" and select a Form 31 PDF
3. The system will process the document and extract data
4. You will be redirected to the review interface if any fields need verification

### Human Review Interface

The review interface guides you through a conversation-like process to verify extracted data:

1. View the document summary with confidence scores
2. Click "Begin Review" to start verifying fields that need attention
3. For each field:
   - View the extracted text alongside the original document
   - Accept correct extractions or correct if needed
   - Choose from AI-suggested alternatives if available
4. Submit the final review to generate the XML

### XML Output

Once review is complete, you can:
- Download the XML file
- View the XML in the browser
- Submit it directly to ISED systems (if configured)

## Technical Documentation

### API Endpoints

#### Document Processing

- `POST /api/documents/upload` - Upload a new document
- `GET /api/documents/:id` - Get document status and metadata

#### Review Process

- `GET /api/review/:taskId/next` - Get next field for review
- `POST /api/review/:taskId/field/:fieldName` - Submit correction for a field
- `GET /api/review/:taskId/summary` - Get review progress and summary

#### XML Generation

- `GET /api/documents/:id/xml` - Get generated XML
- `POST /api/documents/:id/submit` - Submit XML to ISED system

### Architecture Components

#### Document Processing Pipeline

The pipeline handles document upload, enhancement, and preparation for OCR processing:
- Document enhancement (deskewing, contrast improvement)
- PDF extraction using pdf-lib and pdf-parse
- Secure file storage management

#### AI OCR Engine

The OCR engine combines multiple technologies for improved accuracy:
- Tesseract.js for basic OCR
- Google Vision API integration for enhanced results
- Special handling for handwritten text
- Confidence scoring for all extracted fields

#### Business Rules Engine

Ensures extracted data meets Form 31 requirements:
- Field validation for required information
- Format validation for dates, amounts, phone numbers
- Cross-field validation for logical consistency
- Automatic correction of common formatting issues

#### Prompt-Based Human Review Interface

A conversation-like interface for efficiently reviewing extracted data:
- Shows one field at a time that needs verification
- Displays the relevant portion of the original document
- Provides confidence indicators and suggested corrections
- Adapts questions based on business rules

#### Continuous Learning System

Improves extraction accuracy over time:
- Stores original documents and corrections
- Collects training data from human reviews
- Implements scheduled model retraining
- Tracks performance metrics to measure improvement

## Development

### Project Structure

```
/
├── app.js                 # Main application entry point
├── src/
│   ├── api/               # API routes and controllers
│   ├── config/            # Configuration files
│   ├── models/            # Data models
│   ├── services/          # Business logic services
│   └── utils/             # Helper utilities
├── public/                # Static front-end files
├── schema/                # XML schema definitions
├── test/                  # Test files
└── uploads/               # Document storage
```

### Running Tests

```
npm test
```

### Docker Deployment

Build and run the Docker container:

```
docker build -t pdf-to-xml .
docker run -p 3000:3000 -e MONGODB_URI=<your-mongodb-uri> pdf-to-xml
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Repository: [https://github.com/OsmanWais29/PDFtoXMLConverter2.0](https://github.com/OsmanWais29/PDFtoXMLConverter2.0)