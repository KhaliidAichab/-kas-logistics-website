import "./globals.css";
export const metadata = {
  title: "KAS Logistics Services | Move What Moves the World",
  description:
    "KAS Logistics Services connects global supply chains with the Middle East and Africa through freight, warehousing, project logistics and digital visibility.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
