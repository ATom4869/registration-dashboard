import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Landing Page Pendaftaran',
  description: 'Landing Page Pendaftaran profesional dengan integrasi Google Sheets Webhook dan WhatsApp Floating Action Button.',
  openGraph: {
    title: 'Landing Page Pendaftaran',
    description: 'Landing Page Pendaftaran profesional dengan integrasi Google Sheets Webhook dan WhatsApp Floating Action Button.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Landing Page Pendaftaran',
    description: 'Landing Page Pendaftaran profesional dengan integrasi Google Sheets Webhook dan WhatsApp Floating Action Button.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
