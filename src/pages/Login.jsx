import { useEffect, useState } from "react";
import logo from "../assets/ccp-logo.png";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import { useAuth } from "../utils/idb";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWebCode, setShowWebCode] = useState(false);
  const [otpBtnDisabled, setOtpBtnDisabled] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userPanel, setUserPanel] = useState(null);
  const [tempUser, setTempUser] = useState(null);

   const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { user, login } = useAuth();
  useEffect(() => {
    if (user && user.login_date) {
      const loginDateObj = new Date(user.login_date);
      if (!isNaN(loginDateObj.getTime())) {
        const today = new Date().toISOString().split("T")[0];
        const loginDate = loginDateObj.toISOString().split("T")[0];

        if (loginDate === today) {
          navigate("/chat");
        }
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        "https://webexback-06cc.onrender.com/api/users/login", // Adjust endpoint if needed
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.status) {
        //if (data.data.user_type != "admin") {

          //setTempUser(data.data);
          //setUserPanel(data.data.user_panel);
          //setShowWebCode(true);

          // login(data.data);
          // navigate("/chat");

        //} else {
          toast.success("Login successful!");
          login(data.data);
          navigate("/chat");
        //}
      } else {
        toast.error(data.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHandleOtpSubmit = async (e) => {
    try {
      e.preventDefault();
      setOtpBtnDisabled(true); // Disable the button to prevent multiple submissions

      const otpValue = otp.join("");

      if (otpValue.length !== 4) {
        toast.error("Please enter a valid 4-digit Code.");
        return;
      }
      if (userPanel == "AP") {
        const response = await fetch(
          "https://www.thehrbulb.com/team-member-panel/api/checkWebCode",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, code: otpValue }),
          }
        );
        const data = await response.json();
        if (data.status == "true") {
          toast.success("Code verified successfully.");
          login(tempUser); // Call the login function with the user data
          navigate("/chat");
        } else {
          toast.error(data.message || "Invalid Code");
        }
      } else if (userPanel == "SP") {
        const response = await fetch(
          "https://elementk.in/spbackend/api/users/check-web-code",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, code: otpValue }),
          }
        );
        const data = await response.json();
        if (data.status == "true") {
          toast.success("Code verified successfully.");
          login(tempUser); // Call the login function with the user data
          navigate("/chat");
        } else {
          toast.error(data.message || "Invalid Code.");
        }
      } else {
        toast.error("Invalid user Panel");
      }
    } catch (error) {
      console.error("OTP Error:", error);
    } finally {
      setOtpBtnDisabled(false); // Re-enable the button after the request completes
    }
  };

  const handleOtpChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleBack = () => {
    setShowWebCode(false);
    setOtp(["", "", "", ""]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center background-log">
      <div className=" rounded p-4 w-full max-w-sm bg-log-set">
        {showWebCode && (
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-[#092e46] hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
        )}
        <div className="flex items-center gap-3 justify-center mb-1">
          <img src={logo} alt="RapidShare" className="w-25 h-11" />
        </div>
        {!showWebCode && (
          <h2 className="text-xl font-semibold text-center text-gray-700 mb-3">
            Login
          </h2>
        )}

        {!showWebCode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#D7763D] f-14"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />


            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#D7763D] f-14"
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

            <div className="flex justify-between items-center">
              <button
                    type="button"
                    onClick={() => {navigate("/forgot-password")}}
                    className="flex items-center justify-center text-[#D7763D]  py-1 px-2 rounded hover:opacity-90 hover:underline transition f-11"
                    >
                    Forgot Password?
                    </button>
                <div className="text-end">
                    <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center  bg-[#D7763D] text-white f-14 py-1 px-2 rounded hover:opacity-90 transition"
                    >
                    {isSubmitting ? (
                        <ScaleLoader
                        color="#ffffff"
                        height={10}
                        width={3}
                        radius={2}
                        margin={2}
                        />
                    ) : (
                        "Login"
                    )}
                    </button>

                    
                </div>
                
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <h5 className="text-l font-semibold text-center text-gray-700 top-12">
              Enter the 4-digit WEBCODE
            </h5>

            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  className="w-10 h-10 text-center border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-[#092e46]"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                />
              ))}
            </div>
            <button
              onClick={handleHandleOtpSubmit}
              disabled={otpBtnDisabled}
              className="flex items-center font-semibold justify-center w-full bg-[#D7763D] text-white py-2 rounded-lg transition"
            >
              Verify
              {otpBtnDisabled && (
                <div className="ml-2">
                  <ScaleLoader
                    color="#ffffff"
                    height={10}
                    width={3}
                    radius={2}
                    margin={2}
                  />
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
