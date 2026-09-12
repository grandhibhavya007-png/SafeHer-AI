import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors'; // <--- I ADDED THIS HERE FOR YOU
import { createServer as createViteServer } from 'vite';
import {
  createUser,
  findUserByEmail,
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getStats,
  getDatabase
} from './server/db';
import { analyzeIncidentAI } from './server/gemini';

dotenv.config();

// ==========================================
// NEW: SMART EMERGENCY CALL HELPERS
// ==========================================
type CallStatus = 'answered' | 'no-answer' | 'failed';

const makePhoneCall = async (phoneNumber: string, timeoutSeconds: number): Promise<CallStatus> => {
    console.log(`Dialing ${phoneNumber} with a ${timeoutSeconds}s limit...`);
    return new Promise((resolve) => {
        setTimeout(() => resolve('no-answer'), 2000); // Mocking a missed call for testing
    });
};

const triggerSosSequence = async (sosNumbers: string[]): Promise<void> => {
    for (const number of sosNumbers) {
        console.log(`Trying SOS contact: ${number}`);
        const status = await makePhoneCall(number, 20);
        if (status === 'answered') break;
    }
};

const handleEmergencyCall = async (parentNumber: string, sosContacts: string[]): Promise<void> => {
    const parentCallStatus = await makePhoneCall(parentNumber, 30);
    if (parentCallStatus === 'no-answer' || parentCallStatus === 'failed') {
        await triggerSosSequence(sosContacts);
    }
};
// ==========================================

async function startServer() {
  // Initialize SQLite database on startup
  await getDatabase();

  const app = express();
  const PORT = 3000;

  app.use(cors()); // <--- I ADDED THIS HERE FOR YOU
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // 1. Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString(), platform: 'SafeHer AI' });
  });

  // 2. Authentication routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password, phone, role, emergencyContactName, emergencyContactPhone } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required.' });
      }

      const existing = await findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newUser = await createUser({
        id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password || 'safeher123',
        phone: phone || '',
        role: role === 'admin' ? 'admin' : 'citizen',
        emergencyContactName: emergencyContactName || '',
        emergencyContactPhone: emergencyContactPhone || '',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
      });

      res.status(201).json({ user: newUser });
    } catch (err: any) {
      console.error('Error in /api/auth/register:', err);
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      let user = await findUserByEmail(email);

      // Auto provision demo citizen or admin if logging in with test emails
      if (!user) {
        const isDefaultAdmin = email.toLowerCase().includes('admin');
        user = await createUser({
          id: `usr_${Date.now()}`,
          name: isDefaultAdmin ? 'Admin Lead' : email.split('@')[0],
          email: email.toLowerCase(),
          password: password || 'safeher123',
          role: isDefaultAdmin ? 'admin' : 'citizen',
          phone: '+91 98765 00000',
          emergencyContactName: 'Family Contact',
          emergencyContactPhone: '+91 98765 99999'
        });
      }

      res.json({ user, token: `demo_token_${user.id}` });
    } catch (err: any) {
      console.error('Error in /api/auth/login:', err);
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  // 3. AI / NLP Incident Analysis Route
  app.post('/api/ai/analyze', async (req: Request, res: Response) => {
    try {
      const { inputType, rawInput, callDetails } = req.body;

      if (!rawInput || !rawInput.trim()) {
        return res.status(400).json({ error: 'Incident narrative or transcript is required for AI analysis.' });
      }

      const analysis = await analyzeIncidentAI(
        inputType || 'text',
        rawInput.trim(),
        callDetails
      );

      res.json({ analysis });
    } catch (err: any) {
      console.error('Error in /api/ai/analyze:', err);
      res.status(500).json({ error: err.message || 'AI analysis failed' });
    }
  });

  // 4. Reverse Geocoding helper
  app.post('/api/geocode/reverse', async (req: Request, res: Response) => {
    try {
      const { latitude, longitude } = req.body;
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ error: 'Invalid coordinates' });
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'SafeHer-AI-SafetyApp/1.0',
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const displayAddress = data.display_name || `${data.address?.road || 'Local Road'}, ${data.address?.city || data.address?.town || 'Area'}`;
          return res.json({ address: displayAddress, raw: data });
        }
      } catch (osmErr) {
        console.warn('OSM Nominatim reverse geocode failed, using coordinates format:', osmErr);
      }

      res.json({
        address: `Lat: ${latitude.toFixed(5)}, Long: ${longitude.toFixed(5)} (GPS Coordinates Verified)`
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Reverse geocode failed' });
    }
  });

  // 5. Complaints Routes
  app.get('/api/complaints', async (req: Request, res: Response) => {
    try {
      const { userId, category, priority, status, search } = req.query;
      const complaints = await getComplaints({
        userId: userId ? String(userId) : undefined,
        category: category ? String(category) : undefined,
        priority: priority ? String(priority) : undefined,
        status: status ? String(status) : undefined,
        search: search ? String(search) : undefined
      });
      res.json({ complaints });
    } catch (err: any) {
      console.error('Error in GET /api/complaints:', err);
      res.status(500).json({ error: 'Failed to fetch complaints' });
    }
  });

  app.get('/api/complaints/:id', async (req: Request, res: Response) => {
    try {
      const complaint = await getComplaintById(req.params.id);
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      res.json({ complaint });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch complaint' });
    }
  });

  app.post('/api/complaints', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body.rawInput || !body.category || !body.priority || !body.summary) {
        return res.status(400).json({ error: 'Missing required complaint fields (rawInput, category, priority, summary)' });
      }

      const newComplaint = await createComplaint({
        userId: body.userId || 'usr_anonymous',
        userName: body.userName || 'Citizen User',
        userEmail: body.userEmail || 'anonymous@safeher.org',
        userPhone: body.userPhone || '',
        inputType: body.inputType || 'text',
        rawInput: body.rawInput,
        callDetails: body.callDetails,
        audioDurationSec: body.audioDurationSec || 0,
        category: body.category,
        priority: body.priority,
        summary: body.summary,
        riskAssessment: body.riskAssessment,
        suggestedAction: body.suggestedAction,
        extractedEntities: body.extractedEntities,
        locationShared: Boolean(body.locationShared),
        latitude: body.latitude,
        longitude: body.longitude,
        addressText: body.addressText,
        incidentDate: body.incidentDate || new Date().toISOString().split('T')[0],
        incidentTime: body.incidentTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAnonymous: Boolean(body.isAnonymous),
        notifyEmergencyContact: Boolean(body.notifyEmergencyContact),
        assignedOfficer: body.assignedOfficer || '',
        adminNotes: body.adminNotes || ''
      });

      res.status(201).json({ complaint: newComplaint });
    } catch (err: any) {
      console.error('Error in POST /api/complaints:', err);
      res.status(500).json({ error: err.message || 'Failed to submit complaint' });
    }
  });

  app.patch('/api/complaints/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, assignedOfficer, adminNotes, category, priority, summary, actorName, actorRole } = req.body;

      const updated = await updateComplaint(
        id,
        { status, assignedOfficer, adminNotes, category, priority, summary },
        actorName || 'Admin Operator',
        actorRole || 'admin'
      );

      if (!updated) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      res.json({ complaint: updated });
    } catch (err: any) {
      console.error('Error updating complaint:', err);
      res.status(500).json({ error: 'Failed to update complaint' });
    }
  });

  app.delete('/api/complaints/:id', async (req: Request, res: Response) => {
    try {
      await deleteComplaint(req.params.id);
      res.json({ success: true, message: 'Complaint deleted' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete complaint' });
    }
  });

  // 6. Analytics Stats
  app.get('/api/stats', async (req: Request, res: Response) => {
    try {
      const stats = await getStats();
      res.json({ stats });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to compute stats' });
    }
  });

  // ==========================================
  // NEW: EMERGENCY SEQUENCE ENDPOINT
  // ==========================================
  app.post('/api/trigger-emergency', async (req: Request, res: Response) => {
    const { parentNumber } = req.body;
    const emergencySosContacts = ["112", "100", "+919998887776"]; 

    try {
        await handleEmergencyCall(parentNumber, emergencySosContacts);
        res.status(200).json({ message: "Emergency sequence completed" });
    } catch (error) {
        res.status(500).json({ error: "Failed to initiate sequence" });
    }
  });
  // ==========================================


  // Vite Middleware for SPA Frontend
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SafeHer AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});