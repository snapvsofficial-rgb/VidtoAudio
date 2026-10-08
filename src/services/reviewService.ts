import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, hasFirebaseConfig } from '../firebase';
import { UserReview, ReviewStatus } from '../types';
import { getCachedAuth } from './authService';

export interface ReviewStats {
  totalVotes: number;
  averageScore: number;
  userReview: UserReview | null;
  approvedReviews: UserReview[];
}

// Local Storage Master Key for Reviews Repository
const REVIEWS_STORE_KEY = 'vidtoaudio_all_reviews_db';

const SEED_APPROVED_REVIEWS: UserReview[] = [
  {
    id: 'seed_rev_1',
    slug: 'mp4-to-mp3',
    inExt: 'mp4',
    outExt: 'mp3',
    userId: 'seed_u1',
    userEmail: 'alex.producer@audioflow.com',
    userName: 'Alex Carter',
    rating: 5,
    comment: 'Converted 15 MP4 lecture videos to 320kbps MP3 in seconds. Super fast and no quality loss whatsoever.',
    status: 'approved',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 2 }
  },
  {
    id: 'seed_rev_2',
    slug: 'mp4-to-mp3',
    inExt: 'mp4',
    outExt: 'mp3',
    userId: 'seed_u2',
    userEmail: 'elena.rostova@creatorhub.org',
    userName: 'Elena Rostova',
    rating: 5,
    comment: 'Runs completely in the browser without having to download sketchy software. Audio tracks are crystal clear.',
    status: 'approved',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 5 }
  },
  {
    id: 'seed_rev_3',
    slug: 'mp4-to-mp3',
    inExt: 'mp4',
    outExt: 'mp3',
    userId: 'seed_u3',
    userEmail: 'david.sound@podcasts.net',
    userName: 'David K.',
    rating: 5,
    comment: 'Clean sound output, accurate tags, and batch conversion worked flawlessly on my clips. 10/10 recommend.',
    status: 'approved',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 9 }
  }
];

function getStoredLocalReviews(): UserReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_STORE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORE_KEY, JSON.stringify(SEED_APPROVED_REVIEWS));
      return [...SEED_APPROVED_REVIEWS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...SEED_APPROVED_REVIEWS];
  } catch (e) {
    return [...SEED_APPROVED_REVIEWS];
  }
}

function saveStoredLocalReviews(reviews: UserReview[]): void {
  try {
    localStorage.setItem(REVIEWS_STORE_KEY, JSON.stringify(reviews));
  } catch (e) {
    // ignore
  }
}

/**
 * Anti-Spam Validation Engine
 * Validates review comments against links, spam repetitions, and inappropriate terms.
 */
export function validateReviewComment(text: string): { isValid: boolean; error?: string; cleanText: string } {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: 'Review text cannot be empty.', cleanText: '' };
  }

  const trimmed = text.trim();

  if (trimmed.length < 8) {
    return { isValid: false, error: 'Review is too short. Please write at least 8 characters explaining your experience.', cleanText: trimmed };
  }

  if (trimmed.length > 500) {
    return { isValid: false, error: 'Review is too long (maximum 500 characters).', cleanText: trimmed };
  }

  // Check minimum words
  const wordTokens = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (wordTokens.length < 2) {
    return { isValid: false, error: 'Please write a meaningful review with at least 2 words.', cleanText: trimmed };
  }

  // 1. Strict URL and link blocking (http, https, www, domains, shorteners)
  const urlRegex = /(?:https?:\/\/|ftp:\/\/|www\.)[^\s]+|\b[a-zA-Z0-9-]+\.(?:com|net|org|io|xyz|ru|co|app|live|me|top|info|biz|site|link|online|club|page|cc|store|shop|tech|club|vip|pro)(?:\/[^\s]*)?/i;
  if (urlRegex.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Website links, URLs, and external promotional web addresses are strictly prohibited.', 
      cleanText: trimmed 
    };
  }

  // Common messaging links & handles
  if (/(?:t\.me|wa\.me|discord\.gg|bit\.ly|tinyurl\.com|goo\.gl|telegram\.me|whatsapp\.com|instagram\.com|tiktok\.com|fb\.com)/i.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Social chat handles, messaging links, referral links, and short URLs are not allowed.', 
      cleanText: trimmed 
    };
  }

  // 2. Repetitive character spam (e.g. "aaaaaaa", "!!!!!!!", "........")
  if (/(.)\1{5,}/.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Repetitive spam characters detected. Please write genuine, natural feedback.', 
      cleanText: trimmed 
    };
  }

  // 3. Repeated word spam (e.g. "fast fast fast fast fast")
  const words = trimmed.toLowerCase().split(/\s+/);
  let repeatCount = 1;
  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1] && words[i].length > 2) {
      repeatCount++;
      if (repeatCount >= 3) {
        return { 
          isValid: false, 
          error: 'Excessive repetitive words detected. Please write natural feedback without spamming.', 
          cleanText: trimmed 
        };
      }
    } else {
      repeatCount = 1;
    }
  }

  // 4. HTML / Script injection tags
  if (/<[^>]*>|javascript:|data:|onload=|alert\(|onerror=/i.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'HTML tags and code snippets are strictly forbidden in reviews.', 
      cleanText: trimmed 
    };
  }

  return { isValid: true, cleanText: trimmed };
}

/**
 * Deterministic baseline generator so format landing pages have realistic, credible initial stats
 */
export function getDeterministicBaseStats(slug: string): { votes: number; score: number } {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const votes = 110 + (absHash % 75);
  const score = 4.88 + ((absHash % 9) * 0.01);
  return { votes, score: parseFloat(score.toFixed(2)) };
}

/**
 * Fetch approved reviews and combine with baseline calculations
 */
export async function fetchReviewsForSlug(slug: string, currentUserId?: string): Promise<ReviewStats> {
  const base = getDeterministicBaseStats(slug);
  const cleanSlug = slug.toLowerCase().trim();

  // Load from local store
  const localReviews = getStoredLocalReviews();
  let approvedReviews: UserReview[] = localReviews.filter(
    r => r.slug === cleanSlug && r.status === 'approved'
  );

  let userReview: UserReview | null = null;
  if (currentUserId) {
    userReview = localReviews.find(r => r.slug === cleanSlug && r.userId === currentUserId) || null;
  }

  // If Firebase Firestore is active, query remote
  if (hasFirebaseConfig && db) {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef, 
        where('slug', '==', cleanSlug),
        where('status', '==', 'approved')
      );
      const snap = await getDocs(q);

      const firestoreApproved: UserReview[] = [];
      snap.forEach(docSnap => {
        firestoreApproved.push({
          id: docSnap.id,
          ...(docSnap.data() as UserReview)
        });
      });

      if (firestoreApproved.length > 0) {
        // Merge without duplicates
        const map = new Map<string, UserReview>();
        approvedReviews.forEach(r => map.set(r.id || `${r.userId}_${r.slug}`, r));
        firestoreApproved.forEach(r => map.set(r.id || `${r.userId}_${r.slug}`, r));
        approvedReviews = Array.from(map.values());
      }

      if (currentUserId) {
        const userQ = query(
          reviewsRef,
          where('slug', '==', cleanSlug),
          where('userId', '==', currentUserId)
        );
        const userSnap = await getDocs(userQ);
        if (!userSnap.empty) {
          const docItem = userSnap.docs[0];
          userReview = {
            id: docItem.id,
            ...(docItem.data() as UserReview)
          };
        }
      }
    } catch (err: any) {
      console.warn('[Firestore] Query reviews note:', err?.message || err);
    }
  }

  // Sort approved reviews newest first
  approvedReviews.sort((a, b) => {
    const timeA = typeof a.createdAt?.seconds === 'number' 
      ? a.createdAt.seconds 
      : (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() / 1000 : 0);
    const timeB = typeof b.createdAt?.seconds === 'number' 
      ? b.createdAt.seconds 
      : (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() / 1000 : 0);
    return timeB - timeA;
  });

  // Calculate combined live score and votes
  const additionalApprovedVotes = approvedReviews.length;
  const approvedScoreSum = approvedReviews.reduce((sum, r) => sum + r.rating, 0);

  const totalVotes = base.votes + additionalApprovedVotes;
  const totalScoreSum = (base.votes * base.score) + approvedScoreSum;
  const averageScore = parseFloat((totalScoreSum / totalVotes).toFixed(1));

  return {
    totalVotes,
    averageScore,
    userReview,
    approvedReviews
  };
}

/**
 * Submit or update a user rating & review
 * Automatically defaults to 'pending' status for admin approval
 */
export async function submitUserReview(
  slug: string, 
  inExt: string, 
  outExt: string, 
  rating: number, 
  comment: string
): Promise<{ success: boolean; review: UserReview; message: string }> {
  const { user, profile } = getCachedAuth();

  if (!user) {
    throw new Error('Please sign in or register to submit a rating and review.');
  }

  if (rating < 1 || rating > 5) {
    throw new Error('Please select a star rating between 1 and 5.');
  }

  const validation = validateReviewComment(comment);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid review text.');
  }

  const cleanSlug = slug.toLowerCase().trim();
  const userName = profile?.displayName || user.displayName || user.email?.split('@')[0] || 'Verified Creator';
  const userEmail = user.email || '';

  const reviewDocId = `rev_${user.uid}_${cleanSlug}`.replace(/[^a-zA-Z0-9_]/g, '_');

  const reviewData: UserReview = {
    id: reviewDocId,
    slug: cleanSlug,
    inExt: inExt.toLowerCase(),
    outExt: outExt.toLowerCase(),
    userId: user.uid,
    userEmail,
    userName,
    rating,
    comment: validation.cleanText,
    status: 'pending', // Strictly pending until admin approval
    createdAt: { seconds: Math.floor(Date.now() / 1000) },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) }
  };

  // 1. Save to Local Storage Master Store
  const localList = getStoredLocalReviews();
  const existingIdx = localList.findIndex(r => r.id === reviewDocId || (r.userId === user.uid && r.slug === cleanSlug));
  if (existingIdx >= 0) {
    localList[existingIdx] = reviewData;
  } else {
    localList.unshift(reviewData);
  }
  saveStoredLocalReviews(localList);

  // 2. Save to Firestore if available
  if (hasFirebaseConfig && db) {
    try {
      const docRef = doc(db, 'reviews', reviewDocId);
      await setDoc(docRef, {
        ...reviewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err: any) {
      console.warn('Firestore review save sync note:', err);
    }
  }

  return {
    success: true,
    review: reviewData,
    message: 'Your review has been successfully submitted! It is now pending admin moderation and will appear publicly once approved.'
  };
}

/**
 * ADMIN ONLY: Fetch all reviews (pending, approved, rejected)
 */
export async function fetchAllReviewsForAdmin(): Promise<UserReview[]> {
  const localReviews = getStoredLocalReviews();
  const map = new Map<string, UserReview>();

  localReviews.forEach(r => {
    if (r.id) map.set(r.id, r);
  });

  if (hasFirebaseConfig && db) {
    try {
      const reviewsRef = collection(db, 'reviews');
      const snap = await getDocs(reviewsRef);
      snap.forEach(docSnap => {
        const data = docSnap.data() as UserReview;
        map.set(docSnap.id, {
          id: docSnap.id,
          ...data
        });
      });
    } catch (err: any) {
      console.warn('Failed to fetch reviews from Firestore for admin:', err);
    }
  }

  const results = Array.from(map.values());

  // Sort: Pending first, then by date descending
  results.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    const timeA = typeof a.createdAt?.seconds === 'number' 
      ? a.createdAt.seconds 
      : (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() / 1000 : 0);
    const timeB = typeof b.createdAt?.seconds === 'number' 
      ? b.createdAt.seconds 
      : (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() / 1000 : 0);
    return timeB - timeA;
  });

  return results;
}

/**
 * ADMIN ONLY: Moderate review status (approve or reject)
 */
export async function moderateReviewStatus(reviewId: string, status: ReviewStatus): Promise<void> {
  // 1. Update local repository
  const localList = getStoredLocalReviews();
  const item = localList.find(r => r.id === reviewId);
  if (item) {
    item.status = status;
    item.updatedAt = { seconds: Math.floor(Date.now() / 1000) };
    saveStoredLocalReviews(localList);
  }

  // 2. Update Firestore if available
  if (hasFirebaseConfig && db) {
    try {
      const docRef = doc(db, 'reviews', reviewId);
      await setDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore review status update note:', err);
    }
  }
}

/**
 * ADMIN ONLY: Delete review permanently
 */
export async function deleteReviewById(reviewId: string): Promise<void> {
  // 1. Delete from local repository
  let localList = getStoredLocalReviews();
  localList = localList.filter(r => r.id !== reviewId);
  saveStoredLocalReviews(localList);

  // 2. Delete from Firestore if available
  if (hasFirebaseConfig && db) {
    try {
      const docRef = doc(db, 'reviews', reviewId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore review delete note:', err);
    }
  }
}
