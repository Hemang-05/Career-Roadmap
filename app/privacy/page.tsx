import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 mt-24 font-sans p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-black">
          Career Roadmap Privacy Policy
        </h1>
        <p className="mb-4">
          Our Privacy Policy was last updated on{" "}
          <span className="text-gray-600">02/04/2025</span>.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Introduction
          </h2>
          <p className="mb-2">
            At Career Roadmap, one of our main priorities is the privacy of our
            visitors. This Privacy Policy document contains types of information
            that is collected and recorded by Career Roadmap and how we use it.
          </p>
          <p className="mb-2">
            If you have additional questions or require more information about
            our Privacy Policy, do not hesitate to contact us at{" "}
            <a
              href="mailto:ai@careeroadmap.com"
              className="text-gray-600 hover:underline"
            >
              ai@careeroadmap.com
            </a>
            .
          </p>
          <p>
            This Privacy Policy applies only to our online activities and is
            valid for visitors to our website with regards to the information
            that they shared and/or collected on{" "}
            <a
              href="https://www.careeroadmap.com"
              className="text-gray-600 hover:underline"
            >
              https://www.careeroadmap.com/
            </a>
            . This policy is not applicable to any information collected offline
            or via channels other than this website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">Consent</h2>
          <p>
            By using our website, you hereby consent to our Privacy Policy and
            agree to its terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Information We Collect
          </h2>
          <p className="mb-2">
            The personal information that you are asked to provide, and the
            reasons why you are asked to provide it, will be made clear to you
            at the point we ask you to provide your personal information.
          </p>
          <p className="mb-2">
            If you contact us directly, we may receive additional information
            about you such as your name, email address, phone number, the
            contents of the message and/or attachments you may send us, and any
            other information you may choose to provide.
          </p>
          <p>
            When you register for an account, we may ask for your contact
            information, including items such as name, company name, address,
            email address, and telephone number.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            How We Use Your Information
          </h2>
          <ul className="list-disc list-inside">
            <li>Provide, operate, and maintain our website.</li>
            <li>Improve, personalize, and expand our website.</li>
            <li>Understand and analyze how you use our website.</li>
            <li>
              Develop new products, services, features, and functionality.
            </li>
            <li>
              Communicate with you, either directly or through one of our
              partners, including for customer service, to provide you with
              updates and other information relating to the website, and for
              marketing and promotional purposes.
            </li>
            <li>Send you emails.</li>
            <li>Find and prevent fraud.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">Log Files</h2>
          <p>
            Career Roadmap follows a standard procedure of using log files.
            These files log visitors when they visit websites. All hosting
            companies do this as part of hosting services' analytics.
          </p>
          <p className="mb-2">
            The information collected by log files includes internet protocol
            (IP) addresses, browser type, Internet Service Provider (ISP), date
            and time stamp, referring/exit pages, and possibly the number of
            clicks. These are not linked to any information that is personally
            identifiable. The purpose of the information is for analyzing
            trends, administering the site, tracking users' movement on the
            website, and gathering demographic information.
          </p>
        </section>

        {/* ... (Continue with other sections like Cookies, Advertising, CCPA, GDPR, Children's Information) ... */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Children's Information
          </h2>
          <p>
            Another part of our priority is adding protection for children while
            using the internet. We encourage parents and guardians to observe,
            participate in, and/or monitor and guide their online activity.
          </p>
          <p>
            Career Roadmap does not knowingly collect any Personal Identifiable
            Information from children under the age of 13. If you think that
            your child provided this kind of information on our website, we
            strongly encourage you to contact us immediately and we will do our
            best efforts to promptly remove such information from our records.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
