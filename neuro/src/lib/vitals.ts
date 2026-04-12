export type VitalStatus = 'normal' | 'warning' | 'abnormal';

export interface VitalSign {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  icon: string;
  status: VitalStatus;
  min?: number;
  max?: number;
}

export interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  caregiverName: string;
  caregiverContact: string;
  blynkToken: string;
  doctorId: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  beforeAfterFood: 'Before' | 'After';
  taken: boolean;
  takenAt?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
}

export interface MedicalRecord {
  id: string;
  name: string;
  type: 'PDF' | 'Image' | 'Report';
  date: string;
  size: string;
}

export interface EmergencyPatient {
  id: string;
  name: string;
  age: number;
  emergencyType: string;
  vitals: VitalSign[];
  timestamp: string;
}

// Threshold checking functions
export function checkTemperature(value: number): VitalStatus {
  if (value >= 36.5 && value <= 37.5) return 'normal';
  if ((value >= 35.5 && value < 36.5) || (value > 37.5 && value <= 38.5)) return 'warning';
  return 'abnormal';
}

export function checkHeartRate(value: number): VitalStatus {
  if (value >= 60 && value <= 100) return 'normal';
  if ((value >= 50 && value < 60) || (value > 100 && value <= 120)) return 'warning';
  return 'abnormal';
}

export function checkSpO2(value: number): VitalStatus {
  if (value >= 95) return 'normal';
  if (value >= 90 && value < 95) return 'warning';
  return 'abnormal';
}

export function checkRespiratoryRate(value: number): VitalStatus {
  if (value >= 12 && value <= 20) return 'normal';
  if ((value >= 10 && value < 12) || (value > 20 && value <= 24)) return 'warning';
  return 'abnormal';
}

export function checkBPSystolic(value: number): VitalStatus {
  if (value >= 90 && value <= 120) return 'normal';
  if ((value > 120 && value <= 140) || (value >= 80 && value < 90)) return 'warning';
  return 'abnormal';
}

export function checkBPDiastolic(value: number): VitalStatus {
  if (value >= 60 && value <= 80) return 'normal';
  if ((value > 80 && value <= 90) || (value >= 50 && value < 60)) return 'warning';
  return 'abnormal';
}

export function checkGSR(value: number): VitalStatus {
  if (value >= 2 && value <= 10) return 'normal';
  if ((value < 2 && value > 0) || (value > 10 && value <= 20)) return 'warning';
  return 'abnormal';
}

export function checkPulseRate(value: number): VitalStatus {
  return checkHeartRate(value);
}

// Generate simulated vitals with slight variations
export function generateSimulatedVitals(prevVitals?: VitalSign[]): VitalSign[] {
  const jitter = (base: number, range: number) => base + (Math.random() - 0.5) * range;

  const temp = prevVitals ? jitter(parseFloat(prevVitals[0].value as string) || 36.8, 0.4) : jitter(36.8, 0.6);
  const hr = prevVitals ? jitter(parseFloat(prevVitals[1].value as string) || 78, 8) : jitter(78, 15);
  const pulse = prevVitals ? jitter(parseFloat(prevVitals[2].value as string) || 76, 6) : jitter(76, 12);
  const spo2 = prevVitals ? Math.min(100, jitter(parseFloat(prevVitals[3].value as string) || 97, 2)) : Math.min(100, jitter(97, 3));
  const rr = prevVitals ? jitter(parseFloat(prevVitals[4].value as string) || 16, 3) : jitter(16, 5);
  const bpSys = prevVitals ? jitter(parseFloat((prevVitals[5].value as string).split('/')[0]) || 118, 8) : jitter(118, 15);
  const bpDia = prevVitals ? jitter(parseFloat((prevVitals[5].value as string).split('/')[1]) || 76, 5) : jitter(76, 10);
  const gsr = prevVitals ? jitter(parseFloat(prevVitals[6].value as string) || 5, 2) : jitter(5, 4);
  const hydration = gsr; // derived from GSR

  const roundedTemp = Math.round(temp * 10) / 10;
  const roundedHR = Math.round(hr);
  const roundedPulse = Math.round(pulse);
  const roundedSpO2 = Math.round(Math.max(80, Math.min(100, spo2)));
  const roundedRR = Math.round(rr);
  const roundedBPSys = Math.round(bpSys);
  const roundedBPDia = Math.round(bpDia);
  const roundedGSR = Math.round(gsr * 10) / 10;
  const roundedHydration = Math.round(Math.max(0, hydration) * 10) / 10;

  const bpStatus: VitalStatus = checkBPSystolic(roundedBPSys) === 'abnormal' || checkBPDiastolic(roundedBPDia) === 'abnormal'
    ? 'abnormal'
    : checkBPSystolic(roundedBPSys) === 'warning' || checkBPDiastolic(roundedBPDia) === 'warning'
      ? 'warning' : 'normal';

  return [
    { id: 'temp', name: 'Temperature', value: roundedTemp.toFixed(1), unit: '°C', icon: '🌡️', status: checkTemperature(roundedTemp) },
    { id: 'hr', name: 'Heart Rate', value: roundedHR.toString(), unit: 'bpm', icon: '❤️', status: checkHeartRate(roundedHR) },
    { id: 'pulse', name: 'Pulse Rate', value: roundedPulse.toString(), unit: 'bpm', icon: '💓', status: checkPulseRate(roundedPulse) },
    { id: 'spo2', name: 'SpO₂', value: roundedSpO2.toString(), unit: '%', icon: '🫁', status: checkSpO2(roundedSpO2) },
    { id: 'rr', name: 'Respiratory Rate', value: roundedRR.toString(), unit: 'br/min', icon: '🫁', status: checkRespiratoryRate(roundedRR) },
    { id: 'bp', name: 'Blood Pressure', value: `${roundedBPSys}/${roundedBPDia}`, unit: 'mmHg', icon: '🩸', status: bpStatus },
    { id: 'gsr', name: 'Skin Conductance', value: Math.max(0, roundedGSR).toFixed(1), unit: 'µS', icon: '⚡', status: checkGSR(Math.max(0, roundedGSR)) },
    { id: 'hydration', name: 'Hydration Level', value: Math.max(0, roundedHydration).toFixed(1), unit: 'µS', icon: '💧', status: checkGSR(Math.max(0, roundedHydration)) },
  ];
}

export function getOverallStatus(vitals: VitalSign[]): 'normal' | 'alert' | 'emergency' {
  const abnormalCount = vitals.filter(v => v.status === 'abnormal').length;
  const warningCount = vitals.filter(v => v.status === 'warning').length;
  if (abnormalCount >= 2) return 'emergency';
  if (abnormalCount >= 1) return 'alert';
  if (warningCount >= 2) return 'alert';
  return 'normal';
}

export function getFirstAidSuggestions(vitals: VitalSign[]): string[] {
  const suggestions: string[] = [];
  for (const v of vitals) {
    if (v.status !== 'abnormal') continue;
    switch (v.id) {
      case 'temp':
        const tempVal = parseFloat(v.value as string);
        if (tempVal > 38.5) suggestions.push('High fever detected — apply cool compress, give antipyretics, ensure hydration');
        else suggestions.push('Hypothermia risk — warm the patient with blankets, provide warm fluids');
        break;
      case 'hr':
        const hrVal = parseInt(v.value as string);
        if (hrVal > 120) suggestions.push('Tachycardia — have patient rest, check for dehydration, seek medical help');
        else suggestions.push('Bradycardia — monitor consciousness, prepare for emergency if unresponsive');
        break;
      case 'spo2':
        suggestions.push('Low SpO₂ — administer supplemental oxygen, elevate head, call emergency');
        break;
      case 'rr':
        suggestions.push('Abnormal breathing — ensure airway is clear, position upright, call emergency');
        break;
      case 'bp':
        suggestions.push('Blood pressure critical — have patient lie down, call emergency services immediately');
        break;
      case 'gsr':
        suggestions.push('Extreme stress/dehydration — calm environment, provide fluids, monitor closely');
        break;
    }
  }
  return suggestions;
}

// Generate ECG waveform data points
export function generateECGData(numPoints: number = 200): number[] {
  const data: number[] = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / numPoints;
    const cycle = t * 4 * Math.PI;
    // Simulate PQRST waveform
    const p = 0.15 * Math.sin(cycle * 2) * Math.exp(-Math.pow((cycle % (2 * Math.PI)) - 1, 2) * 5);
    const qrs = 0.8 * Math.exp(-Math.pow((cycle % (2 * Math.PI)) - 2.5, 2) * 30) - 0.2 * Math.exp(-Math.pow((cycle % (2 * Math.PI)) - 2.2, 2) * 20);
    const tWave = 0.2 * Math.exp(-Math.pow((cycle % (2 * Math.PI)) - 4, 2) * 5);
    const noise = (Math.random() - 0.5) * 0.03;
    data.push(p + qrs + tWave + noise);
  }
  return data;
}
