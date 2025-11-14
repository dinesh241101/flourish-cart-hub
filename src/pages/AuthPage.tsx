import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    whatsappNumber: "",
    contactNumber: "",
    city: "",
    pincode: "",
    address: "",
  });

  // Signup changes
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔵 Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Logged in successfully" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Signup handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Account created successfully" });

      navigate("/login");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
      }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-blue-500/40 animate-pulse blur-3xl opacity-60"></div>

      <Card className="relative w-full max-w-2xl backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl">
        <CardContent className="p-8">
          
          {/* Toggle Buttons */}
          <div className="flex justify-center mb-8 gap-2 bg-white/10 p-1 rounded-full">
            <button
              onClick={() => setMode("login")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-white text-black shadow"
                  : "text-white opacity-70"
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() => setMode("signup")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-white text-black shadow"
                  : "text-white opacity-70"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* ---------------- LOGIN FORM ---------------- */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fadeIn">
              <div>
                <Label className="text-white">Email</Label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-white/20 border-white/30 text-white placeholder-white/70"
                  required
                />
              </div>

              <div>
                <Label className="text-white">Password</Label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-white/20 border-white/30 text-white placeholder-white/70"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm text-white/90">
                <Link to="/forgot-password" className="hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          )}

          {/* ---------------- SIGNUP FORM ---------------- */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {[
                  "name",
                  "email",
                  "password",
                  "whatsappNumber",
                  "contactNumber",
                  "city",
                  "pincode",
                ].map((field) => (
                  <div key={field}>
                    <Label className="capitalize text-white">{field}</Label>
                    <Input
                      name={field}
                      type={field === "password" ? "password" : "text"}
                      placeholder={`Enter ${field}`}
                      value={(formData as any)[field]}
                      onChange={handleSignupChange}
                      className="bg-white/20 border-white/30 text-white placeholder-white/70"
                      required
                    />
                  </div>
                ))}

                <div className="md:col-span-2">
                  <Label className="text-white">Address</Label>
                  <Input
                    name="address"
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={handleSignupChange}
                    className="bg-white/20 border-white/30 text-white placeholder-white/70"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
