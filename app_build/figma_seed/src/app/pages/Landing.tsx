import { useNavigate } from 'react-router';
import { Calendar, DollarSign, Image, Users, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Smart Booking',
      description: 'Let clients book you directly with automated availability management',
    },
    {
      icon: Image,
      title: 'Portfolio Showcase',
      description: 'Create a stunning portfolio to showcase your work and attract clients',
    },
    {
      icon: DollarSign,
      title: 'Easy Payments',
      description: 'Send invoices and receive payments seamlessly through Stripe',
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Keep all your client information organized in one place',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EEFD] via-white to-[#E3DBF9]">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] flex items-center justify-center">
              <span className="font-bold text-white text-xl">M</span>
            </div>
            <span className="font-bold text-2xl text-[#1F2430]">MUSEIO</span>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-2 rounded-xl text-[#7A42E8] font-semibold hover:bg-[#F4EEFD] transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-[#1F2430] mb-6">
            The all-in-one platform for{' '}
            <span className="bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] bg-clip-text text-transparent">
              creative professionals
            </span>
          </h1>
          <p className="text-xl text-[#4F5868] mb-8 max-w-2xl mx-auto">
            Manage bookings, showcase your portfolio, invoice clients, and get paid—all in one beautiful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/alexrivers')}
              className="px-8 py-4 rounded-2xl bg-white text-[#7A42E8] font-semibold text-lg hover:shadow-lg transition-all border-2 border-[#E3DBF9]"
            >
              View Example Portfolio
            </button>
          </div>
        </div>

        {/* Hero Image/Mockup */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="aspect-video bg-white rounded-3xl shadow-2xl border border-[#DDDCE7] overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[#F4EEFD] to-[#E3DBF9] flex items-center justify-center">
              <ImageWithFallback
                src=""
                alt="Museio Dashboard"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {/* Floating elements */}
          <div className="absolute -top-8 -left-8 w-24 h-24 rounded-3xl bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] opacity-20 blur-2xl" />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-3xl bg-gradient-to-br from-[#E3DBF9] to-[#7A42E8] opacity-20 blur-2xl" />
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F2430] text-center mb-12">
            Everything you need to run your creative business
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-8 rounded-3xl bg-white border border-[#DDDCE7] hover:shadow-lg transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#F4EEFD] flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-[#7A42E8]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2430] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#4F5868]">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 mb-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to elevate your creative business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of DJs, photographers, and creatives already using Museio.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 rounded-2xl bg-white text-[#7A42E8] font-semibold text-lg hover:shadow-xl transition-all"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DDDCE7] bg-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] flex items-center justify-center">
                <span className="font-bold text-white">M</span>
              </div>
              <span className="font-bold text-lg text-[#1F2430]">MUSEIO</span>
            </div>
            <div className="flex gap-6 text-sm text-[#7A7F8C]">
              <button onClick={() => navigate('/terms-and-privacy')} className="hover:text-[#7A42E8]">
                Terms & Privacy
              </button>
              <a href="mailto:hello@museio.app" className="hover:text-[#7A42E8]">
                Contact
              </a>
            </div>
            <p className="text-sm text-[#A4A9B6]">
              © 2026 Museio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
