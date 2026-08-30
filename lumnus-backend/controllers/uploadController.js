const cloudinary = require('../config/cloudinary');

const getCloudinaryConfig = () => {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
  let apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

  // Safety fallback for account secret case-sensitivity
  if (cloudName === 'xqaxtbim' && apiSecret === 'g23kdZQq1C9KFisNOCL7ualSWC0') {
    apiSecret = 'g23kdZQq1C9KFisNOcL7ualSWC0';
  }

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials missing on server environment variables.');
  }

  return {
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  };
};

// @route   POST /api/upload/image
// @desc    Upload an image file to Cloudinary (Max 5MB)
// @access  Private
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size exceeds maximum limit of 5 MB.' });
    }

    const config = getCloudinaryConfig();
    cloudinary.config(config);

    const folder = req.body.folder || 'alumniconnect/avatars';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({
            message: `Cloudinary error: ${error.message || 'Failed to upload image'}`,
            error: error.message,
          });
        }
        res.json({
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: `Server upload error: ${error.message}`, error: error.message });
  }
};

// @route   POST /api/upload/document
// @desc    Upload a CV/Resume document (PDF, DOC, DOCX) to Cloudinary (Max 5MB)
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No document file provided' });
    }

    // 5MB Max File Size limit check
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size exceeds maximum limit of 5 MB.' });
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid format. Only PDF, DOC, and DOCX files are allowed.' });
    }

    const config = getCloudinaryConfig();
    cloudinary.config(config);

    const folder = 'alumniconnect/resumes';
    const originalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: `${Date.now()}_${originalName}`,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary document upload error:', error);
          return res.status(500).json({
            message: `Cloudinary document error: ${error.message || 'Failed to upload document'}`,
            error: error.message,
          });
        }
        res.json({
          url: result.secure_url,
          public_id: result.public_id,
          original_name: req.file.originalname,
          size: req.file.size,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: `Server error uploading document: ${error.message}`, error: error.message });
  }
};

// @route   POST /api/upload/delete
// @desc    Delete a file from Cloudinary by public_id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const { public_id, resource_type } = req.body;
    if (!public_id) {
      return res.status(400).json({ message: 'public_id is required' });
    }

    const config = getCloudinaryConfig();
    cloudinary.config(config);

    const type = resource_type || 'image';
    const result = await cloudinary.uploader.destroy(public_id, { resource_type: type });

    res.json({ message: 'File deleted successfully', result });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: `Failed to delete file: ${error.message}`, error: error.message });
  }
};

module.exports = { uploadImage, uploadDocument, deleteFile };
