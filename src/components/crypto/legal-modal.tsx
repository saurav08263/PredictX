"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldCheck, FileText, Mail } from "lucide-react"

export type LegalDoc = "privacy" | "terms"

const SUPPORT_EMAIL = "cryptosupport24@gmail.com"

/**
 * LegalModal — full-screen overlay showing the Privacy Policy or Terms &
 * Conditions. Renders as a bottom-sheet on mobile (rounded top, slides up)
 * and as a centered dialog on desktop, matching the app's existing modal
 * pattern (see profile-screen.tsx).
 *
 * Used by the auth screen's "Terms" and "Privacy Policy" links so users can
 * read the legal docs before signing up. Could not be a separate /legal/*
 * route because the app exposes only the / route.
 */
export function LegalModal({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  const isPrivacy = doc === "privacy"
  const title = isPrivacy ? "Privacy Policy" : "Terms & Conditions"
  const Icon = isPrivacy ? ShieldCheck : FileText
  const lastUpdated = "June 19, 2026"

  return (
    <AnimatePresence>
      <motion.div
        key="legal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={onClose}
      >
        <motion.div
          key="legal-sheet"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="relative flex max-h-[92vh] w-full max-w-md flex-col rounded-t-2xl border border-border bg-panel sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header (sticky) */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-panel/95 p-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-bull/15">
                <Icon className="size-4 text-bull" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">{title}</h2>
                <p className="text-[9px] text-muted-foreground">Last updated: {lastUpdated}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="custom-scrollbar max-h-[78vh] overflow-y-auto px-4 py-4 text-xs leading-relaxed text-muted-foreground">
            {isPrivacy ? <PrivacyContent /> : <TermsContent />}

            {/* Contact footer */}
            <div className="mt-6 rounded-xl border border-border bg-card p-3">
              <p className="text-[11px] font-bold text-foreground">Questions about this document?</p>
              <p className="mt-1 text-[11px]">
                Contact our support team — we respond within 24 hours.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(title + " — Question")}`}
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-info hover:underline"
              >
                <Mail className="size-3.5" />
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVACY POLICY
// ─────────────────────────────────────────────────────────────────────────────
function PrivacyContent() {
  return (
    <div className="space-y-5">
      <Section title="1. Introduction">
        <p>
          PredicTX (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates a cryptocurrency
          price-prediction platform that allows users to place real-money predictions on
          the price movement of Bitcoin, Ethereum, and other cryptocurrencies. We are
          committed to protecting your privacy and being transparent about how we
          handle your data.
        </p>
        <p>
          This Privacy Policy explains what information we collect, how we use it, who
          we share it with, and the choices you have. By creating an account or using
          our services, you consent to the practices described in this policy.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p className="font-semibold text-foreground">2.1 Information you provide</p>
        <ul className="ml-4 list-disc space-y-1">
          <li><strong className="text-foreground">Account details:</strong> name, email address, phone number, hashed password, and country.</li>
          <li><strong className="text-foreground">Authentication:</strong> OTP codes (hashed, never stored in plaintext) sent to your phone via SMS for verification.</li>
          <li><strong className="text-foreground">Payment information:</strong> deposit amounts, withdrawal requests, and Razorpay order/payment IDs. We do <strong className="text-foreground">not</strong> store your card number, UPI PIN, or net-banking credentials — Razorpay processes all payments directly.</li>
          <li><strong className="text-foreground">Referral data:</strong> your referral code and the codes of users you refer.</li>
          <li><strong className="text-foreground">Profile preferences:</strong> avatar, notification settings, two-factor authentication preference.</li>
        </ul>
        <p className="font-semibold text-foreground">2.2 Information collected automatically</p>
        <ul className="ml-4 list-disc space-y-1">
          <li><strong className="text-foreground">Usage data:</strong> bets placed, rounds played, win/loss history, wallet balance, and transaction history.</li>
          <li><strong className="text-foreground">Device data:</strong> IP address, browser type, user agent, operating system, and device fingerprint.</li>
          <li><strong className="text-foreground">Security data:</strong> login timestamps, failed login attempts, OTP request counts (for rate-limiting and fraud detection).</li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <ul className="ml-4 list-disc space-y-1">
          <li>To create and manage your account, authenticate your identity, and maintain session security.</li>
          <li>To process deposits and withdrawals via Razorpay and credit winnings to your wallet.</li>
          <li>To send OTP SMS via MSG91 for phone-number verification and transaction alerts.</li>
          <li>To calculate payouts, maintain your bet history, and display leaderboards (using your display name only).</li>
          <li>To detect and prevent fraud, money-laundering, bonus abuse, and multi-accounting.</li>
          <li>To comply with applicable Indian laws, RBI guidelines on digital payments, and lawful requests from authorities.</li>
          <li>To send you service notifications (e.g., deposit confirmations, withdrawal status) and occasional product updates (you can opt out of marketing messages).</li>
          <li>To provide AI-powered assistance through our in-app chat (powered by Z.AI SDK).</li>
        </ul>
      </Section>

      <Section title="4. Third-Party Services">
        <p>We share specific data with trusted third parties to operate the service:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li><strong className="text-foreground">Razorpay</strong> — payment processing. Receives your order ID, amount, and email. Subject to <a className="text-info hover:underline" href="https://razorpay.com/privacy/" target="_blank" rel="noreferrer">Razorpay&apos;s Privacy Policy</a>.</li>
          <li><strong className="text-foreground">MSG91</strong> — SMS gateway for OTP delivery. Receives your phone number and the OTP code. Subject to <a className="text-info hover:underline" href="https://msg91.com/privacy" target="_blank" rel="noreferrer">MSG91&apos;s Privacy Policy</a>.</li>
          <li><strong className="text-foreground">Binance Public API</strong> — live cryptocurrency prices. Receives no personal data (only public ticker requests).</li>
          <li><strong className="text-foreground">Z.AI</strong> — AI chat assistant. Receives the text of your questions to generate responses. No account data is shared.</li>
          <li><strong className="text-foreground">PostgreSQL hosting</strong> — our database provider stores all account, transaction, and bet data securely.</li>
        </ul>
        <p>
          We do <strong className="text-foreground">not</strong> sell your personal data to
          any third party. We do not share your data for cross-context advertising.
        </p>
      </Section>

      <Section title="5. Data Retention">
        <p>
          We retain your data for as long as your account is active. If you delete your
          account, we remove personally identifiable information within 30 days, but
          retain anonymized transaction records for 7 years as required by Indian
          financial regulations and tax law. Audit logs (used for fraud detection and
          dispute resolution) are retained for 5 years.
        </p>
      </Section>

      <Section title="6. Data Security">
        <p>We implement industry-standard security measures:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Passwords are hashed using bcrypt before storage (never stored in plaintext).</li>
          <li>OTP codes are hashed with SHA-256 and compared using constant-time comparison to resist timing attacks.</li>
          <li>Session tokens are signed HS256 JWTs stored in HttpOnly + SameSite cookies (not accessible to JavaScript).</li>
          <li>All payment signatures are verified using HMAC-SHA256 with <code>timingSafeEqual</code> to prevent forgery.</li>
          <li>Database enforces CHECK constraints (non-negative balances) and atomic idempotency flags (no double-crediting).</li>
          <li>All API endpoints are rate-limited to prevent brute-force attacks.</li>
          <li>HTTPS is enforced for all traffic in production.</li>
        </ul>
        <p>
          Despite these measures, no system is 100% secure. In the event of a data
          breach, we will notify affected users within 72 hours as required by
          applicable law.
        </p>
      </Section>

      <Section title="7. Your Rights">
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li><strong className="text-foreground">Access</strong> — request a copy of your personal data.</li>
          <li><strong className="text-foreground">Correction</strong> — request correction of inaccurate data.</li>
          <li><strong className="text-foreground">Deletion</strong> — request deletion of your account and associated data (subject to legal retention requirements).</li>
          <li><strong className="text-foreground">Portability</strong> — receive your data in a machine-readable format.</li>
          <li><strong className="text-foreground">Objection</strong> — object to processing for specific purposes (e.g., marketing).</li>
          <li><strong className="text-foreground">Withdraw consent</strong> — withdraw consent for optional processing at any time.</li>
        </ul>
        <p>
          To exercise any of these rights, email us at <strong className="text-foreground">{SUPPORT_EMAIL}</strong>.
          We respond to verified requests within 30 days.
        </p>
      </Section>

      <Section title="8. Cookies & Local Storage">
        <p>
          We use a minimal set of cookies and local storage:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li><strong className="text-foreground">Session cookie (cp_uid)</strong> — HttpOnly JWT containing your user ID. Expires in 30 days.</li>
          <li><strong className="text-foreground">Local storage</strong> — UI preferences (theme, last-selected bet duration). Cleared on logout.</li>
        </ul>
        <p>
          We do not use third-party advertising cookies (Google Analytics, Facebook Pixel, etc.).
        </p>
      </Section>

      <Section title="9. Children&apos;s Privacy">
        <p>
          The service is strictly for users aged 18 and above. We do not knowingly
          collect data from minors. If you believe a minor has created an account,
          contact us at <strong className="text-foreground">{SUPPORT_EMAIL}</strong> and we
          will delete the account immediately.
        </p>
      </Section>

      <Section title="10. International Transfers">
        <p>
          Your data is stored primarily in India. Some third-party processors (e.g.,
          Razorpay, MSG91) may transfer data outside India for technical operations.
          We ensure such transfers comply with the Information Technology Act, 2000
          and the Digital Personal Data Protection Act, 2023.
        </p>
      </Section>

      <Section title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of
          material changes via email or in-app notification at least 7 days before
          they take effect. Continued use of the service after the effective date
          constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          For any privacy-related questions or requests, contact our Data Protection
          Officer at <strong className="text-foreground">{SUPPORT_EMAIL}</strong>.
        </p>
      </Section>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TERMS & CONDITIONS
// ─────────────────────────────────────────────────────────────────────────────
function TermsContent() {
  return (
    <div className="space-y-5">
      <Section title="1. Acceptance of Terms">
        <p>
          Welcome to PredicTX. By creating an account, logging in, or using
          any feature of this platform, you agree to be bound by these Terms &
          Conditions (&quot;Terms&quot;). If you do not agree with any part of these Terms,
          please do not use the service.
        </p>
        <p>
          These Terms form a legally binding agreement between you and PredicTX
          (&quot;the Company&quot;, &quot;we&quot;, &quot;us&quot;) governing your use of the
          cryptocurrency price-prediction platform accessible at this application.
        </p>
      </Section>

      <Section title="2. Eligibility">
        <ul className="ml-4 list-disc space-y-1">
          <li>You must be at least <strong className="text-foreground">18 years old</strong> to use this service.</li>
          <li>You must be a resident of <strong className="text-foreground">India</strong> and using the service from within Indian territory.</li>
          <li>You must not be legally prohibited from entering into contracts or participating in skill-based games of prediction.</li>
          <li>You must provide accurate, current, and complete information at registration and keep it updated.</li>
          <li>One account per person. Multiple accounts (multi-accounting) will result in permanent suspension and forfeiture of balance.</li>
        </ul>
      </Section>

      <Section title="3. Account Registration & Security">
        <ul className="ml-4 list-disc space-y-1">
          <li>You may register using email + password, phone number + OTP, or Google OAuth.</li>
          <li>You are solely responsible for maintaining the confidentiality of your password and OTP.</li>
          <li>You agree to notify us immediately at <strong className="text-foreground">{SUPPORT_EMAIL}</strong> of any unauthorized use of your account.</li>
          <li>We are not liable for any loss arising from compromised credentials you failed to secure.</li>
          <li>Two-factor authentication (2FA) is available in Profile → Security & KYC and we strongly recommend enabling it.</li>
        </ul>
      </Section>

      <Section title="4. The Service — How Predictions Work">
        <p>PredicTX is a skill-based prediction platform where users forecast the price direction of cryptocurrencies (BTC, ETH, SOL) over a chosen time window.</p>
        <ul className="ml-4 list-disc space-y-1">
          <li><strong className="text-foreground">Round:</strong> Each prediction runs for a fixed duration (5s to 1m). The entry price is captured at round start; the exit price at round end.</li>
          <li><strong className="text-foreground">Direction:</strong> You predict UP (price will rise) or DOWN (price will fall).</li>
          <li><strong className="text-foreground">Payout:</strong> A correct prediction pays <strong className="text-foreground">1.8x</strong> your stake (e.g., ₹100 bet → ₹180 return, net profit ₹80). An incorrect prediction forfeits the stake.</li>
          <li><strong className="text-foreground">Resolution:</strong> Prices are sourced from Binance public API. The entry price is locked at round start; the exit price is fetched at round end. Once a round resolves, the outcome is final.</li>
          <li><strong className="text-foreground">Refunds:</strong> If Binance API is unavailable at round resolution, the round is voided and all stakes are refunded with status <code>BET_REFUND</code>.</li>
        </ul>
      </Section>

      <Section title="5. Deposits & Withdrawals">
        <p className="font-semibold text-foreground">5.1 Deposits</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Deposits are processed via Razorpay (UPI, Paytm, G Pay, PhonePe, Net Banking, Cards).</li>
          <li>Minimum deposit: ₹500. Maximum deposit per transaction: ₹50,000.</li>
          <li>Your wallet is credited <strong className="text-foreground">only after</strong> Razorpay&apos;s payment signature is verified server-side. No signature = no credit.</li>
          <li>If a payment succeeds but the app fails to credit your wallet, the Razorpay webhook will reconcile the credit automatically. You may also contact support with your payment ID.</li>
        </ul>
        <p className="font-semibold text-foreground">5.2 Withdrawals</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Minimum withdrawal: ₹200. Maximum withdrawal per transaction: ₹5,00,000.</li>
          <li>Withdrawals are processed via UPI / bank transfer within 24–48 business hours.</li>
          <li>Your balance is debited atomically at withdrawal request time. The transaction status is <code>PENDING</code> until the payout completes.</li>
          <li>You must complete KYC verification (PAN + Aadhaar) before your first withdrawal. KYC is collected and verified per RBI guidelines.</li>
          <li>We are not liable for delays caused by your bank, UPI provider, or RBI settlement cycles.</li>
        </ul>
        <p className="font-semibold text-foreground">5.3 Welcome Bonus</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>New users receive a ₹10,000 welcome bonus credited on signup.</li>
          <li>Bonus money cannot be withdrawn. It can only be used to place predictions.</li>
          <li>Winnings from bonus-money bets are credited as real money and are withdrawable.</li>
        </ul>
      </Section>

      <Section title="6. Fees & Taxes">
        <ul className="ml-4 list-disc space-y-1">
          <li>PredicTX does not charge any deposit, withdrawal, or platform fee.</li>
          <li>Razorpay&apos;s standard payment gateway charges (typically 2% for UPI, 3% for cards) are absorbed by us; you are not charged.</li>
          <li>You are responsible for any income tax, GST, or TDS applicable to your winnings under Indian tax law. We will issue TDS certificates as required.</li>
          <li>Net winnings above ₹10,000 in a financial year may be subject to 30% TDS per Section 194BA of the Income Tax Act, 1961.</li>
        </ul>
      </Section>

      <Section title="7. Prohibited Conduct">
        <p>You agree not to:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Create multiple accounts (multi-accounting) to abuse bonuses or manipulate leaderboards.</li>
          <li>Use the service for money laundering, terrorism financing, or any illegal activity.</li>
          <li>Attempt to reverse-engineer, decompile, or otherwise extract source code or pricing algorithms.</li>
          <li>Use bots, scripts, or automated tools to place bets or scrape data.</li>
          <li>Exploit bugs, glitches, or race conditions to gain unfair advantage or duplicate credits.</li>
          <li>Share your account, sell your account, or transfer balance between accounts.</li>
          <li>Use a stolen payment instrument, chargeback fraud, or disputed payments to fund your wallet.</li>
          <li>Impersonate another user, employee, or public figure.</li>
        </ul>
        <p>
          Violations may result in immediate account suspension, forfeiture of balance,
          and reporting to law enforcement authorities.
        </p>
      </Section>

      <Section title="8. Intellectual Property">
        <p>
          All content on this platform — including the PredicTX logo, brand
          name, UI design, code, AI assistant, and documentation — is the exclusive
          property of the Company and protected under Indian copyright and trademark
          law. You may not copy, modify, distribute, or create derivative works
          without prior written consent.
        </p>
      </Section>

      <Section title="9. Disclaimers">
        <ul className="ml-4 list-disc space-y-1">
          <li><strong className="text-foreground">No financial advice:</strong> Predictions are games of skill, not investment advice. Cryptocurrency prices are volatile and may result in loss. The Company is not a registered investment advisor.</li>
          <li><strong className="text-foreground">Service availability:</strong> We strive for 99.9% uptime but do not guarantee uninterrupted access. Maintenance, network issues, or third-party outages (Binance, Razorpay, MSG91) may cause temporary downtime.</li>
          <li><strong className="text-foreground">Price accuracy:</strong> Prices are sourced from Binance public API in real-time. We are not responsible for any loss caused by API delays, anomalies, or incorrect ticker data.</li>
          <li><strong className="text-foreground">Third-party services:</strong> Razorpay, MSG91, Binance, and Z.AI are independent third parties. We are not liable for their actions, outages, or policy changes.</li>
        </ul>
      </Section>

      <Section title="10. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, the Company shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages,
          including loss of profits, data, or goodwill, arising from your use of (or
          inability to use) the service.
        </p>
        <p>
          Our total liability for any claim arising out of or relating to these Terms
          shall not exceed the total amount you have deposited in the 30 days
          preceding the event giving rise to the claim.
        </p>
      </Section>

      <Section title="11. Indemnification">
        <p>
          You agree to indemnify and hold harmless the Company, its officers,
          directors, employees, and affiliates from any claims, damages, losses, or
          expenses (including legal fees) arising from your violation of these Terms,
          your misuse of the service, or your infringement of any third-party rights.
        </p>
      </Section>

      <Section title="12. Account Suspension & Termination">
        <p>
          We may suspend or terminate your account at any time, with or without cause,
          including but not limited to:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Violation of these Terms or proven fraud.</li>
          <li>Suspicious activity indicative of money laundering or bonus abuse.</li>
          <li>Chargebacks or payment disputes initiated by you or your bank.</li>
          <li>Failure to complete KYC after 3 reminders.</li>
          <li>Legal request from Indian authorities.</li>
        </ul>
        <p>
          Upon termination for cause, any balance in your account may be forfeited. Upon
          termination without cause, you may withdraw your balance within 30 days.
        </p>
      </Section>

      <Section title="13. Dispute Resolution & Governing Law">
        <p>
          These Terms are governed by the laws of the Republic of India. Any dispute
          arising out of or relating to these Terms shall first be attempted to be
          resolved through good-faith negotiation for 30 days.
        </p>
        <p>
          If unresolved, the dispute shall be submitted to binding arbitration in
          accordance with the Arbitration and Conciliation Act, 1996. The seat of
          arbitration shall be Bengaluru, India. The language of arbitration shall be
          English. The courts at Bengaluru shall have exclusive jurisdiction over any
          appeals.
        </p>
      </Section>

      <Section title="14. Changes to These Terms">
        <p>
          We may modify these Terms at any time. Material changes will be notified via
          email or in-app notification at least 7 days before taking effect. Continued
          use of the service after the effective date constitutes acceptance of the
          updated Terms. If you do not agree, you must stop using the service and
          request account closure.
        </p>
      </Section>

      <Section title="15. Severability">
        <p>
          If any provision of these Terms is found to be unenforceable or invalid by a
          court or arbitrator, the remaining provisions shall remain in full force and
          effect.
        </p>
      </Section>

      <Section title="16. Contact">
        <p>
          For any questions about these Terms, please contact us at{" "}
          <strong className="text-foreground">{SUPPORT_EMAIL}</strong>.
        </p>
      </Section>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — section with title
// ─────────────────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[13px] font-extrabold tracking-tight text-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
