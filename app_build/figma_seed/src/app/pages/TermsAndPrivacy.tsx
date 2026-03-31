import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export function TermsAndPrivacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <header className="bg-white border-b border-[#DDDCE7]">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#7A42E8] font-medium hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-[#DDDCE7]">
          <h1 className="text-4xl font-bold text-[#1F2430] mb-8">Terms of Service & Privacy Policy</h1>
          
          {/* Terms Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1F2430] mb-4">Terms of Service</h2>
            <div className="prose prose-lg max-w-none text-[#4F5868] space-y-4">
              <p>
                Welcome to Museio. By using our service, you agree to these terms. Please read them carefully.
              </p>
              
              <h3 className="text-xl font-semibold text-[#1F2430] mt-6 mb-3">1. Using Our Services</h3>
              <p>
                You must follow any policies made available to you within the Services. Don't misuse our Services. 
                For example, don't interfere with our Services or try to access them using a method other than the 
                interface and the instructions that we provide.
              </p>

              <h3 className="text-xl font-semibold text-[#1F2430] mt-6 mb-3">2. Your Museio Account</h3>
              <p>
                You need a Museio Account in order to use many of our Services. You may create your own Museio Account, 
                or your Museio Account may be assigned to you by an administrator. If you are using a Museio Account 
                assigned to you by an administrator, different or additional terms may apply.
              </p>

              <h3 className="text-xl font-semibold text-[#1F2430] mt-6 mb-3">3. Privacy and Copyright Protection</h3>
              <p>
                Museio's privacy policies explain how we treat your personal data and protect your privacy when you 
                use our Services. By using our Services, you agree that Museio can use such data in accordance with 
                our privacy policies.
              </p>

              <h3 className="text-xl font-semibold text-[#1F2430] mt-6 mb-3">4. Your Content in Our Services</h3>
              <p>
                Our Services allow you to upload, submit, store, send or receive content. You retain ownership of any 
                intellectual property rights that you hold in that content. When you upload, submit, store, send or 
                receive content to or through our Services, you give Museio a worldwide license to use, host, store, 
                reproduce, modify, create derivative works, communicate, publish, publicly perform, publicly display 
                and distribute such content for the purpose of operating and improving Museio's Services.
              </p>

              <h3 className="text-xl font-semibold text-[#1F2430] mt-6 mb-3">5. Payment Terms</h3>
              <p>
                Payment processing services for goods and services on Museio are provided by Stripe and are subject 
                to the Stripe Connected Account Agreement. By agreeing to these terms or continuing to operate as a 
                seller on Museio, you agree to be bound by the Stripe Services Agreement.
              </p>
            </div>
          </section>

          {/* Privacy Section */}
          <section>
            <h2 className="text-2xl font-bold text-[#1F2430] mb-4">Privacy Policy</h2>
            <div className="prose prose-lg max-w-none text-[#4F5868] space-y-4">
              <p>
                This Privacy Policy describes how Museio collects, uses, and shares your personal information.
              </p>

              <h3 className="text-xl font-semibold text-[#1F2430] mt-6 mb-3">Information We Collect</h3>
              <p>
                We collect information you provide directly to us, such as when you create an account, fill out a form, 
                or communicate with us. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Business information and payment details</li>
                <li>Portfolio content and media files</li>
                <li>Booking and job information</li>
                <li>Communications between you and your clients</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1F2430] mt-6 mb-3">How We Use Your Information</h3>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our Services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1F2430] mt-6 mb-3">Information Sharing</h3>
              <p>
                We do not share your personal information with third parties except as described in this policy. 
                We may share your information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>With service providers who perform services on our behalf</li>
                <li>In connection with a merger, sale, or acquisition</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1F2430] mt-6 mb-3">Data Security</h3>
              <p>
                We take reasonable measures to help protect your personal information from loss, theft, misuse, 
                unauthorized access, disclosure, alteration, and destruction.
              </p>

              <h3 className="text-xl font-semibold text-[#1F2430] mt-6 mb-3">Contact Us</h3>
              <p>
                If you have any questions about these Terms or our Privacy Policy, please contact us at{' '}
                <a href="mailto:legal@museio.app" className="text-[#7A42E8] hover:underline">
                  legal@museio.app
                </a>
              </p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-[#DDDCE7] text-sm text-[#7A7F8C]">
            <p>Last updated: March 20, 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
