import emailjs from 'emailjs-com';

const EMAILJS_SERVICE_ID = 'service_r4p6a26';
const EMAILJS_TEMPLATE_ID = 'template_viwmsf8';
const EMAILJS_PUBLIC_KEY = 'd6EJWrpowS2zmRQd7';

const ALERT_COOLDOWN_MS = 60 * 1000; // 60 seconds

export interface PatientInfo {
  name: string;
  age: string;
  disease?: string;
  chronicConditions?: string;
  caregiverEmail?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
}

export interface EmergencyAlert {
  triggered: boolean;
  patientName: string;
  time: string;
  condition: string;
}

export interface AmbulanceAlert {
  status: 'Dispatched' | 'Idle';
  time: string;
}

function getPatientInfo(): PatientInfo | null {
  try {
    const raw = localStorage.getItem('neurotrack_patient');
    if (!raw) return null;
    return JSON.parse(raw) as PatientInfo;
  } catch {
    return null;
  }
}

function isOnCooldown(): boolean {
  try {
    const lastAlert = localStorage.getItem('last_alert');
    if (!lastAlert) return false;
    const diff = Date.now() - parseInt(lastAlert, 10);
    return diff < ALERT_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function setCooldown(): void {
  localStorage.setItem('last_alert', Date.now().toString());
}

function storeEmergencyAlert(patientName: string): void {
  const alert: EmergencyAlert = {
    triggered: true,
    patientName,
    time: new Date().toLocaleString(),
    condition: 'EMERGENCY',
  };
  localStorage.setItem('emergency_alert', JSON.stringify(alert));
}

function storeAmbulanceAlert(): void {
  const alert: AmbulanceAlert = {
    status: 'Dispatched',
    time: new Date().toLocaleString(),
  };
  localStorage.setItem('ambulance_alert', JSON.stringify(alert));
}

async function sendEmailAlert(patient: PatientInfo): Promise<void> {
  const caregiverEmail =
    patient.caregiverEmail ||
    localStorage.getItem('neurotrack_authed_email') ||
    '';

  if (!caregiverEmail) {
    console.warn('[EmergencyController] No caregiver email found — skipping email alert.');
    return;
  }

  const disease = patient.disease || patient.chronicConditions || 'Not specified';
  const currentTime = new Date().toLocaleString();

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      email: caregiverEmail,
      name: patient.name,
      age: patient.age,
      disease,
      time: currentTime,
    },
    EMAILJS_PUBLIC_KEY,
  );

  console.log(`[EmergencyController] Email alert sent to ${caregiverEmail}`);
}

/**
 * Main entry point. Call this whenever condition === "EMERGENCY".
 * Includes cooldown protection — fires at most once per 60 seconds.
 */
export async function handleEmergency(): Promise<void> {
  if (isOnCooldown()) {
    console.log('[EmergencyController] Cooldown active — skipping duplicate alert.');
    return;
  }

  const patient = getPatientInfo();
  if (!patient) {
    console.warn('[EmergencyController] No patient info in localStorage.');
    return;
  }

  // Set cooldown immediately to prevent race conditions
  setCooldown();

  // Store alerts in localStorage so UI can read them
  storeEmergencyAlert(patient.name);
  storeAmbulanceAlert();

  // Send email (non-blocking — don't let email failure block UI)
  try {
    await sendEmailAlert(patient);
  } catch (err) {
    console.error('[EmergencyController] Email send failed:', err);
  }
}

/** Read emergency alert from localStorage (for doctor dashboard). */
export function getEmergencyAlert(): EmergencyAlert | null {
  try {
    const raw = localStorage.getItem('emergency_alert');
    if (!raw) return null;
    return JSON.parse(raw) as EmergencyAlert;
  } catch {
    return null;
  }
}

/** Read ambulance alert from localStorage. */
export function getAmbulanceAlert(): AmbulanceAlert | null {
  try {
    const raw = localStorage.getItem('ambulance_alert');
    if (!raw) return null;
    return JSON.parse(raw) as AmbulanceAlert;
  } catch {
    return null;
  }
}

/** Clear all emergency state (e.g., after resolving). */
export function clearEmergencyAlerts(): void {
  localStorage.removeItem('emergency_alert');
  localStorage.removeItem('ambulance_alert');
  localStorage.removeItem('last_alert');
}