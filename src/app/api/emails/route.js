import { NextResponse } from 'next/server';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Simple password protection - you should change this password
const ADMIN_PASSWORD = 'brodarac123';

export async function GET(request) {
  try {
    // Get password from query parameters or headers
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password') || request.headers.get('x-admin-password');

    // Check password
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Get all emails from Firestore
    const emailsRef = collection(db, 'emails');
    const q = query(emailsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    const emails = [];
    querySnapshot.forEach((doc) => {
      emails.push({
        id: doc.id,
        ...doc.data(),
        // Convert timestamp to readable format
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp
      });
    });

    return NextResponse.json({
      success: true,
      count: emails.length,
      emails: emails
    });

  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 