import React from "react";

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 mt-24 text-black">
          Terms and Conditions
        </h1>
        <p className="mb-4">
          Our Terms and Conditions were last updated on{" "}
          <span className="text-gray-600">02/04/2025</span>.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Acknowledgment
          </h2>
          <p className="mb-2">
            Please read these terms and conditions carefully before using Our
            Service. These are the Terms and Conditions governing the use of
            this Service and the agreement that operates between you and the
            Company. These Terms and Conditions set out the rights and
            obligations of all users regarding the use of the Service.
          </p>
          <p className="mb-2">
            Your access to and use of the Service is conditioned on your
            acceptance of and compliance with these Terms and Conditions. These
            Terms and Conditions apply to all visitors, users, and others who
            access or use the Service.
          </p>
          <p className="mb-2">
            By accessing or using the Service you agree to be bound by these
            Terms and Conditions. If you disagree with any part of these Terms
            and Conditions, then you may not access the Service. This
            acknowledgement has been suggested by dodopayments.com.
          </p>
          <p>
            Your access to and use of the Service is also conditioned on your
            acceptance of and compliance with the Privacy Policy of the Company.
            Our Privacy Policy describes Our policies and procedures on the
            collection, use, and disclosure of your personal information when
            you use the Application or the Website and tells you about your
            privacy rights and how the law protects you. Please read Our Privacy
            Policy carefully before using Our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            User Accounts
          </h2>
          <p className="mb-2">
            When you create an account with us, you must provide us with
            information that is accurate, complete, and current at all times.
            Failure to do so constitutes a breach of the Terms, which may result
            in the immediate termination of your account.
          </p>
          <p className="mb-2">
            You are responsible for safeguarding the password that you use to
            access the Service and for any activities or actions under your
            password, whether your password is with Our Service or a Third-Party
            Social Media Service. Dodopayments.com does not bear any liability
            for the same.
          </p>
          <p className="mb-2">
            You agree not to disclose your password to any third party. You must
            notify us immediately upon becoming aware of any breach of security
            or unauthorized use of your account.
          </p>
          <p>
            You may not use as a username the name of another person or entity
            that is not lawfully available for use, a name or trademark that is
            subject to any rights of another person or entity other than you
            without appropriate authorization, or a name that is otherwise
            offensive, vulgar, or obscene.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Copyright Policy
          </h2>
          <p className="mb-2">
            Intellectual Property Infringement: All content, features, and
            functionality of our services, including but not limited to text,
            graphics, logos, and software, are the exclusive property of Career
            Roadmap and are protected by international copyright, trademark, and
            other intellectual property laws.
          </p>
          <p className="mb-2">
            DMCA Notice and DMCA Procedure for Copyright Infringement Claims:
            You may submit a notification pursuant to the Digital Millennium
            Copyright Act (DMCA) by providing our Copyright Agent with the
            detailed information mentioned in the original provided text.
          </p>
          <p className="mb-2">
            You can contact our copyright agent via email at{" "}
            <a
              href="mailto:ai@careeroadmap.com"
              className="text-gray-600 hover:underline"
            >
              ai@careeroadmap.com
            </a>
            . Upon receipt of a notification, the Company will take whatever
            action, in its sole discretion, it deems appropriate, including
            removing the challenged content from the Service.
          </p>
        </section>

        {/* ... (Continue with other sections like Intellectual Property, Feedback, Links, Termination, Liability, Governing Law, Changes, Contact) ... */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">Contact Us</h2>
          <p>
            If you have any questions about these Terms and Conditions, You can
            contact us:
          </p>
          <ul className="list-disc list-inside">
            <li>
              By visiting our website:{" "}
              <a
                href="https://www.careeroadmap.com"
                className="text-gray-600 hover:underline"
              >
                https://www.careeroadmap.com
              </a>
            </li>
            <li>
              By sending us an email:{" "}
              <a
                href="mailto:ai@careeroadmap.com"
                className="text-gray-600 hover:underline"
              >
                ai@careeroadmap.com
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
