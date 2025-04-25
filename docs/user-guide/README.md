# PDF to XML Converter User Guide

This user guide provides instructions on how to use the PDF to XML Converter application to convert Form 31 bankruptcy documents to XML format compliant with the ISED Canada e-filing system.

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- Form 31 PDF documents to convert

### Accessing the Application

You can access the application in one of two ways:

1. **Online Access**: Visit [https://pdftoxmlconverter.example.com](https://pdftoxmlconverter.example.com) (replace with the actual URL when deployed)
2. **Local Access**: If running locally, open your browser and navigate to [http://localhost:8080](http://localhost:8080)

## Using the Web Interface

### Uploading PDF Files

1. On the main page, click the "Browse Files" button or drag and drop your PDF files into the designated area
2. Select one or more Form 31 PDF files you wish to convert
3. The selected files will appear in the "Selected Files" list
4. You can remove any file from the list by clicking the "X" button next to the filename

### Converting Files

1. After selecting your files, click the "Convert to XML" button
2. The conversion process will begin, and a loading spinner will be displayed
3. Once complete, the results will appear in the "Conversion Results" section

### Downloading XML Files

1. In the "Conversion Results" section, successfully converted files will have a "Download XML" button
2. Click this button to download the converted XML file
3. The XML file will be saved to your default downloads folder

### Error Handling

If there are any issues during conversion, error messages will be displayed in the "Conversion Results" section. Common errors include:

- Password-protected PDFs cannot be processed
- Files that are not valid Form 31 documents may produce incomplete or incorrect XML
- Files exceeding the 10MB size limit will be rejected

## Using the API

For developers or automation scenarios, the application provides a comprehensive API. See the [API Documentation](../api/README.md) for details.

## Troubleshooting

### Common Issues

1. **File Upload Failures**
   - Ensure your PDF is not password-protected
   - Check that the file size is under 10MB
   - Verify that you have a stable internet connection

2. **Conversion Errors**
   - Ensure you're uploading a valid Form 31 PDF
   - Check that the PDF contains all required fields
   - Try uploading a different version of the document if available

3. **XML Validation Errors**
   - The generated XML may not be valid if the source PDF is missing required information
   - Check that all mandatory fields in the Form 31 are completed

### Getting Help

If you encounter issues that aren't resolved by the troubleshooting steps above:

1. Check the [FAQ section](./faq.md) for common questions and answers
2. Contact support at [support@example.com](mailto:support@example.com) (replace with actual support email)
3. Submit an issue on the [GitHub repository](https://github.com/OsmanWais29/PDFtoXMLConverter/issues)