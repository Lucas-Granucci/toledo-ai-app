import "./globals.css";

export const metadata = {
  title: "ToledoAI",
  description: "Scientific text translation for all",
  
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Optional fallbacks */}
        <link rel="alternate icon" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>

      <body className="bg-slate-50 text-slate-800 flex items-center justify-center min-h-screen" suppressHydrationWarning>
        <div className="w-full">{children}</div>
      </body>
    </html>
  );
}
