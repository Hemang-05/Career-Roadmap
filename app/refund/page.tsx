import React from "react";

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans p-8 mt-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-black">Refund Policy</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">We got you</h2>

          <p className="mb-4">
            We want Careeroadmap to actually help you - not waste your time. Try
            the product for at least <strong>30 days</strong>. If after that you
            feel it didn't click, just tell us where we missed the mark and
            we'll refund the full amount directly to you.
          </p>

          <p className="mb-4">
            What we need from you: a few lines of honest feedback explaining
            what didn’t work for you (features, content, UX whatever). That
            feedback helps us improve, and in return we make it right.
          </p>

          <p className="mb-4">
            How to request: email us at <strong>ai@careeroadmap.com</strong>{" "}
            with the subject <em>"Refund Request"</em>, include your order ID
            and a short note about what went wrong. No long forms, no drama.
          </p>

          <p className="mb-4">
            We’ll refund the full amount straight back to your original payment
            method -{" "}
            <span className="text-sm text-gray-500">
              (net of any small required taxes)
            </span>
            . Simple as that.
          </p>

          <p className="mb-4">
            Quick note: refunds are for people who've used the product for at
            least 30 days and who give us genuine feedback. We’re a small,
            scrappy team building for Gen Z - your feedback is gold.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">Questions?</h2>
          <p className="mb-4">
            Hit us up at{" "}
            <a href="mailto:ai@careeroadmap.com" className="hover:underline">
              ai@careeroadmap.com
            </a>{" "}
            or use the help chat on the site. We're here to help and actually
            want to make this better for you.
          </p>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;
