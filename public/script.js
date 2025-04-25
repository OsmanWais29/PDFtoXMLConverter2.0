/**
 * PDF to XML Converter Frontend Script
 */
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const uploadForm = document.getElementById('upload-form');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const dropArea = document.getElementById('drop-area');
  const convertBtn = document.getElementById('convert-btn');
  const clearBtn = document.getElementById('clear-btn');
  const conversionResults = document.getElementById('conversion-results');
  const conversionSpinner = document.getElementById('conversion-spinner');
  const accordion = document.querySelectorAll('.accordion-item');
  
  // Selected files tracking
  let selectedFiles = [];
  
  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });
  
  // Highlight drop area when item is dragged over
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });
  
  // Handle dropped files
  dropArea.addEventListener('drop', handleDrop, false);
  
  // Handle file input change
  fileInput.addEventListener('change', handleFiles);
  
  // Handle form submission
  uploadForm.addEventListener('submit', handleSubmit);
  
  // Handle form reset
  clearBtn.addEventListener('click', clearForm);
  
  // Handle accordion
  accordion.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });
  
  // Prevent default drag behaviors
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  function highlight() {
    dropArea.classList.add('highlight');
  }
  
  function unhighlight() {
    dropArea.classList.remove('highlight');
  }
  
  // Handle dropped files
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    handleFiles({ target: { files } });
  }
  
  // Process selected files
  function handleFiles(e) {
    const files = [...e.target.files];
    
    files.forEach(file => {
      if (file.type !== 'application/pdf') {
        showNotification('Only PDF files are allowed', 'error');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification(`File ${file.name} exceeds the 10MB size limit`, 'error');
        return;
      }
      
      // Check if file already exists in the list
      if (!selectedFiles.some(f => f.name === file.name)) {
        selectedFiles.push(file);
        addFileToList(file);
      }
    });
    
    // Reset the file input to allow selecting the same file again
    fileInput.value = '';
  }
  
  // Add file to the list in UI
  function addFileToList(file) {
    const fileSize = formatFileSize(file.size);
    
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="file-name">
        <i class="far fa-file-pdf"></i>
        ${file.name} <span class="file-size">(${fileSize})</span>
      </div>
      <button type="button" class="remove-file" data-filename="${file.name}">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add event listener to remove file button
    li.querySelector('.remove-file').addEventListener('click', function() {
      const filename = this.getAttribute('data-filename');
      removeFile(filename);
      li.remove();
    });
    
    fileList.appendChild(li);
  }
  
  // Remove file from selected files
  function removeFile(filename) {
    selectedFiles = selectedFiles.filter(file => file.name !== filename);
  }
  
  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      showNotification('Please select at least one PDF file', 'error');
      return;
    }
    
    // Show loading spinner
    conversionSpinner.classList.remove('hidden');
    
    // Create form data
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    
    // Send request to server
    fetch('/api/convert', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      // Hide loading spinner
      conversionSpinner.classList.add('hidden');
      
      // Display results
      displayResults(data);
    })
    .catch(error => {
      console.error('Error:', error);
      conversionSpinner.classList.add('hidden');
      showNotification('An error occurred during conversion. Please try again.', 'error');
    });
  }
  
  // Display conversion results
  function displayResults(data) {
    conversionResults.innerHTML = '';
    
    if (!data.success) {
      showNotification(data.message || 'Conversion failed', 'error');
      return;
    }
    
    if (data.results && data.results.length > 0) {
      data.results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const statusClass = result.success ? 'status-success' : 'status-error';
        const statusText = result.success ? 'Success' : 'Failed';
        
        resultItem.innerHTML = `
          <div class="result-header">
            <h3>${result.originalName}</h3>
            <span class="result-status ${statusClass}">${statusText}</span>
          </div>
          
          ${result.success ? `
            <div class="result-actions">
              <a href="/api/download/${encodeURIComponent(result.xmlName)}" target="_blank" class="action-button download-button">
                <i class="fas fa-download"></i> Download XML
              </a>
            </div>
          ` : `
            <div class="error-message">
              <p><i class="fas fa-exclamation-circle"></i> ${result.error || 'Unknown error'}</p>
            </div>
          `}
        `;
        
        conversionResults.appendChild(resultItem);
      });
    } else {
      conversionResults.innerHTML = '<p>No results returned from the server.</p>';
    }
  }
  
  // Clear the form
  function clearForm() {
    selectedFiles = [];
    fileList.innerHTML = '';
    conversionResults.innerHTML = '';
  }
  
  // Helper function to format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Show notification
  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add styles dynamically if notification styles aren't already defined
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.innerHTML = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px;
          border-radius: 4px;
          background-color: white;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 300px;
          max-width: 500px;
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .notification.error {
          border-left: 4px solid var(--error-color);
        }
        
        .notification.info {
          border-left: 4px solid var(--secondary-color);
        }
        
        .notification-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .notification-content i {
          font-size: 1.2rem;
        }
        
        .notification.error i {
          color: var(--error-color);
        }
        
        .notification.info i {
          color: var(--secondary-color);
        }
        
        .notification-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          transition: color 0.3s;
        }
        
        .notification-close:hover {
          color: #333;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Add close button event listener
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        
        if (!document.querySelector('#notification-slideout')) {
          const slideOutStyle = document.createElement('style');
          slideOutStyle.id = 'notification-slideout';
          slideOutStyle.innerHTML = `
            @keyframes slideOut {
              from { transform: translateX(0); opacity: 1; }
              to { transform: translateX(100%); opacity: 0; }
            }
          `;
          document.head.appendChild(slideOutStyle);
        }
        
        notification.addEventListener('animationend', () => {
          if (document.body.contains(notification)) {
            notification.remove();
          }
        });
      }
    }, 5000);
  }
});
