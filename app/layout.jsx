export const metadata = {
  title: 'Portfolio Tracker',
  description: 'Track your stock investments',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
