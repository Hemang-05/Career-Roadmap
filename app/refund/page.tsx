import React from "react";

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans p-8 mt-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-black">Refund Policy</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            No Refund Policy
          </h2>
          <p className="mb-4">
            At Career Roadmap, we operate under a strict no-refund policy. Due
            to the nature of our services and the digital products we offer, we
            do not provide refunds for any purchases.
          </p>
          <p className="mb-4">
            We strongly encourage you to carefully review all product
            descriptions and service details before making a purchase. If you
            have any questions or require clarification about our offerings,
            please do not hesitate to contact us prior to your purchase.
          </p>
          <p className="mb-4">
            This policy applies to all products and services offered on our
            website, including but not limited to digital downloads,
            subscriptions, and one-time purchases.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">Contact Us</h2>
          <p>
            If you have any questions or require further clarification regarding
            our no-refund policy, please contact us:
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

export default RefundPolicy;
