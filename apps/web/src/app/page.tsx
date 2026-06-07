import Link from "next/link";
import {
  Sparkles,
  Shirt,
  WashingMachine,
  Wind,
  Footprints,
  Sofa,
  Blinds,
  Layers,
  Baby,
  ShieldCheck,
  Truck,
  Clock,
  Leaf,
  Star,
  CheckCircle2,
  ArrowRight,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  { icon: WashingMachine, name: "Wash & Fold", price: "from ₹89/kg", desc: "Daily wear washed, dried & neatly folded." },
  { icon: Shirt, name: "Wash & Iron", price: "from ₹109/kg", desc: "Crisp, ready-to-wear finish for every piece." },
  { icon: Wind, name: "Steam Iron", price: "from ₹15/piece", desc: "Salon-grade steam pressing, no shrinkage." },
  { icon: Sparkles, name: "Premium Dry Clean", price: "from ₹99/piece", desc: "For sarees, suits, silks & delicates." },
  { icon: Layers, name: "Curtain & Drapery", price: "from ₹49/kg", desc: "Heavy fabrics handled with industrial care." },
  { icon: Sofa, name: "Sofa & Carpet", price: "from ₹599/seat", desc: "Deep extraction cleaning at your home." },
  { icon: Footprints, name: "Shoe Cleaning", price: "from ₹299/pair", desc: "Sneakers, leather & suede restored." },
  { icon: Baby, name: "Baby Care Wash", price: "from ₹129/kg", desc: "Hypoallergenic, fragrance-free formula." },
];

const steps = [
  { n: "01", t: "Schedule Pickup", d: "Pick a 60-min slot. We arrive at your door." },
  { n: "02", t: "We Clean With Care", d: "Sorted, weighed and processed at certified plants." },
  { n: "03", t: "Delivered in 24h", d: "Fresh, folded and on-hanger — right back to you." },
];

const trust = [
  { icon: Clock, t: "24-hour turnaround" },
  { icon: Leaf, t: "Eco-friendly detergents" },
  { icon: ShieldCheck, t: "Damage protection" },
  { icon: Truck, t: "Free pickup & delivery" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">Dryzle</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#services" className="hover:text-foreground">Services</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex text-sm font-semibold text-foreground hover:text-primary px-3 py-2">
              Sign in
            </Link>
            <Link href="/login">
              <Button className="rounded-full px-5">Schedule Pickup</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-emerald-100" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-200/50 blur-3xl -z-10" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-300/40 blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              <Leaf className="w-3.5 h-3.5" /> Eco-friendly · Hyperlocal · 24h
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Laundry, freshly done.
              <span className="block text-primary">Delivered in 24 hours.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              From everyday wash &amp; fold to premium dry cleaning, shoe care and
              sofa deep-clean — Dryzle picks up from your door and brings it back
              spotless. Just like UClean, only greener.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/login">
                <Button size="lg" className="rounded-full px-7 h-12 text-base font-semibold w-full sm:w-auto">
                  Schedule a Pickup <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <a href="#services">
                <Button size="lg" variant="outline" className="rounded-full px-7 h-12 text-base font-semibold w-full sm:w-auto">
                  Explore Services
                </Button>
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                { n: "1L+", l: "Clothes washed" },
                { n: "4.9★", l: "Avg. rating" },
                { n: "50+", l: "Cities" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-extrabold text-foreground">{s.n}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div className="relative">
            <div className="relative rounded-3xl bg-card shadow-2xl border p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
                  <WashingMachine className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold">Next Pickup</div>
                  <div className="text-sm text-muted-foreground">Today · 6:00 – 7:00 PM</div>
                </div>
                <span className="ml-auto text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                  Confirmed
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { t: "Wash & Fold", w: "3.5 kg", p: "₹312" },
                  { t: "Steam Iron", w: "8 pieces", p: "₹120" },
                  { t: "Dry Clean", w: "1 suit", p: "₹349" },
                ].map((row) => (
                  <div
                    key={row.t}
                    className="flex items-center justify-between rounded-xl border bg-background px-4 py-3"
                  >
                    <div>
                      <div className="font-semibold text-sm">{row.t}</div>
                      <div className="text-xs text-muted-foreground">{row.w}</div>
                    </div>
                    <div className="font-bold text-sm">{row.p}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div>
                  <div className="text-xs text-muted-foreground">Estimated</div>
                  <div className="text-xl font-extrabold">₹781</div>
                </div>
                <Link href="/login">
                  <Button className="rounded-full">Track Order</Button>
                </Link>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden sm:flex items-center gap-2 bg-card border shadow-lg rounded-full px-4 py-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold">100% Damage Cover</span>
            </div>
            <div className="absolute -top-5 -right-5 hidden sm:flex items-center gap-2 bg-card border shadow-lg rounded-full px-4 py-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-semibold">4.9 · 12k reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y bg-emerald-50/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {trust.map((b) => (
            <div key={b.t} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
                <b.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">{b.t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Our Services</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Every fabric. Every fix. One Dryzle.
            </h2>
            <p className="mt-3 text-muted-foreground">
              From your daily t-shirts to that one wedding sherwani — we have a
              service tuned for it.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s) => (
              <div
                key={s.name}
                className="group rounded-2xl border bg-card p-6 hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 font-bold text-lg">{s.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                <div className="mt-4 text-sm font-semibold text-primary">{s.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 bg-gradient-to-b from-white to-emerald-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">How it works</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Three taps. Zero trips to the laundry.
            </h2>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {steps.map((st) => (
              <div key={st.n} className="relative rounded-2xl bg-card border p-8">
                <div className="text-5xl font-extrabold text-emerald-100">{st.n}</div>
                <h3 className="mt-2 text-xl font-bold">{st.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{st.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Transparent pricing</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Pay by the kilo. No hidden charges.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md">
              Live pricing from your nearest Dryzle partner. Free pickup &amp;
              delivery on every order above ₹299.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Free door pickup & delivery",
                "Real-time order tracking with live map",
                "Skin-safe, biodegradable detergents",
                "Re-wash guarantee within 48 hours",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">{p}</span>
                </li>
              ))}
            </ul>
            <Link href="/login" className="inline-block mt-8">
              <Button size="lg" className="rounded-full px-7">Get Started</Button>
            </Link>
          </div>

          <div className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-white/5" />
            <div className="relative">
              <div className="text-sm font-semibold opacity-80">Starter Pack</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold">₹89</span>
                <span className="opacity-80">/ kg</span>
              </div>
              <p className="mt-3 text-sm opacity-90 max-w-sm">
                Best for everyday laundry. Wash, dry &amp; fold with eco
                detergents. Delivered in 24 hours.
              </p>

              <div className="mt-8 space-y-3">
                {["Min order 3 kg", "Free pickup & delivery", "Damage protection up to ₹2,000"].map((x) => (
                  <div key={x} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    {x}
                  </div>
                ))}
              </div>

              <Link href="/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="mt-8 rounded-full bg-white text-primary hover:bg-white/90"
                >
                  Schedule Pickup <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 bg-emerald-50/60 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Blinds className="w-10 h-10 text-primary mx-auto" />
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready for a laundry-free weekend?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Join 100,000+ households who trust Dryzle every week. Your clothes
            deserve the green treatment.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button size="lg" className="rounded-full px-7">Schedule Pickup</Button>
            </Link>
            <a href="tel:+911800000000">
              <Button size="lg" variant="outline" className="rounded-full px-7">
                <Phone className="w-4 h-4 mr-2" /> Talk to us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold">Dryzle</span>
            </div>
            <p className="mt-3 text-muted-foreground">
              Hyperlocal, eco-friendly laundry pickup &amp; delivery.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-3">Services</div>
            <ul className="space-y-2 text-muted-foreground">
              <li>Wash &amp; Fold</li>
              <li>Dry Cleaning</li>
              <li>Steam Iron</li>
              <li>Shoe &amp; Sofa Care</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Company</div>
            <ul className="space-y-2 text-muted-foreground">
              <li>About</li>
              <li>Partner with us</li>
              <li>Careers</li>
              <li>Press</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Contact</div>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 1800-000-000</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Available in 50+ cities</li>
            </ul>
          </div>
        </div>
        <div className="border-t py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dryzle. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
