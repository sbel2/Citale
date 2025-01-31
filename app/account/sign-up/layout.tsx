export const metadata = {
  title: 'Citale | Sign Up',
  description: 'Thank you joining Citale!',
}

import '../../globals.css';

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
