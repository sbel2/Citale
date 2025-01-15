export const metadata = {
  title: 'Citale | Explore Boston',
  description: 'Things to do in Boston',
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