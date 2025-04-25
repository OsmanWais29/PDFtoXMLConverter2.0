# PDF to XML Java Converter

This directory contains the Java-based PDF converter component that extracts data from Form 31 PDF documents and converts them to structured XML format.

## Overview

The Java converter is packaged as a standalone JAR file (`PDFtoXML.jar`) that can be executed from the command line or invoked programmatically from the Node.js application.

## Usage

### Command Line

```bash
java -jar PDFtoXML.jar -input /path/to/pdf/file.pdf -output /path/to/output/file.xml
```

### Arguments

- `-input`: Path to the PDF file to convert (required)
- `-output`: Path where the XML output should be saved (required)
- `-config`: Path to custom configuration file (optional)
- `-verbose`: Enable verbose logging (optional)

## Configuration

The converter uses several configuration files:

- `config.properties`: Main configuration settings
- `log4j2.properties`: Logging configuration
- `messages.properties`: User-facing messages and error texts

## Integration with Node.js

The Node.js application invokes this JAR file using the `child_process.exec` method. The integration is implemented in the `src/services/pdfParser.js` file.

## Extending the Converter

If you need to modify the Java converter:

1. Get the source code from the PDFtoXML Java project
2. Make your changes
3. Rebuild the JAR file
4. Replace the `PDFtoXML.jar` in this directory
5. Update configuration files if necessary

## Troubleshooting

If the converter fails to run:

1. Ensure Java 11 or higher is installed
2. Check that the JAR file is not corrupted
3. Verify file permissions (the JAR needs to be executable)
4. Check the PDF file isn't password-protected or corrupt
5. Review log output for specific errors