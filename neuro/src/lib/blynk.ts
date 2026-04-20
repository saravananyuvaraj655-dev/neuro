import {
  type VitalSign,
  checkTemperature,
  checkHeartRate,
  checkPulseRate,
  checkSpO2,
  checkRespiratoryRate,
  checkBPSystolic,
  checkBPDiastolic,
  checkGSR,
  type VitalStatus,
} from './vitals';

// Blynk Cloud HTTPS API base URL
const BLYNK_BASE = 'https://blynk.cloud/external/api';

/**
 * Virtual pin mapping for ESP32 sensors:
 * V0 = Temperature (LM35) in °C
 * V1 = Heart Rate (bpm)
 * V2 = Pulse Rate (bpm)
 * V3 = SpO₂ (%)
 * V4 = Respiratory Rate (breaths/min)
 * V5 = Blood Pressure Systolic (mmHg)
 * V6 = Blood Pressure Diastolic (mmHg)
 * V7 = Skin Conductance / GSR (µS)
 * V8 = Fall Detection (0 = no fall, 1 = fall detected)
 * V9 = ECG raw value
 */
export const BLYNK_PIN_MAP = {
  temperature: 'V0',
  heartRate: 'V1',
  pulseRate: 'V2',
  spo2: 'V3',
  respiratoryRate: 'V4',
  bpSystolic: 'V5',
  bpDiastolic: 'V6',
  gsr: 'V7',
  fallDetection: 'V8',
  ecg: 'V9',
} as const;

// Fetch a single datastream value from Blynk
async function fetchBlynkPin(token: string, pin: string): Promise<number | null> {
  try {
    const response = await fetch(`${BLYNK_BASE}/get?token=${token}&${pin}`);
    if (!response.ok) return null;
    const text = await response.text();
    const parsed = parseFloat(text.replace(/[\[\]"]/g, ''));
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

// Validate Blynk token by checking if the device is reachable
export async function validateBlynkToken(token: string): Promise<{ valid: boolean; online: boolean }> {
  try {
    const response = await fetch(`${BLYNK_BASE}/isHardwareConnected?token=${token}`);
    if (!response.ok) return { valid: false, online: false };
    const text = await response.text();
    return { valid: true, online: text.trim() === 'true' };
  } catch {
    return { valid: false, online: false };
  }
}

// Fetch all vitals from Blynk Cloud in parallel
export async function fetchBlynkVitals(token: string): Promise<{
  vitals: VitalSign[];
  fallDetected: boolean;
  isOnline: boolean;
  ecgValue: number | null;
} | null> {
  try {
    // Fetch all pins in parallel
    const [temp, hr, pulse, spo2, rr, bpSys, bpDia, gsr, fall, ecg] = await Promise.all([
      fetchBlynkPin(token, BLYNK_PIN_MAP.temperature),
      fetchBlynkPin(token, BLYNK_PIN_MAP.heartRate),
      fetchBlynkPin(token, BLYNK_PIN_MAP.pulseRate),
      fetchBlynkPin(token, BLYNK_PIN_MAP.spo2),
      fetchBlynkPin(token, BLYNK_PIN_MAP.respiratoryRate),
      fetchBlynkPin(token, BLYNK_PIN_MAP.bpSystolic),
      fetchBlynkPin(token, BLYNK_PIN_MAP.bpDiastolic),
      fetchBlynkPin(token, BLYNK_PIN_MAP.gsr),
      fetchBlynkPin(token, BLYNK_PIN_MAP.fallDetection),
      fetchBlynkPin(token, BLYNK_PIN_MAP.ecg),
    ]);
const formatBP = (sys: number, dia: number): string => {
  if (sys > 1000 && dia === 0) {
    const sbp = Math.floor(sys / 100);
    const dbp = sys % 100;
    return `${sbp}/${dbp}`;
  }

  if (!sys || !dia || sys < 50 || dia < 30) {
    return "Invalid BP";
  }

  return `${sys}/${dia}`;
};
    // Check device connectivity
    const { online } = await validateBlynkToken(token);

    // Use fetched values (fallback to 0 if null — means sensor not connected)
    const tempVal = temp ?? 0;
    const hrVal = hr != null ? Math.round(hr) : 0;
    const pulseVal = pulse != null ? Math.round(pulse) : 0;
    const spo2Val = spo2 != null ? Math.round(Math.min(100, spo2)) : 0;
    const rrVal = rr != null ? Math.round(rr) : 0;
    const bpSysVal = bpSys != null ? Math.round(bpSys) : 0;
    const bpDiaVal = bpDia != null ? Math.round(bpDia) : 0;
    const gsrVal = gsr ?? 0;
    const fallDetected = fall != null && fall >= 1;
    const hydrationVal = gsrVal; // derived from GSR

    const bpStatus: VitalStatus =
      checkBPSystolic(bpSysVal) === 'abnormal' || checkBPDiastolic(bpDiaVal) === 'abnormal'
        ? 'abnormal'
        : checkBPSystolic(bpSysVal) === 'warning' || checkBPDiastolic(bpDiaVal) === 'warning'
          ? 'warning'
          : 'normal';

    const vitals: VitalSign[] = [
      { id: 'temp', name: 'Temperature', value: tempVal.toFixed(1), unit: '°C', icon: '🌡️', status: checkTemperature(tempVal) },
      { id: 'hr', name: 'Heart Rate', value: hrVal.toString(), unit: 'bpm', icon: '❤️', status: checkHeartRate(hrVal) },
      { id: 'pulse', name: 'Pulse Rate', value: pulseVal.toString(), unit: 'bpm', icon: '💓', status: checkPulseRate(pulseVal) },
      { id: 'spo2', name: 'SpO₂', value: spo2Val.toString(), unit: '%', icon: '🫁', status: checkSpO2(spo2Val) },
      { id: 'rr', name: 'Respiratory Rate', value: rrVal.toString(), unit: 'br/min', icon: '🫁', status: checkRespiratoryRate(rrVal) },
      { id: 'bp', name: 'Blood Pressure', value: formatBP(bpSysVal, bpDiaVal), unit: 'mmHg', icon: '🩸', status: bpStatus },
      { id: 'gsr', name: 'Skin Conductance', value: Math.max(0, gsrVal).toFixed(1), unit: 'µS', icon: '⚡', status: checkGSR(Math.max(0, gsrVal)) },
      { id: 'hydration', name: 'Hydration Level', value: Math.max(0, hydrationVal).toFixed(1), unit: 'µS', icon: '💧', status: checkGSR(Math.max(0, hydrationVal)) },
    ];

    return { vitals, fallDetected, isOnline: online, ecgValue: ecg };
  } catch (error) {
    console.error('Failed to fetch Blynk vitals:', error);
    return null;
  }
}
