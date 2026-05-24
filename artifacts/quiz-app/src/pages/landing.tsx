import { useEffect, useRef } from "react";
import { Link } from "wouter";
import "./landing.css";
import { LogoIcon } from "@/components/logo";

/* ── Inline SVG helpers ─────────────────────────────────────────────── */

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.4 3.3 12.3l.7-4.1L1 5.3l4.2-.7L7 1z"/>
    </svg>
  );
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 440 380" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Desk */}
      <rect x="60" y="270" width="300" height="12" rx="6" fill="rgba(255,255,255,.15)"/>
      {/* Laptop body */}
      <rect x="110" y="180" width="200" height="130" rx="10" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.3)" strokeWidth="2"/>
      {/* Laptop screen */}
      <rect x="118" y="188" width="184" height="110" rx="6" fill="rgba(255,255,255,.18)"/>
      {/* Screen content lines */}
      <rect x="128" y="198" width="80" height="6" rx="3" fill="rgba(255,255,255,.55)"/>
      <rect x="128" y="210" width="120" height="4" rx="2" fill="rgba(255,255,255,.3)"/>
      <rect x="128" y="220" width="100" height="4" rx="2" fill="rgba(255,255,255,.3)"/>
      {/* Progress bar on screen */}
      <rect x="128" y="234" width="144" height="7" rx="3.5" fill="rgba(255,255,255,.12)"/>
      <rect x="128" y="234" width="90" height="7" rx="3.5" fill="rgba(255,255,255,.65)"/>
      {/* Checkmarks on screen */}
      <circle cx="136" cy="252" r="7" fill="rgba(52,211,153,.8)"/>
      <path d="M132 252l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="152" cy="252" r="7" fill="rgba(52,211,153,.8)"/>
      <path d="M148 252l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="168" cy="252" r="7" fill="rgba(255,255,255,.25)"/>
      {/* Laptop base */}
      <path d="M100 310 Q130 282 160 282 L260 282 Q290 282 320 310Z" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>
      {/* Person */}
      {/* Head */}
      <circle cx="210" cy="148" r="28" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.35)" strokeWidth="2"/>
      <circle cx="210" cy="145" r="20" fill="rgba(255,220,180,.85)"/>
      {/* Hair */}
      <path d="M190 138 Q210 120 230 138 Q228 126 210 122 Q192 126 190 138Z" fill="#4a3728"/>
      {/* Body */}
      <path d="M175 260 Q175 220 210 215 Q245 220 245 260Z" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.25)" strokeWidth="1.5"/>
      {/* Arms typing */}
      <path d="M178 230 Q165 248 150 258" stroke="rgba(255,220,180,.85)" strokeWidth="10" strokeLinecap="round"/>
      <path d="M242 230 Q255 248 270 258" stroke="rgba(255,220,180,.85)" strokeWidth="10" strokeLinecap="round"/>

      {/* Floating element: Quiz card top-right */}
      <g transform="translate(310, 60)">
        <rect width="110" height="72" rx="12" fill="white" opacity=".92"/>
        <rect x="12" y="12" width="50" height="5" rx="2.5" fill="#0d72d6" opacity=".7"/>
        <rect x="12" y="22" width="86" height="3" rx="1.5" fill="#e2e8f0"/>
        <rect x="12" y="30" width="70" height="3" rx="1.5" fill="#e2e8f0"/>
        <circle cx="20" cy="46" r="7" fill="#34d399"/>
        <path d="M16 46l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="32" y="42" width="40" height="3" rx="1.5" fill="#e2e8f0"/>
        <circle cx="20" cy="61" r="7" fill="#e2e8f0"/>
        <rect x="32" y="57" width="55" height="3" rx="1.5" fill="#e2e8f0"/>
      </g>

      {/* Floating element: trophy top-left */}
      <g transform="translate(22, 80)">
        <rect width="72" height="72" rx="14" fill="rgba(255,255,255,.15)" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
        {/* Trophy */}
        <path d="M36 18 C28 18 24 24 24 30 C24 38 30 43 36 44 C42 43 48 38 48 30 C48 24 44 18 36 18Z" fill="rgba(255,200,50,.9)"/>
        <path d="M24 26 C20 26 18 29 18 32 C18 36 21 38 24 38" stroke="rgba(255,200,50,.9)" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M48 26 C52 26 54 29 54 32 C54 36 51 38 48 38" stroke="rgba(255,200,50,.9)" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <rect x="32" y="44" width="8" height="6" fill="rgba(255,200,50,.9)"/>
        <rect x="28" y="50" width="16" height="4" rx="2" fill="rgba(255,200,50,.9)"/>
        <path d="M32 32l2.5 2.5 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      {/* Floating element: analytics bottom-right */}
      <g transform="translate(340, 180)">
        <rect width="82" height="70" rx="12" fill="rgba(255,255,255,.15)" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
        {/* Bar chart */}
        <rect x="14" y="40" width="10" height="18" rx="3" fill="rgba(255,255,255,.5)"/>
        <rect x="28" y="28" width="10" height="30" rx="3" fill="rgba(255,255,255,.8)"/>
        <rect x="42" y="32" width="10" height="26" rx="3" fill="rgba(255,255,255,.6)"/>
        <rect x="56" y="20" width="10" height="38" rx="3" fill="rgba(255,255,255,.95)"/>
        <rect x="10" y="58" width="62" height="1.5" rx=".75" fill="rgba(255,255,255,.3)"/>
        <rect x="14" y="12" width="28" height="4" rx="2" fill="rgba(255,255,255,.5)"/>
      </g>

      {/* Floating dots */}
      <circle cx="80" cy="200" r="5" fill="rgba(255,255,255,.35)"/>
      <circle cx="370" cy="140" r="4" fill="rgba(255,255,255,.3)"/>
      <circle cx="55" cy="160" r="3" fill="rgba(255,255,255,.25)"/>
      <circle cx="400" cy="270" r="6" fill="rgba(255,255,255,.2)"/>
      <circle cx="340" cy="100" r="3.5" fill="rgba(52,211,153,.6)"/>
      <circle cx="95" cy="310" r="4" fill="rgba(59,142,232,.6)"/>
    </svg>
  );
}

/* ── Feature icons ─────────────────────────── */
function TimerIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 3h6"/><path d="M12 3v2"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}
function ZapIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

/* ── Step icons ────────────────────────────── */
function PencilIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0d72d6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0d72d6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}
function TrendingIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0d72d6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  );
}

/* ── Main component ──────────────────────────── */
export default function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    /* Scroll-triggered fade-up animations */
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observerRef.current?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".lp-fade-up").forEach((el) => {
      observerRef.current?.observe(el);
    });

    /* Sticky nav shadow on scroll */
    const onScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle("scrolled", window.scrollY > 10);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="lp">
      {/* ── Navbar ── */}
      <nav className="lp-nav" ref={navRef}>
        <a href="#" className="lp-nav-logo">
          <LogoIcon size={32} />
          RecruIQ
        </a>
        <div className="lp-nav-btns">
          <Link href="/login?tab=candidate" className="lp-btn lp-btn-ghost">
            Take Assessment
          </Link>
          <Link href="/login?tab=admin" className="lp-btn lp-btn-primary">
            Admin Login
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-bg-circle lp-hero-bg-circle-1" />
        <div className="lp-hero-bg-circle lp-hero-bg-circle-2" />
        <div className="lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-hero-badge">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="5"/></svg>
              Trusted by 500+ companies worldwide
            </div>
            <h1 className="lp-hero-title">
              Hire Smarter.<br />
              <span>Assess Better.</span>
            </h1>
            <p className="lp-hero-sub">
              RecruIQ helps talent teams build skill-based assessments, send them to candidates, and get instant, data-backed results — all in one platform.
            </p>
            <div className="lp-hero-actions">
              <Link href="/login?tab=admin" className="lp-btn lp-btn-white lp-btn-lg">
                I'm a Recruiter →
              </Link>
              <Link href="/login?tab=candidate" className="lp-btn lp-btn-outline-white lp-btn-lg">
                Take an Assessment
              </Link>
            </div>
            <div className="lp-hero-trust">
              <div className="lp-hero-trust-avatars">
                {["S","M","P","J","A"].map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
              <span>Join 10,000+ candidates already assessed</span>
            </div>
          </div>
          <div className="lp-hero-illustration">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-fade-up" style={{ textAlign: "center" }}>
            <span className="lp-section-label">Simple Process</span>
            <h2 className="lp-section-title">How RecruIQ works</h2>
            <p className="lp-section-sub" style={{ margin: "0 auto 56px" }}>
              From quiz creation to final analytics in three effortless steps.
            </p>
          </div>
          <div className="lp-steps">
            {[
              { icon: <PencilIcon />, n: 1, title: "Recruiter creates a quiz", desc: "Build timed assessments with multiple-choice, true/false, or open questions — tailored for any role." },
              { icon: <UsersIcon />, n: 2, title: "Candidates sit the test", desc: "Candidates log in with their email, pick their assigned quiz, and complete it in their own time." },
              { icon: <TrendingIcon />, n: 3, title: "Instantly analyse results", desc: "View scores, pass rates, and per-question analytics the moment the assessment is submitted." },
            ].map((s, i) => (
              <div className={`lp-step lp-fade-up delay-${i + 1}`} key={s.n}>
                <div className="lp-step-number">
                  {s.icon}
                  <span className="lp-step-number-badge">{s.n}</span>
                </div>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-section lp-section-alt">
        <div className="lp-section-inner">
          <div className="lp-fade-up">
            <span className="lp-section-label">Platform Features</span>
            <h2 className="lp-section-title">Everything you need to assess talent</h2>
            <p className="lp-section-sub">
              Purpose-built tools that save your team hours and surface better hiring signals.
            </p>
          </div>
          <div className="lp-features-grid">
            {[
              { icon: <TimerIcon />, title: "Timed Assessments", desc: "Set per-quiz time limits. Auto-submit when time runs out so every candidate has a fair, consistent experience." },
              { icon: <ShieldIcon />, title: "Role-based Access", desc: "Admins manage everything. Candidates see only what they need. Secure, session-backed authentication throughout." },
              { icon: <ZapIcon />, title: "Instant Results", desc: "Scores are calculated server-side the moment a quiz is submitted — no waiting, no manual grading." },
              { icon: <ChartIcon />, title: "Detailed Analytics", desc: "Per-quiz dashboards show pass rates, score distributions, high/low performers, and question-level insights." },
            ].map((f, i) => (
              <div className={`lp-feature-card lp-fade-up delay-${i + 1}`} key={f.title}>
                <div className="lp-feature-icon">{f.icon}</div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="lp-stats">
        <div className="lp-stats-inner">
          {[
            { n: "10,000+", label: "Candidates Assessed" },
            { n: "500+",    label: "Companies Using RecruIQ" },
            { n: "98%",     label: "Customer Satisfaction" },
          ].map((s, i) => (
            <div className={`lp-fade-up delay-${i + 1}`} key={s.label}>
              <div className="lp-stat-number">{s.n}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Testimonials ── */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-fade-up" style={{ textAlign: "center" }}>
            <span className="lp-section-label">Testimonials</span>
            <h2 className="lp-section-title">Recruiters love RecruIQ</h2>
            <p className="lp-section-sub" style={{ margin: "0 auto 56px" }}>
              Don't just take our word for it.
            </p>
          </div>
          <div className="lp-testimonials-grid">
            {[
              {
                text: "RecruIQ completely changed how we screen candidates. We cut our technical interview workload by 60% and the quality of hires improved dramatically.",
                name: "Ananya Sharma",
                role: "Head of Talent, Meridian Tech",
                initials: "AS",
                color: "linear-gradient(135deg, #667eea, #764ba2)",
              },
              {
                text: "The analytics dashboard is incredible. We can instantly see which questions trip candidates up and adjust our quizzes accordingly. It's data-driven hiring done right.",
                name: "Rohan Mehta",
                role: "Recruitment Manager, Apex Financial",
                initials: "RM",
                color: "linear-gradient(135deg, #0d72d6, #38bdf8)",
              },
              {
                text: "Setup was incredibly fast. We had our first quiz live in under 10 minutes and our hiring team was up and running the same day. Zero training required.",
                name: "Priya Nair",
                role: "HR Director, CloudForge",
                initials: "PN",
                color: "linear-gradient(135deg, #11998e, #38ef7d)",
              },
            ].map((t, i) => (
              <div className={`lp-testimonial-card lp-fade-up delay-${i + 1}`} key={t.name}>
                <div className="lp-testimonial-quote-mark">"</div>
                <div className="lp-stars">
                  {[1,2,3,4,5].map((s) => <StarIcon key={s} />)}
                </div>
                <p className="lp-testimonial-text">"{t.text}"</p>
                <div className="lp-testimonial-author">
                  <div
                    className="lp-testimonial-avatar"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="lp-cta">
        <div className="lp-cta-inner lp-fade-up">
          <h2 className="lp-cta-title">Ready to hire smarter?</h2>
          <p className="lp-cta-sub">
            Join hundreds of talent teams using RecruIQ to run faster, fairer, and more insightful recruitment assessments.
          </p>
          <div className="lp-cta-actions">
            <Link href="/login?tab=admin" className="lp-btn lp-btn-white lp-btn-lg">
              I'm a Recruiter →
            </Link>
            <Link href="/login?tab=candidate" className="lp-btn lp-btn-outline-white lp-btn-lg">
              Take an Assessment
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <a href="#" className="lp-footer-logo">
              <LogoIcon size={28} />
              RecruIQ
            </a>
            <p className="lp-footer-tagline">Hire Smarter. Assess Better.</p>
          </div>
          <div className="lp-footer-links">
            <Link href="/login?tab=admin">Admin Login</Link>
            <Link href="/login?tab=candidate">Candidate Portal</Link>
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
          </div>
        </div>
        <p className="lp-footer-copy">© {new Date().getFullYear()} RecruIQ. All rights reserved.</p>
      </footer>
    </div>
  );
}
