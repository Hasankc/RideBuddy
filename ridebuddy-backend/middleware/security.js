const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

const securityMiddleware = [
  // Set security headers
  helmet(),
  
  // Prevent XSS attacks
  xss(),
  
  // Prevent HTTP Parameter Pollution
  hpp(),
  
  // Sanitize MongoDB queries
  mongoSanitize(),
  
  // Custom security middleware
  (req, res, next) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Prevent clickjacking
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    
    next();
  }
];

module.exports = securityMiddleware;