import { Phone, MessageCircle, ArrowRight, Upload, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

export default function PrimitivesShowcase() {
  return (
    <main className="bg-[var(--neutral-50)] min-h-screen">
      <div className="container section">
        <div className="sec-head">
          <p className="eyebrow">EP1 — Design System</p>
          <h1>UI Primitives Showcase</h1>
          <p>
            All components use tokens from <code className="mono">tokens.css</code>. No hardcoded
            hex values.
          </p>
        </div>

        {/* Badges */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-[var(--primary-navy)] mb-6">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline">Outline Badge</Badge>
            <Badge variant="amber">Pre-Deposit Required</Badge>
            <Badge variant="green">Active</Badge>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-[var(--primary-navy)] mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Button variant="primary">
              <Upload className="ic" aria-hidden="true" />
              Upload Your Notice
            </Button>
            <Button variant="secondary">
              <Phone className="ic" aria-hidden="true" />
              Request Callback
            </Button>
            <Button variant="whatsapp">
              <MessageCircle className="ic" aria-hidden="true" />
              Chat on WhatsApp
            </Button>
            <Button variant="phone">
              <Phone className="ic" aria-hidden="true" />
              +91 93432 97622
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Button variant="tertiary">
              Learn More
              <ArrowRight className="ic" aria-hidden="true" />
            </Button>
            <Button variant="primary" disabled>Disabled State</Button>
          </div>
          <div className="bg-[var(--primary-navy)] p-6 rounded-[var(--r-card)] on-dark">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Book Service</Button>
              <Button variant="secondary" className="on-dark">Request Callback</Button>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-[var(--primary-navy)] mb-6">Inputs</h2>
          <div className="grid gap-6 max-w-lg">
            <Input label="Full Name" id="name" placeholder="Enter your full name" />
            <Input label="Email Address" id="email" type="email" placeholder="you@example.com" />
            <Input
              label="Phone Number"
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              error="Please enter a valid phone number"
            />
          </div>
        </section>

        {/* Cards */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-[var(--primary-navy)] mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-[var(--accent-green)]" size={24} aria-hidden="true" />
                <h3 className="text-lg">Default Card</h3>
              </div>
              <p className="text-[var(--neutral-600)] text-sm leading-relaxed">
                Standard card with border and 12px radius. Used for content sections.
              </p>
            </Card>
            <Card elevated className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-[var(--accent-green)]" size={24} aria-hidden="true" />
                <h3 className="text-lg">Elevated Card</h3>
              </div>
              <p className="text-[var(--neutral-600)] text-sm leading-relaxed">
                Elevated with shadow-sm. Used for featured or interactive elements.
              </p>
              <Badge variant="green" className="mt-4">Most Popular</Badge>
            </Card>
            <Card className="p-6 bg-[var(--primary-navy)]">
              <h3 className="text-white text-lg mb-3">Dark Card</h3>
              <p className="text-[rgba(255,255,255,0.75)] text-sm leading-relaxed">
                Navy background variant for CTA sections and emphasis.
              </p>
              <div className="mt-4 on-dark">
                <Button variant="secondary" className="on-dark">Get Started</Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-[var(--primary-navy)] mb-6">Typography</h2>
          <div className="card card-elev p-8 space-y-4">
            <h1>H1 — 48px Bold</h1>
            <h2>H2 — 36px Bold</h2>
            <h3>H3 — 24px Semi-Bold</h3>
            <p className="text-[var(--neutral-900)]">Body — 16px Regular. Inter typeface. Line height 1.6.</p>
            <p className="text-[var(--neutral-600)] text-sm">Small — 14px Regular. Secondary text and meta.</p>
            <p className="mono text-[var(--neutral-600)] text-sm">
              Mono — JetBrains Mono. CIN: U74999MH2024PTC123456 | GSTIN: 27ABCDE1234F1Z5
            </p>
          </div>
        </section>

        {/* Color Palette */}
        <section>
          <h2 className="text-xl font-semibold text-[var(--primary-navy)] mb-6">Color Tokens</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { token: "--primary-navy", label: "Primary Navy", bg: "bg-primary-navy", light: false },
              { token: "--primary-deep-blue", label: "Deep Blue", bg: "bg-primary-deep-blue", light: false },
              { token: "--accent-green", label: "Accent Green", bg: "bg-accent-green", light: false },
              { token: "--warning-amber", label: "Warning Amber", bg: "bg-warning-amber", light: false },
              { token: "--neutral-50", label: "Neutral 50", bg: "bg-neutral-50", light: true },
              { token: "--neutral-200", label: "Neutral 200", bg: "bg-neutral-200", light: true },
              { token: "--neutral-600", label: "Neutral 600", bg: "bg-neutral-600", light: false },
              { token: "--neutral-900", label: "Neutral 900", bg: "bg-neutral-900", light: false },
              { token: "--wa-green", label: "WhatsApp Green", bg: "bg-wa-green", light: true },
            ].map(({ token, label, bg, light }) => (
              <div key={token} className={`card p-4 ${bg}`}>
                <p className={`text-xs font-semibold ${light ? "text-[var(--neutral-900)]" : "text-white"}`}>
                  {label}
                </p>
                <p className={`mono text-[10px] mt-1 opacity-75 ${light ? "text-[var(--neutral-900)]" : "text-white"}`}>
                  {token}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
