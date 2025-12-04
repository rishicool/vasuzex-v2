/**
 * Security Scanner
 * 
 * Scans uploaded files for security threats.
 * Validates file signatures, checks for malicious content, and blocks dangerous file types.
 * 
 * @example
 * const scanner = new SecurityScanner(app);
 * 
 * await scanner.scan(fileData); // Throws error if threat detected
 */

export class SecurityScanner {
  constructor(app) {
    this.app = app;
  }

  /**
   * Scan file for threats
   */
  async scan(fileData) {
    const errors = [];

    // Check file signature (magic bytes)
    await this.checkFileSignature(fileData, errors);

    // Check for dangerous extensions
    this.checkDangerousExtensions(fileData, errors);

    // Check for executable content
    await this.checkExecutableContent(fileData, errors);

    // Check file size bomb (zip bombs, etc.)
    this.checkSizeBomb(fileData, errors);

    // Custom scanner (e.g., ClamAV)
    if (this.app.config('upload.security.custom_scanner')) {
      await this.runCustomScanner(fileData, errors);
    }

    if (errors.length > 0) {
      throw new SecurityError('File security scan failed', errors);
    }

    return true;
  }

  /**
   * Check file signature (magic bytes)
   * Validates that file extension matches actual file content
   * @private
   */
  async checkFileSignature(fileData, errors) {
    const buffer = fileData.buffer;
    const ext = this.getExtension(fileData.originalname);
    const detectedType = this.detectFileType(buffer);

    // Skip if no extension or detection failed
    if (!ext || !detectedType) {
      return;
    }

    // Map of extensions to expected signatures
    const expectedTypes = {
      '.jpg': ['image/jpeg'],
      '.jpeg': ['image/jpeg'],
      '.png': ['image/png'],
      '.gif': ['image/gif'],
      '.webp': ['image/webp'],
      '.pdf': ['application/pdf'],
      '.zip': ['application/zip'],
      '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      '.mp4': ['video/mp4'],
      '.mp3': ['audio/mpeg']
    };

    if (expectedTypes[ext] && !expectedTypes[ext].includes(detectedType)) {
      errors.push(`File signature mismatch: Extension ${ext} but detected type ${detectedType}`);
    }
  }

  /**
   * Detect file type from magic bytes
   * @private
   */
  detectFileType(buffer) {
    if (buffer.length < 12) {
      return null;
    }

    const signatures = {
      'ffd8ff': 'image/jpeg',
      '89504e47': 'image/png',
      '47494638': 'image/gif',
      '52494646': 'image/webp',
      '25504446': 'application/pdf',
      '504b0304': 'application/zip',
      '504b0506': 'application/zip',
      '504b0708': 'application/zip',
      '1f8b08': 'application/gzip',
      '000001ba': 'video/mpeg',
      '000001b3': 'video/mpeg',
      '66747970': 'video/mp4',
      'fffb': 'audio/mpeg',
      'fff3': 'audio/mpeg',
      'fff2': 'audio/mpeg',
      '494433': 'audio/mpeg'
    };

    // Check first few bytes
    const header = buffer.slice(0, 12).toString('hex');

    for (const [signature, type] of Object.entries(signatures)) {
      if (header.startsWith(signature)) {
        return type;
      }
    }

    // Special check for WEBP (RIFF....WEBP)
    if (header.startsWith('52494646') && buffer.slice(8, 12).toString() === 'WEBP') {
      return 'image/webp';
    }

    // Special check for MP4 (ftyp)
    if (buffer.slice(4, 8).toString() === 'ftyp') {
      return 'video/mp4';
    }

    return null;
  }

  /**
   * Check for dangerous extensions
   * @private
   */
  checkDangerousExtensions(fileData, errors) {
    const dangerousExtensions = [
      '.exe', '.dll', '.bat', '.cmd', '.com', '.scr', '.pif',
      '.app', '.deb', '.pkg', '.dmg',
      '.sh', '.bash', '.zsh', '.fish',
      '.vbs', '.vbe', '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh',
      '.ps1', '.ps2', '.psc1', '.psc2',
      '.msi', '.jar',
      '.cpl', '.inf', '.reg',
      '.htaccess', '.htpasswd',
      '.php', '.phtml', '.php3', '.php4', '.php5', '.phps',
      '.asp', '.aspx', '.jsp', '.jspx',
      '.py', '.pyc', '.pyo', '.rb', '.pl',
      '.cgi',
      '.svg' // SVG can contain JavaScript
    ];

    const ext = this.getExtension(fileData.originalname);
    
    if (dangerousExtensions.includes(ext)) {
      errors.push(`Dangerous file extension detected: ${ext}`);
    }
  }

  /**
   * Check for executable content in files
   * @private
   */
  async checkExecutableContent(fileData, errors) {
    const buffer = fileData.buffer;
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 8192));

    // Check for script tags in images/documents
    const scriptPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /onerror\s*=/gi,
      /onload\s*=/gi,
      /<iframe/gi,
      /<embed/gi,
      /<object/gi,
      /eval\(/gi,
      /base64/gi
    ];

    for (const pattern of scriptPatterns) {
      if (pattern.test(content)) {
        errors.push('Potentially malicious script content detected');
        break;
      }
    }

    // Check for PHP code in images
    if (content.includes('<?php') || content.includes('<?=')) {
      errors.push('PHP code detected in file');
    }

    // Check for executable signatures
    if (buffer[0] === 0x4D && buffer[1] === 0x5A) { // MZ header (Windows executable)
      errors.push('Windows executable detected');
    }

    if (buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) { // ELF header (Linux executable)
      errors.push('Linux executable detected');
    }
  }

  /**
   * Check for size bombs (zip bombs, etc.)
   * @private
   */
  checkSizeBomb(fileData, errors) {
    const maxSize = this.app.config('upload.security.max_size', 100 * 1024 * 1024); // 100MB default

    if (fileData.size > maxSize) {
      errors.push(`File size ${fileData.size} bytes exceeds security limit`);
    }

    // Check compression ratio for archives
    if (this.isArchive(fileData.mimetype)) {
      // Additional checks could be added here for compression ratio
      // This would require decompressing and checking uncompressed size
    }
  }

  /**
   * Run custom virus scanner (e.g., ClamAV)
   * @private
   */
  async runCustomScanner(fileData, errors) {
    try {
      const scannerConfig = this.app.config('upload.security.custom_scanner');
      
      if (scannerConfig.type === 'clamav') {
        await this.scanWithClamAV(fileData, scannerConfig, errors);
      }
    } catch (error) {
      // Don't fail upload if scanner is unavailable
      // Log the error instead
      console.error('Custom scanner failed:', error.message);
    }
  }

  /**
   * Scan with ClamAV
   * @private
   */
  async scanWithClamAV(fileData, config, errors) {
    const NodeClam = await import('clamscan');
    
    const clamscan = await new NodeClam.default().init({
      clamdscan: {
        host: config.host || 'localhost',
        port: config.port || 3310,
        timeout: config.timeout || 60000
      }
    });

    const { isInfected, viruses } = await clamscan.scanBuffer(fileData.buffer);

    if (isInfected) {
      errors.push(`Virus detected: ${viruses.join(', ')}`);
    }
  }

  /**
   * Check if file is archive
   * @private
   */
  isArchive(mimetype) {
    const archiveTypes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/gzip',
      'application/x-tar'
    ];

    return archiveTypes.includes(mimetype);
  }

  /**
   * Get file extension
   * @private
   */
  getExtension(filename) {
    if (!filename || !filename.includes('.')) {
      return '';
    }
    return filename.substring(filename.lastIndexOf('.')).toLowerCase();
  }

  /**
   * Sanitize filename
   * Removes dangerous characters and patterns
   */
  sanitizeFilename(filename) {
    // Remove path traversal attempts
    filename = filename.replace(/\.\./g, '');
    filename = filename.replace(/[\/\\]/g, '');

    // Remove null bytes
    filename = filename.replace(/\0/g, '');

    // Remove control characters
    filename = filename.replace(/[\x00-\x1f\x80-\x9f]/g, '');

    // Limit length
    if (filename.length > 255) {
      const ext = this.getExtension(filename);
      const name = filename.substring(0, 255 - ext.length);
      filename = name + ext;
    }

    return filename;
  }
}

/**
 * Security Error
 */
export class SecurityError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'SecurityError';
    this.errors = errors;
  }
}

export default SecurityScanner;
