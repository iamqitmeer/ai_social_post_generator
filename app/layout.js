import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
});

export const metadata = {
  title: 'AI Social Post Generator | Content Supercharged',
  description: 'The ultimate tool to instantly generate high-quality, platform-optimized social media posts from any website link. Powered by Next.js and Gemini AI for unparalleled content creation.',
  openGraph: {
    title: 'AI Social Post Generator | Content Supercharged',
    description: 'Transform any article, blog, or website into dozens of ready-to-publish social media posts in seconds.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Social Post Generator | Content Supercharged',
    description: 'The ultimate tool to turn links into engaging social media content.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans bg-zinc-950`}>
        <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(128,128,128,0.03)_0,_rgba(128,128,128,0)_60%)] -z-10" />
        {children}
      </body>
    </html>
  );
}