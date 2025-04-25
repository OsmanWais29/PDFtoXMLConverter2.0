const chai = require('chai');
const { expect } = chai;
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');

describe('Application Tests', () => {
    it('should return true for true', () => {
        expect(true).to.equal(true);
    });

    it('should return 2 for 1 + 1', () => {
        expect(1 + 1).to.equal(2);
    });
});

/**
 * PDF to XML Converter Application Tests
 */
describe('PDF to XML Converter API', () => {
  describe('GET /', () => {
    it('should serve the index.html file', async () => {
      const response = await request(app).get('/');
      expect(response.status).to.equal(200);
      expect(response.type).to.match(/html/);
    });
  });

  describe('API Routes', () => {
    describe('POST /api/convert', () => {
      it('should respond with 400 if no files are uploaded', async () => {
        const response = await request(app)
          .post('/api/convert')
          .field('description', 'test conversion');
        
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success').to.equal(false);
        expect(response.body).to.have.property('message');
      });
      
      // This test requires actual PDF files to be available
      // Uncomment and modify when test files are set up
      /*
      it('should convert a PDF file to XML', async () => {
        const testPdfPath = path.join(__dirname, 'fixtures', 'test.pdf');
        
        if (!fs.existsSync(testPdfPath)) {
          console.warn('Test PDF not found. Skipping test.');
          return;
        }
        
        const response = await request(app)
          .post('/api/convert')
          .attach('files', testPdfPath);
        
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('success').to.equal(true);
        expect(response.body).to.have.property('results').to.be.an('array');
      });
      */
    });

    describe('GET /api/download/:filename', () => {
      it('should respond with 404 for non-existent files', async () => {
        const response = await request(app)
          .get('/api/download/non-existent-file.xml');
        
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('success').to.equal(false);
      });
    });

    describe('GET /api/status/:jobId', () => {
      it('should return the status of a conversion job', async () => {
        const response = await request(app)
          .get('/api/status/testjob123');
        
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('jobId');
        expect(response.body).to.have.property('status');
      });
    });
  });
});