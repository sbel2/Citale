export default function PrivacyPolicyPage() {
    return (
      <div className="p-6 max-w-3xl mx-auto text-base leading-relaxed text-gray-800">
        <h1 className="text-2xl font-semibold mb-4">Privacy Policy for Citale</h1>
        <p><strong>Effective Date:</strong> March 25, 2025</p>
  
        <p className="mt-4">
          Citale (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides a media-based social platform. This Privacy Policy outlines how we collect, use, and protect your data when you use our mobile app and website.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <p><strong>a. Account Information:</strong> Email address, username, and any content you upload</p>
        <p><strong>b. Usage Data:</strong> App interactions, device type, OS version, and anonymous session identifiers</p>
        <p><strong>c. Analytics:</strong> We use PostHog to collect anonymous session data and IP addresses (not tied to user identity)</p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Data</h2>
        <p>We use data to provide core services, display content, monitor app usage, improve performance, and investigate bugs. We do not sell your data to third parties.</p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">3. Third-Party Services</h2>
        <ul className="list-disc pl-6 mb-4">
          <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase</a> – Authentication, database, and media storage</li>
          <li><a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">PostHog</a> – Analytics</li>
          <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Vercel</a> – Hosting infrastructure</li>
        </ul>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Retention & Deletion</h2>
        <p>
          You may request to delete your account and all associated content at any time by using&nbsp;
          <a href="https://forms.gle/WkhMfYqvcgQ6eU948" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">this form</a>.&nbsp;
          Deletion requests are reviewed and processed manually within 7 days.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Security</h2>
        <p>We use secure, industry-standard platforms to store and manage your data. While no system is 100% secure, we take reasonable steps to protect your information.</p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">6. Children’s Privacy</h2>
        <p>Citale is not intended for users under 13. We do not knowingly collect data from children. If we learn that a minor has provided personal information, we will delete it promptly.</p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">7. Changes to This Policy</h2>
        <p>We may update this policy from time to time. Material changes will be announced via the app or our website.</p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">8. Contact</h2>
        <p>
          For privacy-related questions, contact us at:&nbsp;
          <a href="mailto:support@citaleco.com" className="text-blue-600 underline">support@citaleco.com</a><br />
          Website: <a href="https://www.citaleco.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">www.citaleco.com</a>
        </p>
      </div>
    );
  }