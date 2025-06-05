import { useState } from "react";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import { ArrowLeft, CheckCircle, Circle, Eye, EyeOff } from "lucide-react";
import logo from "../assets/ccp-logo.png";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState(null);
  const [webCodeVerified, setWebCodeVerified] = useState(false);
  const [webCode, setWebCode] = useState("");
  const [userPanel, setUserPanel] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("email"); // 'email' | 'webcode' | 'reset'
  const [isLoading, setIsLoading] = useState(false);

  const isMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(pwd);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required.");
    setIsLoading(true);

    try {
      const res = await fetch(
        "https://webexback-06cc.onrender.com/api/users/check-user-type",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (data.status) {
        const type = data.user_type;
        setUserType(type);
        setUserPanel(data.user_panel);
        if (type === "admin" || email == "accounts@redmarkediting.com") {
          setStep("reset");
        } else {
          setStep("webcode");
        }
      } else {
        toast.error(data.message || "Email not found.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebCodeSubmit = async () => {
    if (webCode.length !== 4) return toast.error("Enter 4-digit Web Code");

    setIsLoading(true);
    let api = "";
    if (userPanel === "AP") {
      api = "https://www.thehrbulb.com/team-member-panel/api/checkWebCode";
    } else if (userPanel === "SP") {
      api = "https://elementk.in/spbackend/api/users/check-web-code";
    } else {
      toast.error("Unknown user panel.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: webCode }),
      });
      const data = await res.json();
      if (data.status == "true") {
        toast.success("WebCode verified.");
        setWebCodeVerified(true);
        setStep("reset");
      } else {
        toast.error(data.message || "Invalid Web Code");
      }
    } catch (err) {
      console.error(err);
      toast.error("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!validatePassword(password)) {
      return toast.error(
        "Password must be at least 8 characters, with 1 uppercase letter, 1 number, and 1 symbol."
      );
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        "https://webexback-06cc.onrender.com/api/users/update-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, newPassword: password }),
        }
      );

      const data = await res.json();
      if (data.status) {
        toast.success("Password updated successfully.");
        setStep("email");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  function PasswordCheckItem({ label, isValid }) {
    return (
      <div
        className={`flex items-center gap-2 ${
          isValid ? "text-green-600" : "text-gray-500"
        }`}
      >
        {isValid ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <Circle className="w-4 h-4" />
        )}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center background-log">
      <div className="bg-log-set rounded p-4 w-full max-w-sm">
        {step !== "email" ? (
          <button
            onClick={() => {
              setStep("email");
              setWebCode("");
              setPassword("");
              setConfirmPassword("");
              setWebCodeVerified(false);
              setUserType(null);
            }}
            className="flex items-center text-sm text-[#092e46] hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
        ) : (
          <button
            onClick={() => {
              navigate("/login");
            }}
            className="flex items-center text-sm text-[#092e46] hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
        )}
        <div className="flex items-center gap-3 justify-center mb-3">
          <img src={logo} alt="Logo" className="w-auto h-11" />
        </div>

        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded f-14"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-[#D7763D] text-white py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? (
                <ScaleLoader height={10} width={3} color="#fff" />
              ) : (
                "Next"
              )}
            </button>
          </form>
        )}

        {step === "webcode" && (
          <div className="space-y-3">
            {userPanel == "AP" ? (
              <p className="text-sm text-gray-600">
                Enter the Web Code received on Attendance Panel
              </p>
            ) : (
              <p className="text-sm text-gray-600">
               Enter the Web Code received on Service Provider Panel
              </p>
            )}
            <input
              type="text"
              maxLength={4}
              placeholder="Enter 4-digit Web Code"
              className="w-full px-3 py-2 border rounded text-center text-lg tracking-widest f-14"
              value={webCode}
              onChange={(e) => setWebCode(e.target.value)}
            />
            <button
              onClick={handleWebCodeSubmit}
              className="w-full bg-[#D7763D] text-white py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? (
                <ScaleLoader height={10} width={3} color="#fff" />
              ) : (
                "Verify"
              )}
            </button>
          </div>
        )}

        {step === "reset" && (
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full px-3 py-2 border rounded f-14 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {!showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full px-3 py-2 border rounded f-14 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {!showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
            <button
              onClick={handlePasswordReset}
              className="w-full bg-[#D7763D] text-white py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? (
                <ScaleLoader height={10} width={3} color="#fff" />
              ) : (
                "Update Password"
              )}
            </button>

            <div className="text-sm space-y-1 f-11">
              <PasswordCheckItem
                label="At least 8 characters"
                isValid={isMinLength}
              />
              <PasswordCheckItem
                label="One uppercase letter"
                isValid={hasUppercase}
              />
              <PasswordCheckItem label="One number" isValid={hasNumber} />
              <PasswordCheckItem
                label="One special character (!@#$%^&*)"
                isValid={hasSpecialChar}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
