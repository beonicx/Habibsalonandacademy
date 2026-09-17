export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/orders", "/supercoins", "/coupons", "/admin"],
      },
    ],
    sitemap: "https://habibsalonacademy.com/sitemap.xml",
  };
}
