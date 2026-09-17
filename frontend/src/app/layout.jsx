import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import GoogleAuthWrapper from "../components/providers/GoogleAuthWrapper";

export const metadata = {
  metadataBase: new URL("https://habibsalonacademy.com"),
  title: {
    default: "Habib Salon & Academy | Best Hair, Beauty & Makeup Salon in Ghazipur",
    template: "%s | Habib Salon & Academy",
  },
  description:
    "Habib Salon & Academy in Ghazipur, Uttar Pradesh — premium hair styling, bridal makeup, facials, spa treatments, men's grooming & beauty academy. Book your appointment today.",
  keywords: [
    "salon in Ghazipur",
    "beauty salon Ghazipur",
    "hair salon Ghazipur",
    "bridal makeup Ghazipur",
    "Habib Salon",
    "Habib Salon Academy",
    "best salon in Ghazipur",
    "hair colour Ghazipur",
    "facial treatment Ghazipur",
    "spa Ghazipur",
    "men grooming Ghazipur",
    "nail art salon",
    "keratin treatment",
    "beauty academy Uttar Pradesh",
    "makeup artist Ghazipur",
  ],
  authors: [{ name: "Habib Salon & Academy" }],
  creator: "Habib Salon & Academy",
  openGraph: {
    title: "Habib Salon & Academy | Premium Hair & Beauty Salon in Ghazipur",
    description:
      "Your destination for luxurious hair, skin, makeup, nail and spa services in Ghazipur. 12+ years of expertise, 8000+ happy clients.",
    url: "https://habibsalonacademy.com",
    siteName: "Habib Salon & Academy",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Habib Salon & Academy | Best Salon in Ghazipur",
    description:
      "Premium hair, beauty, bridal makeup & spa services in Ghazipur. Book an appointment today.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://habibsalonacademy.com",
  },
  verification: {},
};

function LocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: "Habib Salon & Academy",
    description:
      "Premium hair styling, bridal makeup, facials, spa treatments, men's grooming and beauty academy in Ghazipur, Uttar Pradesh.",
    url: "https://habibsalonacademy.com",
    telephone: "+919565459518",
    email: "pankajyadav@habibsalonacademy.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Mathiya (Baghi)",
      addressLocality: "Ghazipur",
      addressRegion: "Uttar Pradesh",
      postalCode: "233001",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "25.5878",
      longitude: "83.5775",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "10:00",
        closes: "18:00",
      },
    ],
    priceRange: "₹200 - ₹1500",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "8000",
      bestRating: "5",
    },
    sameAs: [],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Salon Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hair Styling & Colour" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Bridal Makeup" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Facials & Skincare" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Spa & Massage" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Men's Grooming" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Nail Art & Manicure" } },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <LocalBusinessJsonLd />
      </head>
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
