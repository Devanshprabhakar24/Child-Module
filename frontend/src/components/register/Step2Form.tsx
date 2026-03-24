"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mail, AtSign, Phone, Smartphone, MapPin, Clock, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, ChevronDown, Navigation, Home, Briefcase, MapPinned } from "lucide-react";
import { getStateName } from "../../utils/stateMapping";
import { handleNameInput } from "../../utils/textFormatting";
import { getCitiesByState } from "../../utils/indianCities";
import { getCurrentLocation, reverseGeocode, fetchAddressFromPinCode } from "../../utils/addressUtils";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export interface ContactDetails {
  email: string;
  mobile: string;
  address: {
    houseNo: string;
    street: string;
    landmark: string;
    city: string;
    state: string;
    pinCode: string;
    addressType: 'HOME' | 'WORK' | 'OTHER';
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

interface Step2Props {
  onNext: () => void;
  onPrev: () => void;
  onComplete: (details: ContactDetails) => void;
  motherName: string;
  stateCode?: string;
}

export default function Step2Form({ onNext, onPrev, onComplete, motherName, stateCode }: Step2Props) {
  // Verification States
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"initial" | "sent" | "verified">("initial");
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [emailCheckStatus, setEmailCheckStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [emailCheckMessage, setEmailCheckMessage] = useState<string>("");

  const [mobile, setMobile] = useState("");
  const [mobileStatus, setMobileStatus] = useState<"initial" | "sent" | "verified">("initial");
  const [mobileOtp, setMobileOtp] = useState(["", "", "", "", "", ""]);
  const [mobileCheckStatus, setMobileCheckStatus] = useState<"idle" | "checking" | "available" | "limited">("idle");
  const [mobileCheckMessage, setMobileCheckMessage] = useState<string>("");

  // Additional Details State
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [saveAddress, setSaveAddress] = useState(true);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>();
  const [citySearch, setCitySearch] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [pincodeValidation, setPincodeValidation] = useState<{
    status: "idle" | "checking" | "valid" | "invalid";
    message: string;
    detectedCity?: string;
    detectedState?: string;
  }>({ status: "idle", message: "" });

  // Refs for OTP auto-focusing
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const mobileOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [verifyEmailLoading, setVerifyEmailLoading] = useState(false);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [verifyMobileLoading, setVerifyMobileLoading] = useState(false);

  // Debounced email check
  const checkEmailAvailability = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck.includes("@") || !emailToCheck.includes(".")) {
      setEmailCheckStatus("idle");
      setEmailCheckMessage("");
      return;
    }

    setEmailCheckStatus("checking");
    setEmailCheckMessage("Checking...");

    try {
      const res = await fetch(`${API_BASE}/registration/check-email?email=${encodeURIComponent(emailToCheck)}`);
      const data = await res.json();

      if (data.exists) {
        setEmailCheckStatus("taken");
        setEmailCheckMessage("This email address is already registered. Each email can only be used for one registration.");
      } else {
        setEmailCheckStatus("available");
        setEmailCheckMessage("Email available");
      }
    } catch (error) {
      setEmailCheckStatus("idle");
      setEmailCheckMessage("");
    }
  }, []);

  // Debounced mobile check
  const checkMobileAvailability = useCallback(async (mobileToCheck: string) => {
    if (mobileToCheck.length !== 10) {
      setMobileCheckStatus("idle");
      setMobileCheckMessage("");
      return;
    }

    setMobileCheckStatus("checking");
    setMobileCheckMessage("Checking...");

    try {
      const res = await fetch(`${API_BASE}/registration/check-mobile?phone=${encodeURIComponent(mobileToCheck)}`);
      const data = await res.json();

      if (data.available) {
        setMobileCheckStatus("available");
        setMobileCheckMessage(data.message);
      } else {
        setMobileCheckStatus("limited");
        setMobileCheckMessage(data.message);
      }
    } catch (error) {
      setMobileCheckStatus("idle");
      setMobileCheckMessage("");
    }
  }, []);

  // Debounce email check
  useEffect(() => {
    if (emailStatus !== "initial") return; // Don't check if already verified

    const timer = setTimeout(() => {
      if (email) {
        checkEmailAvailability(email);
      } else {
        setEmailCheckStatus("idle");
        setEmailCheckMessage("");
      }
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timer);
  }, [email, emailStatus, checkEmailAvailability]);

  // Fetch cities for the selected state
  useEffect(() => {
    const fetchCitiesForState = async () => {
      if (!stateCode) {
        setAvailableCities([]);
        return;
      }

      setLoadingCities(true);
      try {
        // Use a comprehensive list of major cities from our static data
        const cities = getCitiesByState(stateCode);
        setAvailableCities(cities);
      } catch (error) {
        console.error("Error loading cities:", error);
        setAvailableCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCitiesForState();
  }, [stateCode]);

  // Filter cities based on search
  const filteredCities = availableCities.filter(cityName =>
    cityName.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Debounce mobile check
  useEffect(() => {
    if (mobileStatus !== "initial") return; // Don't check if already verified

    const timer = setTimeout(() => {
      if (mobile) {
        checkMobileAvailability(mobile);
      } else {
        setMobileCheckStatus("idle");
        setMobileCheckMessage("");
      }
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timer);
  }, [mobile, mobileStatus, checkMobileAvailability]);

  // Handle "Use Current Location" button
  const handleUseCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      
      setCoordinates({ lat: latitude, lng: longitude });
      
      // Reverse geocode to get address
      const addressData = await reverseGeocode(latitude, longitude);
      
      if (addressData) {
        if (addressData.houseNo) setHouseNo(addressData.houseNo);
        if (addressData.street) setStreet(addressData.street);
        if (addressData.landmark) setLandmark(addressData.landmark);
        if (addressData.city) {
          setCity(addressData.city);
          setCitySearch(addressData.city);
        }
        if (addressData.pinCode) setPincode(addressData.pinCode);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Could not get your location. Please ensure location permissions are enabled.");
    } finally {
      setLoadingLocation(false);
    }
  };

  // Auto-fill city and state from PIN code
  useEffect(() => {
    const autofillFromPincode = async () => {
      if (pincode.length === 6) {
        try {
          const pinData = await fetchAddressFromPinCode(pincode);
          if (pinData) {
            setCity(pinData.city);
            setCitySearch(pinData.city);
          }
        } catch (error) {
          console.error("Error fetching PIN code data:", error);
        }
      }
    };

    const timer = setTimeout(autofillFromPincode, 500);
    return () => clearTimeout(timer);
  }, [pincode]);

  // Validate PIN code in real-time
  useEffect(() => {
    const validatePincode = async () => {
      if (pincode.length !== 6) {
        setPincodeValidation({ status: "idle", message: "" });
        return;
      }

      setPincodeValidation({ status: "checking", message: "Validating PIN code..." });

      try {
        // Use India Post API to validate PIN code
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          const detectedCity = postOffice.District;
          const detectedState = postOffice.State;

          // Check if city matches
          const cityMatch = city.trim().toLowerCase() === detectedCity.toLowerCase();
          
          // Check if state matches (compare with stateCode)
          const stateMatch = stateCode && detectedState.toLowerCase().includes(getStateName(stateCode).toLowerCase());

          if (cityMatch && stateMatch) {
            setPincodeValidation({
              status: "valid",
              message: `✓ Valid PIN code for ${detectedCity}, ${detectedState}`,
              detectedCity,
              detectedState,
            });
          } else if (!cityMatch && !stateMatch) {
            setPincodeValidation({
              status: "invalid",
              message: `PIN code belongs to ${detectedCity}, ${detectedState}. Please update city and state.`,
              detectedCity,
              detectedState,
            });
          } else if (!cityMatch) {
            setPincodeValidation({
              status: "invalid",
              message: `PIN code belongs to ${detectedCity}, not ${city}`,
              detectedCity,
              detectedState,
            });
          } else {
            setPincodeValidation({
              status: "invalid",
              message: `PIN code belongs to ${detectedState}, not ${getStateName(stateCode || "")}`,
              detectedCity,
              detectedState,
            });
          }
        } else {
          setPincodeValidation({
            status: "invalid",
            message: "Invalid PIN code. Please check and try again.",
          });
        }
      } catch (error) {
        setPincodeValidation({
          status: "invalid",
          message: "Could not validate PIN code. Please check your internet connection.",
        });
      }
    };

    const timer = setTimeout(validatePincode, 800);
    return () => clearTimeout(timer);
  }, [pincode, city, stateCode]);

  // OTP Input Handler (Auto-focus next box)
  const handleOtpChange = (
    value: string,
    index: number,
    type: "email" | "mobile"
  ) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = type === "email" ? [...emailOtp] : [...mobileOtp];
    newOtp[index] = value;

    if (type === "email") {
      setEmailOtp(newOtp);
      if (value && index < 5) emailOtpRefs.current[index + 1]?.focus();
    } else {
      setMobileOtp(newOtp);
      if (value && index < 5) mobileOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleSendMobileOtp = async () => {
    if (mobile.length !== 10) return;
    setMobileError(null);
    setMobileLoading(true);
    
    // Clear previous OTP input when sending new OTP
    setMobileOtp(["", "", "", "", "", ""]);
    
    console.log('🔔 [REGISTRATION] Sending mobile OTP to:', mobile);
    
    try {
      console.log('📱 [REGISTRATION] Calling /auth/send-phone-otp');
      const res = await fetch(`${API_BASE}/auth/send-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${mobile}` }),
      });
      
      const data = await res.json();
      console.log('📱 [REGISTRATION] Send Phone OTP response:', data);
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }
      
      console.log('✅ [REGISTRATION] Mobile OTP sent successfully');
      setMobileStatus("sent");
    } catch (err: any) {
      console.error('❌ [REGISTRATION] Error sending mobile OTP:', err);
      setMobileError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setMobileLoading(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    const code = mobileOtp.join("");
    if (code.length !== 6) return;
    setMobileError(null);
    setVerifyMobileLoading(true);
    try {
      // Use the phone OTP verification endpoint
      const res = await fetch(`${API_BASE}/auth/verify-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${mobile}`, otp: code }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Invalid OTP. Please try again.");
      }
      
      const data = await res.json();
      const token = data.token ?? data.access_token;
      
      if (typeof window !== "undefined") {
        if (token) {
          localStorage.setItem("wt18_token", token);
        }
        if (data.user) {
          localStorage.setItem("wt18_user", JSON.stringify(data.user));
        }
      }
      
      setMobileStatus("verified");
    } catch (err: any) {
      setMobileError(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setVerifyMobileLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!email.includes("@")) return;
    setEmailError(null);
    setEmailLoading(true);
    
    // Clear previous OTP input when sending new OTP
    setEmailOtp(["", "", "", "", "", ""]);
    
    console.log('🔔 [REGISTRATION] Sending email OTP to:', email);
    console.log('🔔 [REGISTRATION] Mother name:', motherName);
    console.log('🔔 [REGISTRATION] Mobile:', mobile);
    
    try {
      // Register user first (idempotent — returns existing if already registered)
      console.log('📝 [REGISTRATION] Step 1: Calling /auth/register');
      const registerRes = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone: `+91${mobile || "0000000000"}`, fullName: motherName }),
      });
      const registerData = await registerRes.json();
      console.log('📝 [REGISTRATION] Register response:', registerData);
      
      console.log('📧 [REGISTRATION] Step 2: Calling /auth/send-otp');
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone: mobile ? `+91${mobile}` : undefined }),
      });
      
      const otpData = await res.json();
      console.log('📧 [REGISTRATION] Send OTP response:', otpData);
      
      if (!res.ok) {
        throw new Error(otpData.message || "Failed to send OTP");
      }
      
      console.log('✅ [REGISTRATION] Email OTP sent successfully');
      setEmailStatus("sent");
    } catch (err: any) {
      console.error('❌ [REGISTRATION] Error sending email OTP:', err);
      setEmailError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    const code = emailOtp.join("");
    if (code.length !== 6) return;
    setEmailError(null);
    setVerifyEmailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Invalid OTP. Please try again.");
      }
      const data = await res.json();
      const token = data.token ?? data.access_token;
      if (typeof window !== "undefined") {
        if (token) {
          localStorage.setItem("wt18_token", token);
        }
        if (data.user) {
          localStorage.setItem("wt18_user", JSON.stringify(data.user));
        }
      }
      setEmailStatus("verified");
    } catch (err: any) {
      setEmailError(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setVerifyEmailLoading(false);
    }
  };

  // Validation to enable "Continue" button
  const isFormValid =
    emailStatus === "verified" &&
    mobileStatus === "verified" &&
    houseNo.trim() !== "" &&
    street.trim() !== "" &&
    city.trim() !== "" &&
    pincode.length === 6 &&
    pincodeValidation.status === "valid";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onComplete({
        email,
        mobile,
        address: {
          houseNo: houseNo.trim(),
          street: street.trim(),
          landmark: landmark.trim(),
          city: city.trim(),
          state: getStateName(stateCode || ""),
          pinCode: pincode,
          addressType: addressType,
          coordinates,
        },
      });
      onNext();
    }
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-10 p-6 md:p-8">
        
        {/* ================= EMAIL SECTION ================= */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Email Verification *</h3>
          </div>
          
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
            <div className="md:col-span-8">
              <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <AtSign className={`h-5 w-5 ${emailStatus === "verified" ? "text-primary" : emailCheckStatus === "taken" ? "text-red-500" : "text-slate-400"}`} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={emailStatus !== "initial"}
                  placeholder="name@example.com" 
                  className={`block w-full rounded-full border bg-white py-3 pl-10 pr-3 outline-none transition-all ${
                    emailStatus === "verified" 
                      ? "border-primary/50 bg-primary/5 text-primary focus:ring-0 cursor-not-allowed font-medium" 
                      : emailCheckStatus === "taken"
                      ? "border-red-300 text-slate-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-slate-300 text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary"
                  }`} 
                />
                {emailStatus === "verified" && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                )}
                {emailCheckStatus === "taken" && emailStatus === "initial" && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
              {/* Real-time validation message */}
              {emailCheckMessage && emailStatus === "initial" && (
                <p className={`mt-2 text-sm flex items-center gap-1 ${
                  emailCheckStatus === "checking" ? "text-slate-500" :
                  emailCheckStatus === "taken" ? "text-red-600" :
                  emailCheckStatus === "available" ? "text-green-600" : ""
                }`}>
                  {emailCheckStatus === "checking" && (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></span>
                  )}
                  {emailCheckStatus === "taken" && <AlertCircle className="h-4 w-4" />}
                  {emailCheckStatus === "available" && <CheckCircle2 className="h-4 w-4" />}
                  {emailCheckMessage}
                </p>
              )}
            </div>

            {/* Verify Action Button */}
            <div className="md:col-span-4">
              {emailStatus === "initial" && (
                <button 
                  type="button" 
                  onClick={handleSendEmailOtp}
                  disabled={!email.includes("@") || emailLoading || emailCheckStatus === "taken" || emailCheckStatus === "checking"}
                  className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 font-medium text-white transition-all ${
                    email.includes("@") && !emailLoading && emailCheckStatus !== "taken" && emailCheckStatus !== "checking"
                      ? "bg-primary shadow-sm shadow-primary/20 hover:bg-opacity-90"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  {emailLoading ? "Sending..." : "Send OTP"}
                </button>
              )}
              {emailStatus === "verified" && (
                <div className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-3 font-medium text-primary">
                  Verified
                </div>
              )}
            </div>
          </div>

          {/* Email OTP Input Block */}
          {emailStatus === "sent" && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 animate-in fade-in slide-in-from-top-4">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-sm font-normal text-slate-700">Enter 6-digit OTP sent to <span className="font-medium">{email}</span></p>
                <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-[10px] font-normal uppercase tracking-wider text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> OTP Sent
                </span>
              </div>
              
              <div className="mb-6 flex gap-2 sm:gap-3">
                {emailOtp.map((digit, i) => (
                  <input 
                    key={`email-otp-${i}`} 
                    ref={(el) => { emailOtpRefs.current[i] = el; }}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i, "email")}
                    maxLength={1} 
                    type="text" 
                    className="h-12 w-10 sm:h-14 sm:w-12 rounded-lg border border-slate-300 bg-white text-center text-lg sm:text-xl font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-sm font-medium text-primary">
                  <Clock className="h-4 w-4" /><span>00:45</span>
                </div>
                <div className="flex gap-4 items-center">
                  <button 
                    type="button" 
                    onClick={handleSendEmailOtp}
                    disabled={emailLoading}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                  >
                    {emailLoading ? "Sending..." : "Resend"}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleVerifyEmailOtp}
                    disabled={emailOtp.join("").length !== 6 || verifyEmailLoading}
                    className={`rounded-lg px-6 py-2 text-sm font-medium text-white transition-all ${
                      emailOtp.join("").length === 6 && !verifyEmailLoading
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-slate-300 cursor-not-allowed"
                    }`}
                  >
                    {verifyEmailLoading ? "Verifying..." : "Confirm"}
                  </button>
                </div>
              </div>
              {emailError && (
                <p className="mt-3 text-sm text-red-600">
                  {emailError}
                </p>
              )}
            </div>
          )}
        </section>

        {/* ================= MOBILE SECTION ================= */}
        <section className="flex flex-col gap-6 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Mobile Verification *</h3>
          </div>
          
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
            <div className="md:col-span-8">
              <label className="mb-2 block text-sm font-medium text-slate-700">Primary Mobile Number</label>
              <div className="flex">
                <span className={`inline-flex items-center rounded-l-full border border-r-0 px-4 text-sm font-medium transition-colors ${mobileStatus === "verified" ? "border-primary/50 bg-primary/5 text-primary" : "border-slate-300 bg-slate-50 text-slate-500"}`}>
                  +91
                </span>
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className={`h-5 w-5 ${
                      mobileStatus === "verified" ? "text-primary" : 
                      mobileCheckStatus === "limited" ? "text-red-500" : 
                      "text-slate-400"
                    }`} />
                  </div>
                  <input 
                    type="tel" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                    disabled={mobileStatus !== "initial"}
                    maxLength={10}
                    placeholder="9876543210"
                    className={`block w-full rounded-r-full border bg-white py-3 pl-10 pr-3 outline-none transition-all ${
                      mobileStatus === "verified" 
                        ? "border-primary/50 bg-primary/5 text-primary focus:ring-0 cursor-not-allowed font-medium" 
                        : mobileCheckStatus === "limited"
                        ? "border-red-300 text-slate-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-slate-300 text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary"
                    }`}
                  />
                  {mobileStatus === "verified" && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  )}
                  {mobileCheckStatus === "limited" && mobileStatus === "initial" && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              {/* Real-time mobile validation message */}
              {mobileCheckMessage && mobileStatus === "initial" && (
                <p className={`mt-2 text-sm flex items-center gap-1 ${
                  mobileCheckStatus === "checking" ? "text-slate-500" :
                  mobileCheckStatus === "limited" ? "text-red-600" :
                  mobileCheckStatus === "available" ? "text-green-600" : ""
                }`}>
                  {mobileCheckStatus === "checking" && (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></span>
                  )}
                  {mobileCheckStatus === "limited" && <AlertCircle className="h-4 w-4" />}
                  {mobileCheckStatus === "available" && <CheckCircle2 className="h-4 w-4" />}
                  {mobileCheckMessage}
                </p>
              )}
            </div>
            
            <div className="md:col-span-4">
              {mobileStatus === "initial" && (
                <button
                  type="button"
                  onClick={handleSendMobileOtp}
                  disabled={mobile.length !== 10 || mobileLoading || mobileCheckStatus === "limited" || mobileCheckStatus === "checking"}
                  className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 font-medium text-white transition-all ${
                    mobile.length === 10 && !mobileLoading && mobileCheckStatus !== "limited" && mobileCheckStatus !== "checking"
                      ? "bg-primary shadow-sm shadow-primary/20 hover:bg-opacity-90"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  {mobileLoading ? "Sending..." : "Send OTP"}
                </button>
              )}
              {mobileStatus === "verified" && (
                <div className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-3 font-medium text-primary">
                  Verified
                </div>
              )}
            </div>
          </div>

          {/* Mobile OTP Input Block */}
          {mobileStatus === "sent" && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 animate-in fade-in slide-in-from-top-4">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-sm font-normal text-slate-700">Enter 6-digit OTP sent to <span className="font-medium">+91 {mobile}</span></p>
                <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-[10px] font-normal uppercase tracking-wider text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> OTP Sent
                </span>
              </div>
              
              <div className="mb-6 flex gap-2 sm:gap-3">
                {mobileOtp.map((digit, i) => (
                  <input 
                    key={`mobile-otp-${i}`} 
                    ref={(el) => { mobileOtpRefs.current[i] = el; }}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i, "mobile")}
                    maxLength={1} 
                    type="text" 
                    className="h-12 w-10 sm:h-14 sm:w-12 rounded-lg border border-slate-300 bg-white text-center text-lg sm:text-xl font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-sm font-medium text-primary">
                  <Clock className="h-4 w-4" /><span>00:45</span>
                </div>
                <div className="flex gap-4 items-center">
                  <button 
                    type="button" 
                    onClick={handleSendMobileOtp}
                    disabled={mobileLoading}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                  >
                    {mobileLoading ? "Sending..." : "Resend"}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleVerifyMobileOtp}
                    disabled={mobileOtp.join("").length !== 6 || verifyMobileLoading}
                    className={`rounded-lg px-6 py-2 text-sm font-medium text-white transition-all ${mobileOtp.join("").length === 6 && !verifyMobileLoading ? "bg-primary hover:bg-primary/90" : "bg-slate-300 cursor-not-allowed"}`}
                  >
                    {verifyMobileLoading ? "Verifying..." : "Confirm"}
                  </button>
                </div>
              </div>
              {mobileError && (
                <p className="mt-3 text-sm text-red-600">{mobileError}</p>
              )}
            </div>
          )}
        </section>

        {/* ================= ADDITIONAL DETAILS ================= */}
        <section className="flex flex-col gap-6 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">Address Details</h3>
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={loadingLocation}
              className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/10 disabled:opacity-50"
            >
              {loadingLocation ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                  Getting location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Use my current location
                </>
              )}
            </button>
          </div>

          {/* Address Type Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Address Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAddressType('HOME')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  addressType === 'HOME'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Home className="h-5 w-5" />
                Home
              </button>
              <button
                type="button"
                onClick={() => setAddressType('WORK')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  addressType === 'WORK'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Briefcase className="h-5 w-5" />
                Work
              </button>
              <button
                type="button"
                onClick={() => setAddressType('OTHER')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  addressType === 'OTHER'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <MapPinned className="h-5 w-5" />
                Other
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                House/Flat No. *
              </label>
              <input
                type="text"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                className={`block w-full rounded-lg border px-4 py-3 text-slate-900 outline-none transition-all ${
                  houseNo.trim() 
                    ? "border-slate-300 bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                    : "border-slate-300 bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
                placeholder="e.g. Flat 12A, House 45"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Street/Area *
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className={`block w-full rounded-lg border px-4 py-3 text-slate-900 outline-none transition-all ${
                  street.trim()
                    ? "border-slate-300 bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                    : "border-slate-300 bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
                placeholder="e.g. MG Road, Sector 4"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="e.g. Near XYZ School, Opposite ABC Mall"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">PIN Code *</label>
              <div className="relative">
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className={`block w-full rounded-lg border px-4 py-3 text-slate-900 outline-none transition-all ${
                    pincodeValidation.status === "valid"
                      ? "border-green-300 bg-green-50 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      : pincodeValidation.status === "invalid"
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-slate-300 bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                  }`}
                  maxLength={6}
                  placeholder="6-digit PIN"
                  type="text"
                />
                {pincodeValidation.status === "valid" && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
                {pincodeValidation.status === "invalid" && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
                {pincodeValidation.status === "checking" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></span>
                )}
              </div>
              {pincodeValidation.message && (
                <p className={`mt-2 text-sm flex items-center gap-1 ${
                  pincodeValidation.status === "checking" ? "text-slate-500" :
                  pincodeValidation.status === "invalid" ? "text-red-600" :
                  pincodeValidation.status === "valid" ? "text-green-600" : ""
                }`}>
                  {pincodeValidation.message}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                City and state will be auto-filled from PIN code
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">City/Town *</label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setCitySearch(e.target.value);
                  }}
                  className="block w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-slate-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select city or type below</option>
                  {availableCities.slice(0, 100).map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {stateCode
                  ? `Select from ${availableCities.length} cities in ${getStateName(stateCode)}`
                  : "State not selected"}
              </p>
              {/* Manual input option */}
              <div className="mt-2">
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setCity(e.target.value);
                  }}
                  placeholder="Or type your city name manually"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">State</label>
              <input
                className="block w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-500 outline-none"
                readOnly
                type="text"
                value={stateCode ? getStateName(stateCode) : "Not selected"}
                title="State is carried over from Step 1"
              />
            </div>
          </div>

          {/* Save Address Checkbox */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              id="saveAddress"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
            />
            <label htmlFor="saveAddress" className="text-sm font-medium text-slate-700 cursor-pointer">
              Save this address for future use
            </label>
          </div>
        </section>
      </div>

      {/* ================= FOOTER ACTIONS ================= */}
      <div className="flex flex-col gap-8 border-t border-slate-200 bg-slate-50 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onPrev} className="flex items-center gap-2 font-semibold text-slate-500 transition-colors hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" /> Back
          </button>
          <button 
            type="submit" 
            disabled={!isFormValid}
            className={`flex items-center gap-2 rounded-full px-10 py-3 font-medium text-white transition-all ${
              isFormValid 
                ? "bg-primary hover:shadow-lg hover:shadow-primary/30 hover:bg-primary/90" 
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            Continue <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </form>
  );
}