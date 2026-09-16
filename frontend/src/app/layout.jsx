import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import GoogleAuthWrapper from "../components/providers/GoogleAuthWrapper";

export const metadata = {
  metadataBase: new URL("https://habibsalonacademy.com"),
  title: "Habib Salon & Academy | Premium Salon Experience",
  description:
    "Habib Salon & Academy — your destination for luxurious hair, skin, makeup, nail and spa services. Book an appointment today.",
  openGraph: {
    title: "Habib Salon & Academy",
    description: "Premium salon services tailored to you.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-cream">
        <GoogleAuthWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleAuthWrapper>
      </body>
    </html>
  );
}
