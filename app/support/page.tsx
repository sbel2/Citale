// app/support/page.tsx

export default function SupportPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Support</h1>

      <section className="mb-12">
        <h2 className="text-xl font-medium mb-2">Request Account Deletion</h2>
        <p className="mb-4">
          If you wish to permanently delete your Citale account and all associated data, you can do so by filling out the form below.
        </p>
        <a
          href="https://forms.gle/WkhMfYqvcgQ6eU948"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
        >
          Delete My Account
        </a>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-2">Contact Us</h2>
        <p className="mb-2">
          If you need help with anything else, feel free to reach out to our team:
        </p>
        <p>
          Email:{" "}
          <a href="mailto:support@citaleco.com" className="text-blue-600 underline">
            support@citaleco.com
          </a>
        </p>
      </section>
    </main>
  );
}
