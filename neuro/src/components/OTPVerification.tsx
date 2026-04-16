import { useState } from "react";
import { auth } from "../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function OTPVerification({ phone, onVerify }: any) {
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);

  const sendOtp = async () => {
    try {
      // ✅ Create recaptcha ONLY ONCE
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
         auth, "recaptcha",
          { size: "normal" },
        
        );
      }

      const appVerifier = window.recaptchaVerifier;

      // ✅ Ensure phone format
      const formattedPhone = phone.startsWith("+91")
        ? phone
        : "+91" + phone;

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      setConfirmation(result);
      alert("✅ OTP Sent Successfully");
    } catch (error) {
      console.error(error);
      alert("❌ Error sending OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      await confirmation.confirm(otp);
      alert("✅ Verified");
      onVerify();
    } catch {
      alert("❌ Wrong OTP");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2>Phone Verification</h2>

      {/* ✅ REQUIRED */}
      <div id="recaptcha"></div>

      <button onClick={sendOtp} className="bg-blue-500 text-white p-2">
        Send OTP
      </button>

      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        className="border p-2 mt-3"
      />

      <button onClick={verifyOtp} className="bg-green-500 text-white p-2 mt-2">
        Verify OTP
      </button>
    </div>
  );
}