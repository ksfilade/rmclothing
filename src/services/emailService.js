import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Rate limiting - track submission attempts
const submissionAttempts = new Map();

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Disposable email domains to block
const disposableEmailDomains = [
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'temp-mail.org',
  'throwaway.email'
];

// Suspicious patterns
const suspiciousPatterns = [
  /test@test\.com/i,
  /admin@admin\.com/i,
  /spam@spam\.com/i,
  /fake@fake\.com/i,
  /noreply@/i,
  /no-reply@/i
];

const validateEmail = (email) => {
  // Basic format validation
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Invalid email format' };
  }

  // Check for disposable email domains
  const domain = email.split('@')[1]?.toLowerCase();
  if (disposableEmailDomains.includes(domain)) {
    return { valid: false, reason: 'Disposable email addresses are not allowed' };
  }

  // Check for suspicious patterns
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(email)) {
      return { valid: false, reason: 'Suspicious email pattern detected' };
    }
  }

  return { valid: true };
};

const checkRateLimit = (identifier = 'default') => {
  const now = Date.now();
  const attempts = submissionAttempts.get(identifier) || [];
  
  // Remove attempts older than 5 minutes
  const recentAttempts = attempts.filter(time => now - time < 5 * 60 * 1000);
  
  // Allow max 3 attempts per 5 minutes
  if (recentAttempts.length >= 3) {
    return { allowed: false, reason: 'Too many attempts. Please wait 5 minutes.' };
  }
  
  // Add current attempt
  recentAttempts.push(now);
  submissionAttempts.set(identifier, recentAttempts);
  
  return { allowed: true };
};

const checkForDuplicates = async (email) => {
  try {
    const q = query(
      collection(db, 'emails'),
      where('email', '==', email.toLowerCase()),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return false;
  }
};

export const saveEmailToFirestore = async (email, honeypot = '', userAgent = '') => {
  try {
    // Honeypot check - if honeypot field is filled, it's likely a bot
    if (honeypot && honeypot.trim() !== '') {
      console.log('Honeypot triggered - potential spam');
      return { success: false, error: 'Submission failed validation' };
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit();
    if (!rateLimitResult.allowed) {
      return { success: false, error: rateLimitResult.reason };
    }

    // Email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.reason };
    }

    // Check for duplicates
    const isDuplicate = await checkForDuplicates(email);
    if (isDuplicate) {
      return { success: false, error: 'Email already subscribed' };
    }

    console.log('Saving email to firestore: ', email);
    
    // Save to Firestore with additional metadata
    const docRef = await addDoc(collection(db, 'emails'), {
      email: email.toLowerCase().trim(),
      timestamp: serverTimestamp(),
      subscribed: true,
      userAgent: userAgent || 'unknown',
      ipAddress: 'client-side', // You'd need server-side implementation for real IP
      verified: false // For future email verification implementation
    });
    
    console.log('docRef: ', docRef);
    console.log('Email saved with ID: ', docRef.id);
    return { success: true, id: docRef.id };
    
  } catch (error) {
    console.error('Error saving email: ', error);
    return { success: false, error: error.message };
  }
}; 