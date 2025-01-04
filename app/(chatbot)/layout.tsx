import '../globals.css';
export const metadata = {
  title: 'Citale | talebot',
  description: 'recommendation bot',
}

export default function RootLayout({
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
