import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const handleSignupChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // LOGIN
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Logged in" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP
  const handleSignup = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Account created" });
      setMode("login");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
      <div className="absolute w-[700px] h-[700px] bg-purple-500/20 rounded-full blur-[160px] animate-pulse" />
      <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[160px] animate-pulse delay-300" />

      <Card className="relative z-10 w-full max-w-xl bg-white/10 border-white/20 backdrop-blur-2xl shadow-2xl rounded-2xl p-6 md:p-10">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-white mb-1 tracking-tight">
            {mode === "login" ? "Welcome Back 👋" : "Create Your Account ✨"}
          </h2>
          <p className="text-white/70 text-sm">
            {mode === "login"
              ? "Login to access your dashboard"
              : "Sign up to get started"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex w-full bg-white/10 rounded-xl p-1 mb-8">
          <button
            onClick={() => setMode("login")}
            className={`w-1/2 py-2 rounded-lg transition-all ${
              mode === "login"
                ? "bg-white text-black shadow"
                : "text-white/70"
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => setMode("signup")}
            className={`w-1/2 py-2 rounded-lg transition-all ${
              mode === "signup"
                ? "bg-white text-black shadow"
                : "text-white/70"
            }`}
          >
            Sign Up
          </button>
        </div>

        <CardContent className="p-0">

          {/* LOGIN */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-5 animate-fadeIn">
              <div>
                <Label className="text-white">Email</Label>
                <Input
                  className="bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-purple-400"
                  placeholder="you@example.com"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label className="text-white">Password</Label>
                <Input
                  className="bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-purple-400"
                  placeholder="••••••••"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-between text-sm text-white/70">
                <Link to="/forgot-password" className="hover:text-white underline">
                  Forgot password?
                </Link>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          )}

          {/* SIGNUP */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* All fields EXACTLY SAME */}
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
                    <Label className="text-white capitalize">{field}</Label>
                    <Input
                      name={field}
                      type={field === "password" ? "password" : "text"}
                      value={(formData as any)[field]}
                      onChange={handleSignupChange}
                      placeholder={`Enter ${field}`}
                      className="bg-white/10 border-white/20 text-white placeholder-white/40"
                      required
                    />
                  </div>
                ))}

                {/* Address */}
                <div className="md:col-span-2">
                  <Label className="text-white">Address</Label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleSignupChange}
                    placeholder="Enter your full address"
                    className="bg-white/10 border-white/20 text-white placeholder-white/40"
                    required
                  />
                </div>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {loading ? "Creating..." : "Sign Up"}
              </Button>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
