import { Mail, Instagram, Twitter, Linkedin } from "lucide-react";

// This component can be server-side rendered (SSR) or use Partial Pre-rendering (PPR)
// by removing "use client" and making it a server component
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://instagram.com/careeroadmap_",
      icon: Instagram,
      ariaLabel: "Follow CareerRoadmap on Instagram",
    },
    // {
    //   name: "Twitter",
    //   href: "https://twitter.com/careeroadmap",
    //   icon: Twitter,
    //   ariaLabel: "Follow CareerRoadmap on Twitter",
    // },
    // {
    //   name: "LinkedIn",
    //   href: "https://linkedin.com/company/careeroadmap",
    //   icon: Linkedin,
    //   ariaLabel: "Follow CareerRoadmap on LinkedIn",
    // },
  ];

  const footerLinks = [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" },
  ];

  return (
    <footer
      className="bg-white  py-8 px-4 sm:px-6 lg:px-12"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          {/* Legal Links - Left side on desktop, top on mobile */}
          <nav className="order-1 lg:order-1" aria-label="Footer legal links">
            <ul className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 underline-offset-4 hover:underline"
                    rel="nofollow"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company Name & Copyright - Center */}
          <div className="order-2 lg:order-2 text-center">
            <p className="text-sm text-gray-600 font-medium">
              &copy; {currentYear}{" "}
              <span className="text-green-800 font-semibold">
                CareerRoadmap
              </span>
              . All rights reserved.
            </p>
          </div>

          {/* Contact & Social - Right side on desktop, bottom on mobile */}
          <div className="order-3 lg:order-3 flex flex-col sm:flex-row items-center gap-4">
            {/* Email Contact */}
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <a
                href="mailto:ai@careeroadmap.com"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                aria-label="Send email to CareerRoadmap support"
              >
                ai@careeroadmap.com
              </a>
            </div>

            {/* Social Media Links */}
            <nav aria-label="Social media links">
              <ul className="flex items-center space-x-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <li key={social.name}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-green-800 transition-colors duration-200 p-1"
                        aria-label={social.ariaLabel}
                      >
                        <IconComponent className="w-5 h-5" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>

        {/* Additional SEO Content - Optional */}
        {/* <div className="mt-6 pt-6 -z-10">
          <div className="text-center">
            <p className="text-xs text-white max-w-2xl mx-auto">
              CareerRoadmap helps professionals navigate their career journey
              with AI-powered insights and personalized roadmaps. Build your
              career path with confidence.
            </p>
          </div>
        </div> */}
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "CareerRoadmap",
            url: "https://careeroadmap.com",
            email: "ai@careeroadmap.com",
            sameAs: [
              "https://instagram.com/careeroadmap_",
              "https://twitter.com/careeroadmap",
              "https://linkedin.com/company/careeroadmap",
            ],
            description:
              "AI-powered career guidance and personalized roadmaps for professionals",
          }),
        }}
      />
    </footer>
  );
}
