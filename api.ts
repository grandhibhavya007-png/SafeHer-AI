import { AIAnalysisResult, Complaint, User } from '../types';

export const API_BASE = '/api';

export async function loginUser(email: string, password?: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to sign in');
  }
  return res.json();
}

export async function registerUser(userData: {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: 'citizen' | 'admin';
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create account');
  }
  return res.json();
}

export async function analyzeIncident(
  inputType: 'text' | 'voice' | 'phone_call',
  rawInput: string,
  callDetails?: any
): Promise<AIAnalysisResult> {
  const res = await fetch(`${API_BASE}/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputType, rawInput, callDetails }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'AI analysis failed');
  }
  const data = await res.json();
  return data.analysis;
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/geocode/reverse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.address;
    }
  } catch (e) {
    console.warn('Geocoding request failed:', e);
  }
  return `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

export async function submitComplaint(payload: Partial<Complaint>): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit report');
  }
  const data = await res.json();
  return data.complaint;
}

export async function fetchComplaints(params?: {
  userId?: string;
  category?: string;
  priority?: string;
  status?: string;
  search?: string;
}): Promise<Complaint[]> {
  const query = new URLSearchParams();
  if (params?.userId) query.append('userId', params.userId);
  if (params?.category && params.category !== 'All') query.append('category', params.category);
  if (params?.priority && params.priority !== 'All') query.append('priority', params.priority);
  if (params?.status && params.status !== 'All') query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/complaints?${query.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch complaints');
  }
  const data = await res.json();
  return data.complaints || [];
}

export async function fetchComplaintById(id: string): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints/${id}`);
  if (!res.ok) {
    throw new Error('Complaint not found');
  }
  const data = await res.json();
  return data.complaint;
}

export async function updateComplaintStatus(
  id: string,
  updates: Partial<Complaint>,
  actorName: string = 'Admin',
  actorRole: 'citizen' | 'admin' = 'admin'
): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...updates, actorName, actorRole }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update complaint');
  }
  const data = await res.json();
  return data.complaint;
}

export async function deleteComplaint(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete complaint');
  }
  return true;
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem('safeher_current_user');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem('safeher_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('safeher_current_user');
  }
}

export async function fetchStats(): Promise<{
  total: number;
  critical: number;
  high: number;
  underReview: number;
  actionDispatched: number;
  resolved: number;
  byCategory: Record<string, number>;
}> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) {
    throw new Error('Failed to fetch analytics');
  }
  const data = await res.json();
  return data.stats;
}