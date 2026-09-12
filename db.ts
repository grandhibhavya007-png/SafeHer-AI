import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import { Complaint, ComplaintLog, User } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'safeher.sqlite');
const BACKUP_JSON_FILE = path.join(DATA_DIR, 'safeher_backup.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const filebuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(filebuffer);
      console.log('Loaded existing SQLite database from disk.');
    } catch (e) {
      console.warn('Error reading SQLite file, initializing new database:', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
    console.log('Created fresh in-memory SQLite database.');
  }

  // Create tables if not exist
  initSchema(dbInstance);
  seedInitialData(dbInstance);
  saveDatabase(dbInstance);

  return dbInstance;
}

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'citizen',
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      tracking_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_phone TEXT,
      input_type TEXT NOT NULL,
      raw_input TEXT NOT NULL,
      call_details TEXT,
      audio_duration_sec REAL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      summary TEXT NOT NULL,
      risk_assessment TEXT,
      suggested_action TEXT,
      extracted_entities TEXT,
      location_shared INTEGER NOT NULL DEFAULT 0,
      latitude REAL,
      longitude REAL,
      address_text TEXT,
      incident_date TEXT NOT NULL,
      incident_time TEXT NOT NULL,
      is_anonymous INTEGER NOT NULL DEFAULT 0,
      notify_emergency_contact INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Submitted',
      assigned_officer TEXT,
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS complaint_logs (
      id TEXT PRIMARY KEY,
      complaint_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action_type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
    );
  `);
}

function seedInitialData(db: Database) {
  const userCheck = db.exec("SELECT COUNT(*) as count FROM users");
  const count = userCheck[0]?.values[0]?.[0] as number;

  if (count === 0) {
    console.log('Seeding initial demo users and sample verified complaints...');
    
    // Seed default citizen and admin
    db.run(
      `INSERT INTO users (id, name, email, password, phone, role, emergency_contact_name, emergency_contact_phone, avatar_url, created_at)
       VALUES 
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'usr_citizen_1',
        'Priya Sharma',
        'priya@example.com',
        'safeher123',
        '+91 98765 43210',
        'citizen',
        'Anita Sharma (Mother)',
        '+91 98765 00001',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        new Date(Date.now() - 86400000 * 7).toISOString(),

        'usr_admin_1',
        'Inspector Inspector R. Varma',
        'admin@safeher.org',
        'admin123',
        '+91 94444 11111',
        'admin',
        'HQ Dispatch Unit',
        '112',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        new Date(Date.now() - 86400000 * 30).toISOString()
      ]
    );

    // Seed sample complaints for rich showcase
    const sampleComplaints: Array<{
      id: string;
      tracking_number: string;
      user_id: string;
      user_name: string;
      user_email: string;
      user_phone: string;
      input_type: string;
      raw_input: string;
      call_details: string;
      audio_duration_sec: number;
      category: string;
      priority: string;
      summary: string;
      risk_assessment: string;
      suggested_action: string;
      extracted_entities: string;
      location_shared: number;
      latitude: number;
      longitude: number;
      address_text: string;
      incident_date: string;
      incident_time: string;
      is_anonymous: number;
      notify_emergency_contact: number;
      status: string;
      assigned_officer: string;
      admin_notes: string;
      created_at: string;
      updated_at: string;
    }> = [
      {
        id: 'cmp_sample_1',
        tracking_number: 'SH-2026-9102',
        user_id: 'usr_citizen_1',
        user_name: 'Priya Sharma',
        user_email: 'priya@example.com',
        user_phone: '+91 98765 43210',
        input_type: 'voice',
        raw_input: "I was waiting at the metro station exit gate 3 around 9:30 PM. A group of two men on a black motorcycle (licence plate partly seen: DL-04) started circling back, passing vulgar remarks and following me along the dimly lit lane towards Sector 14 market.",
        call_details: JSON.stringify({}),
        audio_duration_sec: 28,
        category: 'Stalking',
        priority: 'High',
        summary: 'Targeted verbal harassment and vehicular stalking by two individuals on a motorcycle near Metro Station Gate 3 towards Sector 14.',
        risk_assessment: 'Active stalking behavior in poorly lit transit corridor with motor vehicle involvement.',
        suggested_action: 'Alert transit beat patrol and review CCTV footage at Metro Exit 3.',
        extracted_entities: JSON.stringify({
          people: ['Two unidentified men on motorcycle'],
          locations: ['Metro Station Exit Gate 3', 'Sector 14 market corridor'],
          vehicles: ['Black motorcycle (partial plate DL-04)'],
          times: ['9:30 PM']
        }),
        location_shared: 1,
        latitude: 28.5355,
        longitude: 77.3910,
        address_text: 'Gate 3, Botanical Garden Metro, Noida / New Delhi NCR',
        incident_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        incident_time: '21:30',
        is_anonymous: 0,
        notify_emergency_contact: 1,
        status: 'Action Dispatched',
        assigned_officer: 'Sub-Inspector Meera Nair (PCR Van #12)',
        admin_notes: 'PCR Van #12 dispatched to patrol the Sector 14 corridor. Station CCTV footage requested.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'cmp_sample_2',
        tracking_number: 'SH-2026-8841',
        user_id: 'usr_citizen_1',
        user_name: 'Priya Sharma',
        user_email: 'priya@example.com',
        user_phone: '+91 98765 43210',
        input_type: 'phone_call',
        raw_input: "Received 6 anonymous threatening phone calls from an unknown spoofed number +91 90000 88888 demanding personal photos and threatening social media defamation if I do not comply.",
        call_details: JSON.stringify({
          callerNumber: '+91 90000 88888',
          callTime: '14:15 PM',
          callDuration: '3 min 12 sec',
          threatType: 'Cyber Blackmail & Extortion',
          suspiciousVoiceDetails: 'Male caller with distorted voice filter',
          audioRecordingSimulated: true
        }),
        audio_duration_sec: 192,
        category: 'Cyber Threat & Blackmail',
        priority: 'Critical',
        summary: 'Repeated extortion and cyber blackmail calls from spoofed caller threatening image manipulation and online harassment.',
        risk_assessment: 'Immediate digital threat and blackmail. High psychological intimidation requiring cyber cell intervention.',
        suggested_action: 'Preserve call metadata, do not engage, escalate to Cyber Crime Cell for CDR analysis.',
        extracted_entities: JSON.stringify({
          people: ['Anonymous caller using voice modulator'],
          locations: ['Digital/Telephonic'],
          vehicles: [],
          times: ['Multiple calls throughout the afternoon']
        }),
        location_shared: 0,
        latitude: 0,
        longitude: 0,
        address_text: 'Location omitted by user (Cyber Incident)',
        incident_date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
        incident_time: '14:15',
        is_anonymous: 0,
        notify_emergency_contact: 0,
        status: 'Under Review',
        assigned_officer: 'Inspector Rajesh (Cyber Cell Unit 4)',
        admin_notes: 'Call log analysis initiated with telecom liaison.',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 0.5).toISOString(),
      },
      {
        id: 'cmp_sample_3',
        tracking_number: 'SH-2026-7650',
        user_id: 'usr_citizen_2',
        user_name: 'Ananya Roy',
        user_email: 'ananya@example.com',
        user_phone: '+91 98111 22233',
        input_type: 'text',
        raw_input: "Street lights have been broken for 3 weeks on 5th Cross Road between the tech park bus stop and residential colony. Isolated stretch with repeated catcalling incidents reported by female commuters.",
        call_details: JSON.stringify({}),
        audio_duration_sec: 0,
        category: 'Public Transit Safety',
        priority: 'Medium',
        summary: 'Infrastructure safety hazard and repeated street harassment due to non-functional street lighting along 5th Cross Road corridor.',
        risk_assessment: 'Environmental safety vulnerability enabling repeated street harassment during evening commute.',
        suggested_action: 'Notify municipal corporation electrical wing and increase beat police rounds between 7 PM - 11 PM.',
        extracted_entities: JSON.stringify({
          people: ['Multiple female commuters affected'],
          locations: ['5th Cross Road, Tech Park to Residential Block'],
          vehicles: [],
          times: ['Evening hours (7:00 PM - 11:00 PM)']
        }),
        location_shared: 1,
        latitude: 12.9716,
        longitude: 77.5946,
        address_text: '5th Cross Road, Outer Ring Road Corridor, Bengaluru',
        incident_date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
        incident_time: '19:45',
        is_anonymous: 1,
        notify_emergency_contact: 0,
        status: 'Resolved',
        assigned_officer: 'City Safety Taskforce & Municipal Liaison',
        admin_notes: 'Street lights repaired by Municipal team on Aug 25. Regular patrol vehicle stationed during peak hours.',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      }
    ];

    for (const c of sampleComplaints) {
      db.run(
        `INSERT INTO complaints (
          id, tracking_number, user_id, user_name, user_email, user_phone,
          input_type, raw_input, call_details, audio_duration_sec,
          category, priority, summary, risk_assessment, suggested_action,
          extracted_entities, location_shared, latitude, longitude, address_text,
          incident_date, incident_time, is_anonymous, notify_emergency_contact,
          status, assigned_officer, admin_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id, c.tracking_number, c.user_id, c.user_name, c.user_email, c.user_phone,
          c.input_type, c.raw_input, c.call_details, c.audio_duration_sec,
          c.category, c.priority, c.summary, c.risk_assessment, c.suggested_action,
          c.extracted_entities, c.location_shared, c.latitude, c.longitude, c.address_text,
          c.incident_date, c.incident_time, c.is_anonymous, c.notify_emergency_contact,
          c.status, c.assigned_officer, c.admin_notes, c.created_at, c.updated_at
        ]
      );

      db.run(
        `INSERT INTO complaint_logs (id, complaint_id, actor_name, actor_role, action_type, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `log_${c.id}_1`,
          c.id,
          'SafeHer AI System',
          'admin',
          'SYSTEM_TRIAGE',
          `Incident analyzed and categorized as ${c.category} with ${c.priority} priority.`,
          c.created_at
        ]
      );
    }
  }
}

export function saveDatabase(db: Database) {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (e) {
    console.error('Error saving SQLite database to disk:', e);
  }
}

// User Helpers
export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDatabase();
  const stmt = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1");
  stmt.bind([email]);
  
  if (stmt.step()) {
    const row = stmt.getAsObject() as any;
    stmt.free();
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      emergencyContactName: row.emergency_contact_name,
      emergencyContactPhone: row.emergency_contact_phone,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at
    };
  }
  stmt.free();
  return null;
}

export async function createUser(user: Omit<User, 'createdAt'> & { password?: string }): Promise<User> {
  const db = await getDatabase();
  const createdAt = new Date().toISOString();
  
  db.run(
    `INSERT INTO users (id, name, email, password, phone, role, emergency_contact_name, emergency_contact_phone, avatar_url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.name,
      user.email,
      user.password || 'password123',
      user.phone || '',
      user.role || 'citizen',
      user.emergencyContactName || '',
      user.emergencyContactPhone || '',
      user.avatarUrl || '',
      createdAt
    ]
  );
  saveDatabase(db);

  return {
    ...user,
    createdAt
  };
}

// Complaints Helpers
export async function createComplaint(data: Omit<Complaint, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'status'> & { id?: string; trackingNumber?: string }): Promise<Complaint> {
  const db = await getDatabase();
  const id = data.id || `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const trackingNumber = data.trackingNumber || `SH-${new Date().getFullYear()}-${randomNum}`;
  const now = new Date().toISOString();
  const status = 'Submitted';

  db.run(
    `INSERT INTO complaints (
      id, tracking_number, user_id, user_name, user_email, user_phone,
      input_type, raw_input, call_details, audio_duration_sec,
      category, priority, summary, risk_assessment, suggested_action,
      extracted_entities, location_shared, latitude, longitude, address_text,
      incident_date, incident_time, is_anonymous, notify_emergency_contact,
      status, assigned_officer, admin_notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      trackingNumber,
      data.userId,
      data.userName,
      data.userEmail,
      data.userPhone || '',
      data.inputType,
      data.rawInput,
      data.callDetails ? JSON.stringify(data.callDetails) : '{}',
      data.audioDurationSec || 0,
      data.category,
      data.priority,
      data.summary,
      data.riskAssessment || '',
      data.suggestedAction || '',
      data.extractedEntities ? JSON.stringify(data.extractedEntities) : '{}',
      data.locationShared ? 1 : 0,
      data.latitude || 0,
      data.longitude || 0,
      data.addressText || '',
      data.incidentDate,
      data.incidentTime,
      data.isAnonymous ? 1 : 0,
      data.notifyEmergencyContact ? 1 : 0,
      status,
      data.assignedOfficer || '',
      data.adminNotes || '',
      now,
      now
    ]
  );

  // Add initial audit log
  db.run(
    `INSERT INTO complaint_logs (id, complaint_id, actor_name, actor_role, action_type, message, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      `log_${id}_1`,
      id,
      data.userName || 'Citizen',
      'citizen',
      'REPORT_SUBMITTED',
      `Incident report submitted with ${data.priority} priority under category ${data.category}.`,
      now
    ]
  );

  saveDatabase(db);

  return {
    ...data,
    id,
    trackingNumber,
    status,
    createdAt: now,
    updatedAt: now
  };
}

export async function getComplaints(filters?: {
  userId?: string;
  category?: string;
  priority?: string;
  status?: string;
  search?: string;
}): Promise<Complaint[]> {
  const db = await getDatabase();
  let query = "SELECT * FROM complaints WHERE 1=1";
  const params: any[] = [];

  if (filters?.userId) {
    query += " AND user_id = ?";
    params.push(filters.userId);
  }
  if (filters?.category && filters.category !== 'All') {
    query += " AND category = ?";
    params.push(filters.category);
  }
  if (filters?.priority && filters.priority !== 'All') {
    query += " AND priority = ?";
    params.push(filters.priority);
  }
  if (filters?.status && filters.status !== 'All') {
    query += " AND status = ?";
    params.push(filters.status);
  }
  if (filters?.search) {
    query += " AND (summary LIKE ? OR raw_input LIKE ? OR tracking_number LIKE ? OR address_text LIKE ?)";
    const term = `%${filters.search}%`;
    params.push(term, term, term, term);
  }

  query += " ORDER BY created_at DESC";

  const stmt = db.prepare(query);
  stmt.bind(params);

  const results: Complaint[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as any;
    let callDetails = undefined;
    let extractedEntities = undefined;
    try {
      if (row.call_details) callDetails = JSON.parse(row.call_details);
    } catch {}
    try {
      if (row.extracted_entities) extractedEntities = JSON.parse(row.extracted_entities);
    } catch {}

    results.push({
      id: row.id,
      trackingNumber: row.tracking_number,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userPhone: row.user_phone,
      inputType: row.input_type,
      rawInput: row.raw_input,
      callDetails,
      audioDurationSec: row.audio_duration_sec,
      category: row.category,
      priority: row.priority,
      summary: row.summary,
      riskAssessment: row.risk_assessment,
      suggestedAction: row.suggested_action,
      extractedEntities,
      locationShared: Boolean(row.location_shared),
      latitude: row.latitude,
      longitude: row.longitude,
      addressText: row.address_text,
      incidentDate: row.incident_date,
      incidentTime: row.incident_time,
      isAnonymous: Boolean(row.is_anonymous),
      notifyEmergencyContact: Boolean(row.notify_emergency_contact),
      status: row.status,
      assignedOfficer: row.assigned_officer,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
  stmt.free();
  return results;
}

export async function getComplaintById(id: string): Promise<Complaint | null> {
  const db = await getDatabase();
  const stmt = db.prepare("SELECT * FROM complaints WHERE id = ? OR tracking_number = ? LIMIT 1");
  stmt.bind([id, id]);

  if (stmt.step()) {
    const row = stmt.getAsObject() as any;
    stmt.free();

    let callDetails = undefined;
    let extractedEntities = undefined;
    try {
      if (row.call_details) callDetails = JSON.parse(row.call_details);
    } catch {}
    try {
      if (row.extracted_entities) extractedEntities = JSON.parse(row.extracted_entities);
    } catch {}

    // Get logs
    const logStmt = db.prepare("SELECT * FROM complaint_logs WHERE complaint_id = ? ORDER BY created_at ASC");
    logStmt.bind([row.id]);
    const logs: ComplaintLog[] = [];
    while (logStmt.step()) {
      const logRow = logStmt.getAsObject() as any;
      logs.push({
        id: logRow.id,
        complaintId: logRow.complaint_id,
        actorName: logRow.actor_name,
        actorRole: logRow.actor_role,
        actionType: logRow.action_type,
        message: logRow.message,
        createdAt: logRow.created_at
      });
    }
    logStmt.free();

    return {
      id: row.id,
      trackingNumber: row.tracking_number,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userPhone: row.user_phone,
      inputType: row.input_type,
      rawInput: row.raw_input,
      callDetails,
      audioDurationSec: row.audio_duration_sec,
      category: row.category,
      priority: row.priority,
      summary: row.summary,
      riskAssessment: row.risk_assessment,
      suggestedAction: row.suggested_action,
      extractedEntities,
      locationShared: Boolean(row.location_shared),
      latitude: row.latitude,
      longitude: row.longitude,
      addressText: row.address_text,
      incidentDate: row.incident_date,
      incidentTime: row.incident_time,
      isAnonymous: Boolean(row.is_anonymous),
      notifyEmergencyContact: Boolean(row.notify_emergency_contact),
      status: row.status,
      assignedOfficer: row.assigned_officer,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      logs
    };
  }
  stmt.free();
  return null;
}

export async function updateComplaint(
  id: string,
  updates: Partial<Complaint>,
  actorName: string = 'Admin',
  actorRole: 'citizen' | 'admin' = 'admin'
): Promise<Complaint | null> {
  const db = await getDatabase();
  const existing = await getComplaintById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const newStatus = updates.status || existing.status;
  const newAssignedOfficer = updates.assignedOfficer !== undefined ? updates.assignedOfficer : existing.assignedOfficer;
  const newAdminNotes = updates.adminNotes !== undefined ? updates.adminNotes : existing.adminNotes;
  const newCategory = updates.category || existing.category;
  const newPriority = updates.priority || existing.priority;
  const newSummary = updates.summary || existing.summary;

  db.run(
    `UPDATE complaints SET
      status = ?,
      assigned_officer = ?,
      admin_notes = ?,
      category = ?,
      priority = ?,
      summary = ?,
      updated_at = ?
     WHERE id = ?`,
    [newStatus, newAssignedOfficer, newAdminNotes, newCategory, newPriority, newSummary, now, id]
  );

  // Add audit log
  let logMsg = `Status updated to ${newStatus}.`;
  if (updates.assignedOfficer && updates.assignedOfficer !== existing.assignedOfficer) {
    logMsg += ` Assigned to: ${updates.assignedOfficer}.`;
  }
  if (updates.adminNotes && updates.adminNotes !== existing.adminNotes) {
    logMsg += ` Notes: ${updates.adminNotes.substring(0, 80)}`;
  }

  db.run(
    `INSERT INTO complaint_logs (id, complaint_id, actor_name, actor_role, action_type, message, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [`log_${id}_${Date.now()}`, id, actorName, actorRole, 'STATUS_UPDATE', logMsg, now]
  );

  saveDatabase(db);
  return getComplaintById(id);
}

export async function deleteComplaint(id: string): Promise<boolean> {
  const db = await getDatabase();
  db.run("DELETE FROM complaint_logs WHERE complaint_id = ?", [id]);
  db.run("DELETE FROM complaints WHERE id = ?", [id]);
  saveDatabase(db);
  return true;
}

export async function getStats(): Promise<{
  total: number;
  critical: number;
  high: number;
  underReview: number;
  actionDispatched: number;
  resolved: number;
  byCategory: Record<string, number>;
}> {
  const db = await getDatabase();
  const all = await getComplaints();

  const stats = {
    total: all.length,
    critical: all.filter(c => c.priority === 'Critical').length,
    high: all.filter(c => c.priority === 'High').length,
    underReview: all.filter(c => c.status === 'Under Review' || c.status === 'Submitted').length,
    actionDispatched: all.filter(c => c.status === 'Action Dispatched').length,
    resolved: all.filter(c => c.status === 'Resolved').length,
    byCategory: {} as Record<string, number>
  };

  for (const c of all) {
    stats.byCategory[c.category] = (stats.byCategory[c.category] || 0) + 1;
  }

  return stats;
}
