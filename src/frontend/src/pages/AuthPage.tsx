import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useRegisterUser } from "../hooks/useQueries";

export function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing, isLoggingIn, login, userProfile } =
    useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const registerUser = useRegisterUser();

  // After auth + profile check
  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      if (userProfile) {
        void navigate({ to: "/feed" });
      } else {
        setShowRegister(true);
      }
    }
  }, [isAuthenticated, isInitializing, userProfile, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    try {
      await registerUser.mutateAsync({
        username: username.trim(),
        bio,
        profilePicture: null,
      });
      toast.success("Welcome to Connectogram! 🎉");
      void navigate({ to: "/feed" });
    } catch (_err) {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow animate-pulse-glow">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <p className="text-muted-foreground text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show registration form after ICP login
  if (showRegister && isAuthenticated && !userProfile) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8 border border-border/50 shadow-glass">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 shadow-glow">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-2">
                Create Your Profile
              </h1>
              <p className="text-muted-foreground text-sm">
                You're verified on ICP! Now set up your Connectogram identity.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    data-ocid="auth.username.input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    className="pl-9 bg-secondary border-border/50 focus:border-primary/50 rounded-xl"
                    maxLength={30}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="bio"
                    data-ocid="auth.bio.textarea"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your story..."
                    className="pl-9 bg-secondary border-border/50 focus:border-primary/50 rounded-xl resize-none"
                    rows={3}
                    maxLength={150}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/150
                </p>
              </div>

              <Button
                type="submit"
                data-ocid="auth.submit_button"
                className="w-full btn-gradient rounded-xl h-11 font-semibold"
                disabled={registerUser.isPending || !username.trim()}
              >
                {registerUser.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating profile...
                  </>
                ) : (
                  "Launch My Profile 🚀"
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Left: branding (desktop only) */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-lg"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-display font-bold text-gradient">
              Connectogram
            </span>
          </div>
          <h2 className="text-4xl font-display font-bold leading-tight mb-6">
            Your social identity,
            <br />
            <span className="text-gradient">owned by you.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            No algorithms. No data harvesting. Just pure social connection
            powered by the Internet Computer blockchain.
          </p>

          {/* Feature list */}
          {[
            "ICP blockchain-verified identity",
            "Post ownership stored on-chain",
            "Decentralized messaging",
            "NFT post minting",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 rounded-full bg-gradient-brand flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">{f}</span>
            </div>
          ))}

          {/* Sample post preview */}
          <div className="mt-10 glass rounded-2xl overflow-hidden border border-border/40">
            <img
              src="/assets/generated/post-blockchain-art.dim_800x600.jpg"
              alt="preview"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gradient-brand" />
                <span className="text-sm font-semibold">alex.dev</span>
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                My latest NFT piece is live 🎨
              </p>
              <div className="flex gap-1.5 mt-1.5">
                <span className="text-xs text-gradient">#nft</span>
                <span className="text-xs text-gradient">#web3</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right: auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gradient">
              Connectogram
            </span>
          </div>

          <div className="glass rounded-3xl p-8 border border-border/50 shadow-glass">
            <Tabs defaultValue="login">
              <TabsList className="w-full mb-6 bg-secondary rounded-xl p-1">
                <TabsTrigger
                  value="login"
                  data-ocid="auth.login.tab"
                  className="flex-1 rounded-lg data-[state=active]:bg-gradient-brand data-[state=active]:text-white data-[state=active]:shadow-glow-sm font-medium"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  data-ocid="auth.register.tab"
                  className="flex-1 rounded-lg data-[state=active]:bg-gradient-brand data-[state=active]:text-white data-[state=active]:shadow-glow-sm font-medium"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6 mt-0">
                <div className="text-center">
                  <h1 className="text-2xl font-display font-bold mb-2">
                    Welcome back
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Connect your ICP identity to continue
                  </p>
                </div>

                <div className="glass rounded-2xl p-5 border border-primary/20 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Internet Computer Identity</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Login with Internet Identity — a secure, decentralized
                    authentication system that uses your device's biometrics or
                    a security key.
                  </p>
                </div>

                <Button
                  data-ocid="auth.submit_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full btn-gradient rounded-xl h-12 font-semibold text-base"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Connect with ICP
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Your private key never leaves your device
                </p>
              </TabsContent>

              <TabsContent value="register" className="space-y-6 mt-0">
                <div className="text-center">
                  <h1 className="text-2xl font-display font-bold mb-2">
                    Join Connectogram
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Create your Web3 social identity
                  </p>
                </div>

                <div className="glass rounded-2xl p-5 border border-primary/20 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    How it works
                  </p>
                  <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                    <li>
                      Connect with Internet Identity (biometrics / security key)
                    </li>
                    <li>Your ICP principal becomes your unique ID</li>
                    <li>Set your username & bio</li>
                    <li>Start posting on the blockchain!</li>
                  </ol>
                </div>

                <Button
                  data-ocid="auth.submit_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full btn-gradient rounded-xl h-12 font-semibold text-base"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Get Started with ICP
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  No email required. No password to forget. Pure Web3.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
