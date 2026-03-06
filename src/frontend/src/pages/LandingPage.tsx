import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Globe,
  Image,
  MessageCircle,
  ShieldCheck,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Blockchain Identity",
    desc: "Your ICP principal is your verifiable social identity — no passwords, no hacks.",
  },
  {
    icon: Image,
    title: "Own Your Posts",
    desc: "Every post is stored on-chain. Your content, your ownership, forever.",
  },
  {
    icon: Globe,
    title: "Decentralized Feed",
    desc: "No algorithm manipulation. See what matters from people you follow.",
  },
  {
    icon: Users,
    title: "Social Graph",
    desc: "Follow, get followed. Your network belongs to you, not a corporation.",
  },
  {
    icon: MessageCircle,
    title: "Encrypted DMs",
    desc: "Direct messages powered by the Internet Computer protocol.",
  },
  {
    icon: Zap,
    title: "NFT Minting",
    desc: "Turn any post into an NFT. Monetize your creativity on-chain.",
  },
];

const STATS = [
  { value: "100%", label: "Decentralized" },
  { value: "0ms", label: "Censorship" },
  { value: "∞", label: "Ownership" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen mesh-bg overflow-hidden">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-gradient">
              Connectogram
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                size="sm"
                className="btn-gradient rounded-xl font-semibold"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/assets/generated/hero-bg.dim_1600x900.jpg"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 glass border border-primary/30 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-brand animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">
                Built on Internet Computer Protocol
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              <span className="text-foreground">Own Your</span>
              <br />
              <span className="text-gradient">Social Identity</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Connectogram is the Web3 social platform where your content lives
              on blockchain, your identity is sovereign, and your network
              belongs to you — not a corporation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="btn-gradient rounded-2xl px-8 h-12 text-base font-semibold"
                >
                  Start Creating
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl px-8 h-12 text-base font-semibold border-border/60 hover:border-primary/50 hover:bg-primary/5"
                >
                  Explore Posts
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="relative max-w-2xl mx-auto mt-16 grid grid-cols-3 gap-4"
        >
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="glass rounded-2xl p-6 text-center border border-border/40"
            >
              <div className="text-3xl font-display font-bold text-gradient mb-1">
                {value}
              </div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Preview cards */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="text-foreground">A feed that's </span>
              <span className="text-gradient">truly yours</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Share moments. Connect with creators. Verify everything on-chain.
            </p>
          </motion.div>

          {/* Post previews */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                img: "/assets/generated/post-tokyo-night.dim_800x600.jpg",
                user: "sofia.art",
                caption: "Tokyo nights never disappoint ✨",
                tags: ["photography", "travel"],
              },
              {
                img: "/assets/generated/post-blockchain-art.dim_800x600.jpg",
                user: "alex.dev",
                caption: "New NFT series dropping soon 🔮",
                tags: ["nft", "web3", "art"],
              },
              {
                img: "/assets/generated/post-architecture.dim_800x600.jpg",
                user: "maya.web3",
                caption: "Finding beauty in structure 🏛️",
                tags: ["architecture", "minimal"],
              },
            ].map((p, pIdx) => (
              <motion.div
                key={p.user}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: pIdx * 0.12, duration: 0.5 }}
                className="glass glass-hover rounded-2xl overflow-hidden shadow-glass"
              >
                <img
                  src={p.img}
                  alt={p.caption}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-brand" />
                    <span className="text-sm font-semibold">{p.user}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-primary ml-auto" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {p.caption}
                  </p>
                  <div className="flex gap-1.5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs text-gradient font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="text-gradient">Web3</span>
              <span className="text-foreground"> features built-in</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass glass-hover rounded-2xl p-6 border border-border/40"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center mb-4 shadow-glow-sm">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 border border-primary/20 shadow-glow"
          >
            <div className="flex justify-center mb-6">
              {["s1", "s2", "s3", "s4", "s5"].map((sk) => (
                <Star
                  key={sk}
                  className="w-5 h-5 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">
              Ready to own your{" "}
              <span className="text-gradient">social presence</span>?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of creators building their Web3 social identity on
              Connectogram.
            </p>
            <Link to="/auth">
              <Button
                size="lg"
                className="btn-gradient rounded-2xl px-10 h-12 text-base font-semibold"
              >
                Create Your Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-brand flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gradient">
              Connectogram
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
