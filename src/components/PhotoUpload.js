import React, { useState } from 'react';
import './PhotoUpload.css';
import { compressImage } from '../utils/imageUtils';
import { uploadToCloudinary, saveCreationMetadata } from '../utils/cloudinaryUtils';

function PhotoUpload({ onAddCreation }) {
  const [creationName, setCreationName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errors, setErrors] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);

  // File validation constants
  const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const MAX_FILES = 10;

  const validateFile = (file) => {
    const errors = [];
    
    // Check file format
    if (!ACCEPTED_FORMATS.includes(file.type.toLowerCase())) {
      errors.push(`${file.name}: Unsupported format. Please use JPG, PNG, WebP, or GIF.`);
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      errors.push(`${file.name}: File too large (${sizeInMB}MB). Maximum size is 10MB.`);
    }
    
    return errors;
  };

  const handleFileSelect = async (event) => {
    const newFiles = Array.from(event.target.files);
    const currentFileCount = selectedFiles.length;
    
    // Clear previous errors
    setErrors([]);
    
    // Check total file limit
    if (currentFileCount + newFiles.length > MAX_FILES) {
      setErrors([`You can only upload up to ${MAX_FILES} photos per creation. Currently selected: ${currentFileCount}`]);
      event.target.value = '';
      return;
    }
    
    // Validate each file
    const validationErrors = [];
    const validFiles = [];
    
    newFiles.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        validationErrors.push(...fileErrors);
      } else {
        validFiles.push(file);
      }
    });
    
    // Show validation errors if any
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Don't process invalid files, but continue with valid ones if any
      if (validFiles.length === 0) {
        event.target.value = '';
        return;
      }
    }
    
    if (validFiles.length === 0) {
      event.target.value = '';
      return;
    }
    
    const allFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(allFiles);
    setIsProcessing(true);
    setUploadStatus(`Uploading ${validFiles.length} photo${validFiles.length > 1 ? 's' : ''}...`);

    // Create unique creation ID for this entire creation
    const creationId = Date.now().toString();
    const creationData = {
      creationId,
      creationName: creationName.trim(),
      dateAdded: new Date().toISOString()
    };

    try {
      const newPreviews = await Promise.all(
        validFiles.map(async (file, index) => {
          setUploadStatus(`Uploading photo ${index + 1} of ${validFiles.length}...`);
          const compressedFile = await compressImage(file);
          
          try {
            // Upload to Cloudinary with shared creation metadata
            const cloudinaryResponse = await uploadToCloudinary(compressedFile, creationData);
            
            return {
              file: compressedFile,
              url: cloudinaryResponse.url,
              publicId: cloudinaryResponse.publicId,
              name: file.name,
              width: cloudinaryResponse.width,
              height: cloudinaryResponse.height,
              creationId
            };
          } catch (uploadError) {
            console.error('Failed to upload to Cloudinary:', uploadError);
            // Fallback to base64 if Cloudinary fails
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  file: compressedFile,
                  url: e.target.result,
                  name: file.name,
                  isLocal: true // Mark as local fallback
                });
              };
              reader.readAsDataURL(compressedFile);
            });
          }
        })
      );
      setPreviews(prev => [...prev, ...newPreviews]);
    } catch (error) {
      console.error('Error processing images:', error);
      setErrors(prev => [...prev, 'Error processing some images. Please try again.']);
    } finally {
      setIsProcessing(false);
      setUploadStatus('');
    }
    
    // Clear the input so the same file can be selected again if needed
    event.target.value = '';
  };

  const removePreview = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // No need to revoke base64 URLs
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    
    // Clear errors if we're now under file limit
    if (newFiles.length < MAX_FILES) {
      setErrors(prev => prev.filter(error => !error.includes('You can only upload up to')));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    console.log('Form submitted with:', { 
      creationName: creationName.trim(), 
      selectedFiles: selectedFiles.length, 
      previews: previews.length 
    });
    
    if (!creationName.trim()) {
      alert('Please enter a creation name');
      return;
    }
    
    if (previews.length === 0) {
      alert('Please select at least one photo');
      return;
    }

    const photos = previews.map(preview => ({
      url: preview.url,
      name: preview.name,
      publicId: preview.publicId,
      width: preview.width,
      height: preview.height
    }));

    // Get the creation ID from the first uploaded photo
    const firstPhoto = previews[0];
    const actualCreationId = firstPhoto?.creationId || Date.now().toString();
    
    const creationData = {
      id: actualCreationId,
      name: creationName.trim(),
      photos,
      dateAdded: new Date().toISOString()
    };

    console.log('Calling onAddCreation with:', creationData);

    try {
      // Save the creation metadata to database for cross-device sync
      await saveCreationMetadata(creationData);
      
      onAddCreation(creationData);

      // Clear form after successful submission
      setCreationName('');
      setSelectedFiles([]);
      setPreviews([]);
      setErrors([]);
      
      console.log('Creation added successfully');
    } catch (error) {
      console.error('Error adding creation:', error);
      alert('Error adding creation. Please try again.');
    }
  };

  return (
    <div className="photo-upload">
      <h2 className="upload-title">Add New Lego Creation</h2>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="creationName" className="form-label">
            Creation Name
          </label>
          <input
            id="creationName"
            name="creationName"
            type="text"
            value={creationName}
            onChange={(e) => setCreationName(e.target.value)}
            placeholder="Enter your creation's name..."
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="photos" className="form-label">
            Photos (Select multiple photos of this creation)
          </label>
          <div className="file-upload-section">
            <input
              id="photos"
              name="photos"
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="file-input"
            />
            <label htmlFor="photos" className={`file-input-label ${errors.length > 0 ? 'error' : ''}`}>
              {isProcessing ? `⏳ ${uploadStatus || 'Processing...'}` : '📷 Choose Multiple Photos'}
            </label>
            <div className="file-requirements">
              <p className="requirements-text">
                <strong>Accepted formats:</strong> JPG, PNG, WebP, GIF<br/>
                <strong>Maximum size:</strong> 10MB per file<br/>
                <strong>Maximum files:</strong> {MAX_FILES} photos per creation
              </p>
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="error-messages">
            <div className="error-header">
              ⚠️ Upload Issues:
            </div>
            <ul className="error-list">
              {errors.map((error, index) => (
                <li key={index} className="error-item">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {previews.length > 0 && (
          <div className="previews">
            <h3 className="previews-title">Selected Photos ({previews.length})</h3>
            <div className="preview-grid">
              {previews.map((preview, index) => (
                <div key={index} className="preview-item">
                  <img 
                    src={preview.url} 
                    alt={`Preview ${index + 1}`}
                    className="preview-image"
                    onClick={() => setZoomedImage(preview.url)}
                    style={{ cursor: 'pointer' }}
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(index)}
                    className="remove-btn"
                    title="Remove photo"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={isProcessing}>
          🚀 Add Creation
        </button>
      </form>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div 
          className="zoom-modal"
          onClick={() => setZoomedImage(null)}
        >
          <div className="zoom-content">
            <img 
              src={zoomedImage} 
              alt="Zoomed view"
              className="zoom-image"
            />
            <button 
              className="zoom-close"
              onClick={() => setZoomedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoUpload;