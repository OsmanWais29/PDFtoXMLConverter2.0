/**
 * PDF to XML Converter Entry Point
 */
const app = require('./src/app');
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log('---------------------------------------------------');
  console.log(`PDFtoXMLConverter server started!`);
  console.log(`Access the application at:`);
  console.log(`  • http://localhost:${port}`);
  console.log(`  • http://127.0.0.1:${port}`);
  console.log('---------------------------------------------------');
}).on('error', (err) => {
  console.error('Failed to start server:', err.message);
});