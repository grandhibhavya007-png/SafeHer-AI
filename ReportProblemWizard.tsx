import React, { useState } from 'react';
import { Sparkles, MessageSquare, Compass, FileCheck, CheckCircle2, Shield } from 'lucide-react';
import { AIAnalysisResult, CallDetails, Complaint, IncidentCategory, InputType, PriorityLevel, User } from '../../types';
import { analyzeIncident, submitComplaint } from '../../services/api';
import { IncidentInputStep } from './IncidentInputStep';
import { AIAnalysisStep } from './AIAnalysisStep';
import { LocationPermissionStep } from './LocationPermissionStep';
import { ReviewReportStep } from './ReviewReportStep';
import { SubmissionSuccessStep } from './SubmissionSuccessStep';

interface ReportProblemWizardProps {
  currentUser: User | null;
  onComplaintSubmitted: (complaint: Complaint) => void;
  onViewMyComplaints: () => void;
  onCancel: () => void;
}

export const ReportProblemWizard: React.FC<ReportProblemWizardProps> = ({
  currentUser,
  onComplaintSubmitted,
  onViewMyComplaints,
  onCancel,
}) => {
  
  // Wizard Step (1: Input, 2: AI Analysis, 3: Location, 4: Review, 5: Success)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form states
  const [inputType, setInputType] = useState<InputType>('text');
  const [rawInput, setRawInput] = useState('');
  const [callDetails, setCallDetails] = useState<CallDetails>({
    callerNumber: '',
    callDuration: '',
    threatType: 'Verbal Harassment',
    suspiciousVoiceDetails: '',
  });
  const [audioDurationSec, setAudioDurationSec] = useState(0);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Review / Edited fields
  const [category, setCategory] = useState<IncidentCategory>('Harassment');
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [summary, setSummary] = useState('');
  const [riskAssessment, setRiskAssessment] = useState('');
  const [suggestedAction, setSuggestedAction] = useState('');
  const [extractedEntities, setExtractedEntities] = useState<any>(null);

  // Location fields
  const [locationShared, setLocationShared] = useState(false);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [addressText, setAddressText] = useState('Location omitted by user choice');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // Safety preferences
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [notifyEmergencyContact, setNotifyEmergencyContact] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  const handleStartAIAnalysis = async () => {
    if (!rawInput.trim()) return;
    setCurrentStep(2);
    setIsAnalyzing(true);
    setAiError(null);

    try {
      const result = await analyzeIncident(inputType, rawInput, inputType === 'phone_call' ? callDetails : undefined);
      setAiAnalysis(result);
      setCategory(result.category);
      setPriority(result.priority);
      setSummary(result.summary);
      setRiskAssessment(result.riskAssessment);
      setSuggestedAction(result.suggestedAction);
      setExtractedEntities(result.extractedEntities);
    } catch (err: any) {
      setAiError(err.message || 'AI processing encountered an error.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: Partial<Complaint> = {
        userId: currentUser ? currentUser.id : 'usr_guest',
        userName: isAnonymous ? 'Anonymous Citizen' : currentUser ? currentUser.name : 'Citizen Reporter',
        userEmail: isAnonymous ? 'anonymous@safeher.org' : currentUser ? currentUser.email : 'guest@safeher.org',
        userPhone: currentUser?.phone || '',
        inputType,
        rawInput,
        callDetails: inputType === 'phone_call' ? callDetails : undefined,
        audioDurationSec,
        category,
        priority,
        summary,
        riskAssessment,
        suggestedAction,
        extractedEntities,
        locationShared,
        latitude,
        longitude,
        addressText: locationShared ? addressText : 'Location omitted by user consent',
        incidentDate,
        incidentTime,
        isAnonymous,
        notifyEmergencyContact,
      };

      const result = await submitComplaint(payload);
      setSubmittedComplaint(result);
      onComplaintSubmitted(result);
      setCurrentStep(5);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRawInput('');
    setCallDetails({ callerNumber: '', callDuration: '', threatType: 'Verbal Harassment', suspiciousVoiceDetails: '' });
    setAudioDurationSec(0);
    setAiAnalysis(null);
    setLocationShared(false);
    setLatitude(undefined);
    setLongitude(undefined);
    setAddressText('Location omitted by user choice');
    setSubmittedComplaint(null);
    setCurrentStep(1);
  };

  const stepsList = [
    { num: 1, label: 'Incident Input', icon: MessageSquare },
    { num: 2, label: 'AI Analysis', icon: Sparkles },
    { num: 3, label: 'Location Consent', icon: Compass },
    { num: 4, label: 'Review Report', icon: FileCheck },
    { num: 5, label: 'Submitted', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      {/* Stepper Progress Bar */}
      <div className="mb-8 bg-[#121217] p-4 sm:p-6 rounded-3xl border border-white/5">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-white/5 -z-0"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 transition-all duration-300 -z-0"
            style={{ width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%` }}
          ></div>

          {stepsList.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            const Icon = st.icon;

            return (
              <div key={st.num} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border transition-all ${
                    isCompleted
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/50'
                      : isCurrent
                      ? 'bg-[#1C1C24] border-indigo-500 text-indigo-400 ring-4 ring-indigo-500/20'
                      : 'bg-[#09090B] border-white/10 text-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold mt-2 hidden sm:block ${
                    isCurrent ? 'text-indigo-400 font-bold' : isCompleted ? 'text-gray-200' : 'text-gray-500'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Container Box */}
      <div className="bg-[#121217] border border-white/5 rounded-3xl p-5 sm:p-8 shadow-2xl">
        {currentStep === 1 && (
          <IncidentInputStep
            inputType={inputType}
            setInputType={setInputType}
            rawInput={rawInput}
            setRawInput={setRawInput}
            callDetails={callDetails}
            setCallDetails={setCallDetails}
            audioDurationSec={audioDurationSec}
            setAudioDurationSec={setAudioDurationSec}
            onProceedToAI={handleStartAIAnalysis}
          />
        )}

        {currentStep === 2 && (
          <AIAnalysisStep
            isLoading={isAnalyzing}
            analysis={aiAnalysis}
            error={aiError}
            onRetry={handleStartAIAnalysis}
            onProceedToLocation={() => setCurrentStep(3)}
            onBackToEdit={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <LocationPermissionStep
            locationShared={locationShared}
            setLocationShared={setLocationShared}
            latitude={latitude}
            setLatitude={setLatitude}
            longitude={longitude}
            setLongitude={setLongitude}
            addressText={addressText}
            setAddressText={setAddressText}
            incidentDate={incidentDate}
            setIncidentDate={setIncidentDate}
            incidentTime={incidentTime}
            setIncidentTime={setIncidentTime}
            onProceedToReview={() => setCurrentStep(4)}
            onBackToAI={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <ReviewReportStep
            currentUser={currentUser}
            inputType={inputType}
            rawInput={rawInput}
            setRawInput={setRawInput}
            callDetails={callDetails}
            audioDurationSec={audioDurationSec}
            category={category}
            setCategory={setCategory}
            priority={priority}
            setPriority={setPriority}
            summary={summary}
            setSummary={setSummary}
            riskAssessment={riskAssessment}
            suggestedAction={suggestedAction}
            extractedEntities={extractedEntities}
            locationShared={locationShared}
            latitude={latitude}
            longitude={longitude}
            addressText={addressText}
            setAddressText={setAddressText}
            incidentDate={incidentDate}
            setIncidentDate={setIncidentDate}
            incidentTime={incidentTime}
            setIncidentTime={setIncidentTime}
            isAnonymous={isAnonymous}
            setIsAnonymous={setIsAnonymous}
            notifyEmergencyContact={notifyEmergencyContact}
            setNotifyEmergencyContact={setNotifyEmergencyContact}
            onSubmit={handleFinalSubmit}
            onBackToLocation={() => setCurrentStep(3)}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 5 && submittedComplaint && (
          <SubmissionSuccessStep
            complaint={submittedComplaint}
            onViewMyComplaints={onViewMyComplaints}
            onNewReport={resetForm}
          />
        )}
      </div>
    </div>
  );
};
