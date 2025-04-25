# PDF to XML Converter API Documentation

This document provides information about the PDF to XML Converter API endpoints, request/response formats, and usage examples.

## API Endpoints

### Convert PDF to XML

**Endpoint:** `POST /api/convert`

**Description:** Upload PDF files and convert them to XML format compliant with ISED Canada e-filing system.

**Request:**
- Content-Type: `multipart/form-data`
- Body: PDF files to convert (field name: `files`)

**Response:**
```json
{
  "success": true,
  "message": "Files processed",
  "results": [
    {
      "originalName": "form31.pdf",
      "xmlName": "form31.xml",
      "xmlPath": "/path/to/xml",
      "success": true
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "status": 400
}
```

### Download XML File

**Endpoint:** `GET /api/download/:filename`

**Description:** Download a converted XML file.

**Parameters:**
- `filename`: The name of the XML file to download

**Response:** XML file download

**Error Response:**
```json
{
  "success": false,
  "message": "File not found",
  "status": 404
}
```

### Check Conversion Status

**Endpoint:** `GET /api/status/:jobId`

**Description:** Check the status of a conversion job.

**Parameters:**
- `jobId`: The ID of the conversion job

**Response:**
```json
{
  "success": true,
  "jobId": "job123",
  "status": "completed",
  "message": "Conversion completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Job not found",
  "status": 404
}
```

## Usage Examples

### Converting a PDF using curl

```bash
curl -X POST -F "files=@/path/to/form31.pdf" http://localhost:8080/api/convert
```

### Downloading a converted XML file using curl

```bash
curl -O http://localhost:8080/api/download/form31.xml
```

### Checking conversion status using curl

```bash
curl http://localhost:8080/api/status/job123
```