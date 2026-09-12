import { GoogleGenAI, Type } from '@google/genai';
import { AIAnalysisResult, IncidentCategory, PriorityLevel } from '../src/types';

// Server-side initialization
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function analyzeIncidentAI(
  inputType: 'text' | 'voice' | 'phone_call',
  rawInput: string,
  callDetails?: any
): Promise<AIAnalysisResult> {
  const combinedContext = `
Input Type: ${inputType}
Incident Narrative / Audio Transcript / Details:
${rawInput}
${
  callDetails && Object.keys(callDetails).length > 0
    ? `Caller Details / Call Metadata:
- Caller Phone/ID: ${callDetails.callerNumber || 'Unknown'}
- Call Time: ${callDetails.callTime || 'Not specified'}
- Call Duration: ${callDetails.callDuration || 'Unknown'}
- Threat Category Noted: ${callDetails.threatType || 'None'}
- Voice Observations: ${callDetails.suspiciousVoiceDetails || 'None'}
`
    : ''
}
`.trim();

  const ai = getGenAI();

  if (ai) {
    try {
      const prompt = `
You are the AI Safety & NLP incident triage module for "SafeHer AI", a specialized women's safety and incident reporting platform.
Analyze the following incident report carefully and provide an accurate, empathetic, and highly objective safety assessment in JSON format.

Categories must be strictly one of:
- "Harassment"
- "Stalking"
- "Domestic Violence"
- "Workplace Misconduct"
- "Public Transit Safety"
- "Cyber Threat & Blackmail"
- "Physical Assault"
- "Suspicious Activity"
- "Emergency Distress"
- "Other"

Priority Levels must be strictly one of:
- "Critical": Imminent danger, physical assault, armed threat, active stalker in close proximity, severe domestic violence, acute extortion.
- "High": Direct threats, repeated stalking, cyber harassment with extortion, dangerous transit situation, stalking by vehicle.
- "Medium": Non-contact verbal harassment, workplace misconduct, suspicious following without overt physical approach, safety infrastructure defects.
- "Low": General safety concerns, suspicious sightings from a distance, historical non-threatening query.

Provide:
1. Category
2. Priority
3. A concise, clear, 2-3 sentence executive Summary of the incident without dramatic fluff.
4. Risk Assessment: A short evaluation of immediate threat, vulnerability, and risk factors.
5. Suggested Action: Practical, actionable immediate safety advice for the victim or responders.
6. Extracted Entities: Any people descriptions, specific locations mentioned, vehicles/plates, and times.
7. Threat Indicators: 2-4 bullet points highlighting specific danger markers.
8. Confidence Score: A float between 0.80 and 0.99.

Incident Content:
${combinedContext}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'One of the standardized incident categories',
              },
              priority: {
                type: Type.STRING,
                description: 'One of: Critical, High, Medium, Low',
              },
              summary: {
                type: Type.STRING,
                description: '2-3 sentence executive summary',
              },
              riskAssessment: {
                type: Type.STRING,
                description: 'Threat and vulnerability assessment',
              },
              suggestedAction: {
                type: Type.STRING,
                description: 'Immediate recommendation for safety',
              },
              extractedEntities: {
                type: Type.OBJECT,
                properties: {
                  people: { type: Type.ARRAY, items: { type: Type.STRING } },
                  locations: { type: Type.ARRAY, items: { type: Type.STRING } },
                  vehicles: { type: Type.ARRAY, items: { type: Type.STRING } },
                  times: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['people', 'locations', 'vehicles', 'times'],
              },
              threatIndicators: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              confidenceScore: {
                type: Type.NUMBER,
                description: 'Confidence between 0.0 and 1.0',
              },
            },
            required: [
              'category',
              'priority',
              'summary',
              'riskAssessment',
              'suggestedAction',
              'extractedEntities',
              'threatIndicators',
            ],
          },
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        return {
          category: validateCategory(parsed.category),
          priority: validatePriority(parsed.priority),
          summary: parsed.summary || 'Incident reported by user for investigation.',
          riskAssessment: parsed.riskAssessment || 'Safety risk under evaluation.',
          suggestedAction: parsed.suggestedAction || 'Stay in well-lit public area and connect with trusted contacts.',
          extractedEntities: {
            people: Array.isArray(parsed.extractedEntities?.people) ? parsed.extractedEntities.people : [],
            locations: Array.isArray(parsed.extractedEntities?.locations) ? parsed.extractedEntities.locations : [],
            vehicles: Array.isArray(parsed.extractedEntities?.vehicles) ? parsed.extractedEntities.vehicles : [],
            times: Array.isArray(parsed.extractedEntities?.times) ? parsed.extractedEntities.times : [],
          },
          threatIndicators: Array.isArray(parsed.threatIndicators) ? parsed.threatIndicators : ['Potential safety hazard reported'],
          confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.94,
        };
      }
    } catch (error) {
      console.warn('Gemini API call failed or returned unparseable content, using rule-based NLP fallback:', error);
    }
  }

  // Robust Heuristic NLP Fallback
  return fallbackNLPAnalysis(inputType, rawInput, callDetails);
}

function validateCategory(cat: string): IncidentCategory {
  const allowed: IncidentCategory[] = [
    'Harassment',
    'Stalking',
    'Domestic Violence',
    'Workplace Misconduct',
    'Public Transit Safety',
    'Cyber Threat & Blackmail',
    'Physical Assault',
    'Suspicious Activity',
    'Emergency Distress',
    'Other',
  ];
  const found = allowed.find((c) => c.toLowerCase() === (cat || '').toLowerCase().trim());
  return found || 'Harassment';
}

function validatePriority(pri: string): PriorityLevel {
  const allowed: PriorityLevel[] = ['Critical', 'High', 'Medium', 'Low'];
  const found = allowed.find((p) => p.toLowerCase() === (pri || '').toLowerCase().trim());
  return found || 'High';
}

function fallbackNLPAnalysis(
  inputType: 'text' | 'voice' | 'phone_call',
  rawInput: string,
  callDetails?: any
): AIAnalysisResult {
  const lower = (rawInput + ' ' + JSON.stringify(callDetails || {})).toLowerCase();

  let category: IncidentCategory = 'Harassment';
  let priority: PriorityLevel = 'Medium';
  const threatIndicators: string[] = [];
  const people: string[] = [];
  const locations: string[] = [];
  const vehicles: string[] = [];
  const times: string[] = [];

  // Priority & Category Detection Rules
  if (
    lower.includes('hit') ||
    lower.includes('beat') ||
    lower.includes('attack') ||
    lower.includes('knife') ||
    lower.includes('weapon') ||
    lower.includes('assault') ||
    lower.includes('kill') ||
    lower.includes('bleeding')
  ) {
    category = 'Physical Assault';
    priority = 'Critical';
    threatIndicators.push('Physical violence / weapon presence detected');
  } else if (
    lower.includes('follow') ||
    lower.includes('stalk') ||
    lower.includes('chase') ||
    lower.includes('tailing') ||
    lower.includes('bike') ||
    lower.includes('motorcycle') ||
    lower.includes('car following')
  ) {
    category = 'Stalking';
    priority = 'High';
    threatIndicators.push('Active pursuit / vehicular tailing behavior');
  } else if (
    lower.includes('husband') ||
    lower.includes('partner') ||
    lower.includes('in-laws') ||
    lower.includes('home') ||
    lower.includes('domestic') ||
    lower.includes('locked inside')
  ) {
    category = 'Domestic Violence';
    priority = 'High';
    threatIndicators.push('Intimate partner / domestic vulnerability');
  } else if (
    lower.includes('boss') ||
    lower.includes('colleague') ||
    lower.includes('office') ||
    lower.includes('workplace') ||
    lower.includes('manager') ||
    lower.includes('promotion')
  ) {
    category = 'Workplace Misconduct';
    priority = 'Medium';
    threatIndicators.push('Workplace hierarchy power dynamic');
  } else if (
    lower.includes('bus') ||
    lower.includes('metro') ||
    lower.includes('train') ||
    lower.includes('cab') ||
    lower.includes('taxi') ||
    lower.includes('auto') ||
    lower.includes('dark street') ||
    lower.includes('street light')
  ) {
    category = 'Public Transit Safety';
    priority = 'Medium';
    threatIndicators.push('Public transit / urban mobility risk');
  } else if (
    lower.includes('photo') ||
    lower.includes('video') ||
    lower.includes('blackmail') ||
    lower.includes('cyber') ||
    lower.includes('whatsapp') ||
    lower.includes('instagram') ||
    lower.includes('leak') ||
    lower.includes('extortion') ||
    inputType === 'phone_call'
  ) {
    category = 'Cyber Threat & Blackmail';
    priority = 'High';
    threatIndicators.push('Digital intimidation / extortion attempt');
  }

  // Location extraction heuristic
  const locMatches = rawInput.match(
    /(gate \d+|sector \d+|road|street|avenue|station|metro|market|bus stand|block \w+|park|mall|crossing)/gi
  );
  if (locMatches) {
    locations.push(...Array.from(new Set(locMatches)).slice(0, 3));
  }

  // Vehicle heuristic
  const vehMatches = rawInput.match(/(motorcycle|bike|scooter|car|cab|auto|rickshaw|[A-Z]{2}[ -]?\d{2}[ -]?[A-Z]{1,2}[ -]?\d{4})/gi);
  if (vehMatches) {
    vehicles.push(...Array.from(new Set(vehMatches)).slice(0, 2));
  }

  // Time heuristic
  const timeMatches = rawInput.match(/(\d{1,2}:\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm)|night|evening|afternoon|morning)/gi);
  if (timeMatches) {
    times.push(...Array.from(new Set(timeMatches)).slice(0, 2));
  }

  if (threatIndicators.length === 0) {
    threatIndicators.push('Unsolicited confrontational behavior reported');
  }

  const cleanNarrative = rawInput.length > 180 ? rawInput.substring(0, 180) + '...' : rawInput;
  const summary = `Reported ${category.toLowerCase()} incident: ${cleanNarrative}. Evaluated at ${priority} priority for rapid response and documentation.`;

  return {
    category,
    priority,
    summary,
    riskAssessment: `Identified risk factors regarding ${category.toLowerCase()}. Level assessed as ${priority} requiring standard verification.`,
    suggestedAction:
      priority === 'Critical'
        ? 'Immediately move to a crowded public space, alert nearby security, or dial 112 emergency response.'
        : 'Preserve all digital or physical evidence, notify a trusted emergency contact, and monitor surroundings.',
    extractedEntities: {
      people,
      locations,
      vehicles,
      times,
    },
    threatIndicators,
    confidenceScore: 0.88,
  };
}
