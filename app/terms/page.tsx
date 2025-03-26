// app/terms/page.tsx

export default function TermsPage() {
    return (
      <div className="p-6 max-w-4xl mx-auto text-base leading-relaxed text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
  
        <p className="mb-4">
          <strong>Effective Date:</strong> March 25, 2025
        </p>
  
        <p className="mb-4">
          Welcome to Citale, a media-sharing platform designed for self-expression, connection, and creativity.
          By using Citale, you agree to the following Terms of Use, which apply to both our mobile app and website (
          <a href="https://www.citaleco.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
            https://www.citaleco.com
          </a>).
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using Citale, you agree to be bound by these Terms of Use and our Privacy Policy.
          If you do not agree, please do not use our platform.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">2. Eligibility</h2>
        <p className="mb-4">
          You must be at least 13 years old to use Citale. If you are under the age of majority in your jurisdiction,
          you must have a parent or guardian&apos;s permission.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">3. User-Generated Content</h2>
        <p className="mb-4">
          You retain ownership of the content you post but grant Citale a non-exclusive, worldwide, royalty-free license
          to use, host, display, and distribute that content in connection with the platform.
          You are responsible for your content. Do not post anything illegal, harmful, or objectionable.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">4. No Tolerance for Objectionable Content or Abuse</h2>
        <p className="mb-4">
          Citale has zero tolerance for hate speech, nudity, harassment, spam, or abusive behavior.
          Violations may lead to removal of content and/or permanent account bans.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Reporting and Moderation</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Users can <a href="https://forms.gle/TsF3rqY5fhsuMJ5M9" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">report content</a> that violates our policies.</li>
          <li>All reports are reviewed manually within 24 hours.</li>
          <li>Citale may remove reported content or suspend users who violate community standards.</li>
          <li>We do not currently offer user-blocking functionality, but we manually handle abusive accounts.</li>
        </ul>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">6. Account Deletion</h2>
        <p className="mb-4">
          You can request to delete your Citale account and all associated data at any time by using&nbsp;
          <a href="https://forms.gle/WkhMfYqvcgQ6eU948" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">this form</a>.
          Deletion requests are processed manually within 7 days.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">7. Privacy</h2>
        <p className="mb-4">
          We respect your privacy. We collect minimal data and never sell your personal information.
          See our <a href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</a> for more.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">8. App Crashes and Performance</h2>
        <p className="mb-4">
          If the app crashes or malfunctions, please contact support at&nbsp;
          <a href="mailto:support@citaleco.com" className="text-blue-600 underline">support@citaleco.com</a>.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">9. Termination</h2>
        <p className="mb-4">
          We may suspend or terminate your account at any time for violations of these Terms or for misuse of the platform.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">10. Contact</h2>
        <p className="mb-4">
          For questions or support, visit&nbsp;
          <a href="https://www.citaleco.com/support" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
            citaleco.com/support
          </a>
          &nbsp;or email us at&nbsp;
          <a href="mailto:support@citaleco.com" className="text-blue-600 underline">support@citaleco.com</a>.
        </p>
      </div>
    );
  }