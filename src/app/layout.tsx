import "./globals.css";

export const metadata = {
  title: "Magn",
  description: "Magn — aligned positioning creates magnetism.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-magn-black">{children}</body>
    </html>
  );
}
