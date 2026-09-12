export type UserRole = 'citizen' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type InputType = 'text' | 'voice' | 'phone_call';

export type IncidentCategory =
  | 'Harassment'
  | 'Stalking'
  | 'Domestic Violence'
  | 'Workplace Misconduct'
  | 'Public Transit Safety'
  | 'Cyber Threat & Blackmail'
  | 'Physical Assault'
  | 'Suspicious Activity'
  | 'Emergency Distress'
  | 'Other';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Action Dispatched'
  | 'Resolved'
  | 'Closed';

export interface CallDetails {
  callerNumber?: string;
  callTime?: string;
  callDuration?: string;
  threatType?: string;
  suspiciousVoiceDetails?: string;
  audioRecordingSimulated?: boolean;
}

export interface ComplaintLog {
  id: string;
  complaintId: string;
  actorName: string;
  actorRole: UserRole;
  actionType: string;
  message: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  trackingNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  inputType: InputType;
  rawInput: string;
  callDetails?: CallDetails;
  audioDurationSec?: number;
  category: IncidentCategory;
  priority: PriorityLevel;
  summary: string;
  riskAssessment?: string;
  suggestedAction?: string;
  extractedEntities?: {
    people?: string[];
    locations?: string[];
    vehicles?: string[];
    times?: string[];
  };
  locationShared: boolean;
  latitude?: number;
  longitude?: number;
  addressText?: string;
  incidentDate: string;
  incidentTime: string;
  isAnonymous: boolean;
  notifyEmergencyContact: boolean;
  status: ComplaintStatus;
  assignedOfficer?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  logs?: ComplaintLog[];
}

export interface AIAnalysisResult {
  category: IncidentCategory;
  priority: PriorityLevel;
  summary: string;
  riskAssessment: string;
  suggestedAction: string;
  extractedEntities: {
    people: string[];
    locations: string[];
    vehicles: string[];
    times: string[];
  };
  threatIndicators: string[];
  confidenceScore: number;
}
