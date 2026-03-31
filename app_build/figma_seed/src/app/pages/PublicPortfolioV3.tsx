import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Calendar, Play, ChevronRight, Star, CheckCircle, Instagram, Facebook, Twitter, Youtube, Music as MusicIcon, X, ChevronLeft, ChevronDown } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CalendlyBookingFlow } from '../components/CalendlyBookingFlow';
import { mockPortfolioV3 } from '../data/mockPortfolioV3';
import { themePresets } from '../types/portfolio-v3';
import artistPhoto from 'figma:asset/955703e49fcbf25216ca19f63d51755d531a4505.png';

// Scroll Animation Hook
function useScrollReveal() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
}

// Advanced Scroll Animation Hook with Parallax
function useParallaxScroll() {
  const [scrollY, setScrollY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.scrollY;
        const elementTop = rect.top + scrolled;
        const offset = scrolled - elementTop + window.innerHeight;
        setScrollY(offset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { ref, scrollY };
}

export function PublicPortfolioV3() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [showGalleryLightbox, setShowGalleryLightbox] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBookingSheet, setShowBookingSheet] = useState(false);
  const [showInquirySheet, setShowInquirySheet] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Mock: In production, fetch portfolio by handle
  const portfolio = mockPortfolioV3;

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-6">
            <MusicIcon className="w-12 h-12 text-[#7A42E8]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1F2430] mb-3">Portfolio Not Found</h1>
          <p className="text-[#7A7F8C] mb-6">
            The portfolio you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const theme = themePresets[portfolio.theme.preset];
  const enabledBlocks = portfolio.blocks.filter(b => b.enabled && b.visibility === 'public');
  
  const heroBlock = enabledBlocks.find(b => b.type === 'hero');
  const bioBlock = enabledBlocks.find(b => b.type === 'short-bio');
  const videoBlock = enabledBlocks.find(b => b.type === 'featured-video');
  const testimonialsBlock = enabledBlocks.find(b => b.type === 'testimonial-carousel');
  const galleryBlock = enabledBlocks.find(b => b.type === 'gallery');
  const logosBlock = enabledBlocks.find(b => b.type === 'brand-logos');
  const packagesBlock = enabledBlocks.find(b => b.type === 'featured-package');
  const faqBlock = enabledBlocks.find(b => b.type === 'faq');
  const bookingCtaBlock = enabledBlocks.find(b => b.type === 'booking-cta');

  const socialIcons: Record<string, any> = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    youtube: Youtube,
    spotify: MusicIcon,
  };

  return (
    <div className="min-h-screen" style={{ background: theme.background }}>
      {/* Hero Section - Cinematic Entry */}
      {heroBlock && (
        <section
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1] || theme.accent})`,
          }}
        >
          <div className="container mx-auto px-6 py-16 md:py-24 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Artist Photo */}
              <div
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl mx-auto mb-8 overflow-hidden relative"
                style={{
                  background: '#FFFFFF',
                  boxShadow: `
                    0 0 20px rgba(255, 255, 255, 0.15),
                    0 0 40px rgba(255, 255, 255, 0.1),
                    0 8px 32px rgba(0, 0, 0, 0.2)
                  `,
                }}
              >
                <img
                  src={artistPhoto}
                  alt={heroBlock.content.artistName}
                  className="w-full h-full object-cover"
                  style={{
                    maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)',
                  }}
                />
              </div>

              {/* Glassmorphic Artist Info Container */}
              <div
                className="rounded-3xl p-8 md:p-12 max-w-3xl mx-auto relative"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: `
                    0 0 30px rgba(255, 255, 255, 0.15),
                    0 0 60px rgba(255, 255, 255, 0.1),
                    0 8px 32px rgba(0, 0, 0, 0.2)
                  `,
                }}
              >
                {/* Trust Badge */}
                {heroBlock.content.trustIndicators?.verified && (
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      color: theme.accent,
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-bold">Verified Artist</span>
                  </div>
                )}

                {/* Artist Name */}
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-lg"
                  style={{ color: '#FFFFFF' }}
                >
                  {heroBlock.content.artistName}
                </h1>

                {/* Descriptor */}
                <p
                  className="text-xl md:text-2xl mb-6 font-medium drop-shadow-md"
                  style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                >
                  {heroBlock.content.descriptor}
                </p>

                {/* Location & Genres */}
                <div
                  className="flex items-center justify-center gap-3 flex-wrap mb-8"
                >
                  {heroBlock.content.city && (
                    <span 
                      className="px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(12px)',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                      }}
                    >
                      📍 {heroBlock.content.city}
                    </span>
                  )}
                  {heroBlock.content.genres?.map((genre: string) => (
                    <span
                      key={genre}
                      className="px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(12px)',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                      }}
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Social Proof */}
                {heroBlock.content.socialProof && (
                  <p
                    className="text-base md:text-lg mb-10 font-medium drop-shadow-md"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    ✨ {heroBlock.content.socialProof}
                  </p>
                )}

                {/* CTA Buttons */}
                <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
                  <button
                    onClick={() => setShowBookingSheet(true)}
                    className="px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:scale-105 transition-all flex items-center gap-2"
                    style={{
                      background: '#FFFFFF',
                      color: theme.accent,
                    }}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>{heroBlock.content.ctaButtons?.primary?.label || 'Book Me'}</span>
                  </button>
                  {heroBlock.content.ctaButtons?.secondary && (
                    <button
                      onClick={() => {
                        const videoEl = document.getElementById('featured-video');
                        videoEl?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all flex items-center gap-2 shadow-xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(12px)',
                        color: '#FFFFFF',
                        border: '2px solid rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      <Play className="w-5 h-5" />
                      <span>{heroBlock.content.ctaButtons.secondary.label}</span>
                    </button>
                  )}
                </div>

                {/* Trust Indicators */}
                {heroBlock.content.trustIndicators?.responseTime && (
                  <p
                    className="text-sm font-medium drop-shadow-md"
                    style={{ color: 'rgba(255, 255, 255, 0.85)' }}
                  >
                    ⚡ {heroBlock.content.trustIndicators.responseTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Decorative Gradient Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${theme.accent}, transparent 60%)`,
            }}
          />
        </section>
      )}

      {/* Smooth Gradient Transition */}
      <div
        className="relative h-32 md:h-40"
        style={{
          background: `linear-gradient(to bottom, ${theme.gradient[1] || theme.accent}, transparent)`,
        }}
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 md:py-20 max-w-6xl space-y-16">
        {/* Featured Video */}
        {videoBlock && <VideoSection block={videoBlock} theme={theme} />}

        {/* Bio Section */}
        {bioBlock && <BioSection block={bioBlock} theme={theme} />}

        {/* Testimonials Carousel */}
        {testimonialsBlock && testimonialsBlock.content.testimonials && testimonialsBlock.content.testimonials.length > 0 && (
          <TestimonialsSection 
            block={testimonialsBlock} 
            theme={theme}
            currentTestimonial={currentTestimonial}
            setCurrentTestimonial={setCurrentTestimonial}
          />
        )}

        {/* Gallery */}
        {galleryBlock && galleryBlock.content.items && galleryBlock.content.items.length > 0 && (
          <GallerySection 
            block={galleryBlock} 
            theme={theme}
            onImageClick={(index: number) => {
              setSelectedImageIndex(index);
              setShowGalleryLightbox(true);
            }}
          />
        )}

        {/* Brand Logos */}
        {logosBlock && logosBlock.content.brands && logosBlock.content.brands.length > 0 && (
          <LogosSection block={logosBlock} theme={theme} />
        )}

        {/* Packages */}
        {packagesBlock && packagesBlock.content.packages && packagesBlock.content.packages.length > 0 && (
          <PackagesSection 
            block={packagesBlock} 
            theme={theme}
            onBookingClick={() => setShowBookingSheet(true)}
          />
        )}

        {/* FAQ */}
        {faqBlock && faqBlock.content.items && faqBlock.content.items.length > 0 && (
          <FAQSection 
            block={faqBlock} 
            theme={theme}
            expandedFAQ={expandedFAQ}
            setExpandedFAQ={setExpandedFAQ}
          />
        )}

        {/* Booking CTA */}
        {bookingCtaBlock && (
          <BookingCTASection 
            block={bookingCtaBlock}
            theme={theme}
            onBookingClick={() => setShowBookingSheet(true)}
            onInquiryClick={() => setShowInquirySheet(true)}
          />
        )}
      </div>

      {/* Gallery Lightbox */}
      {showGalleryLightbox && galleryBlock && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setShowGalleryLightbox(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => setSelectedImageIndex((selectedImageIndex - 1 + galleryBlock.content.items.length) % galleryBlock.content.items.length)}
            className="absolute left-6 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="max-w-5xl max-h-[80vh]">
            <img
              src={galleryBlock.content.items[selectedImageIndex].url}
              alt={galleryBlock.content.items[selectedImageIndex].caption || ''}
              className="max-w-full max-h-[80vh] rounded-2xl"
            />
            {galleryBlock.content.items[selectedImageIndex].caption && (
              <p className="text-white text-center mt-4 text-lg">
                {galleryBlock.content.items[selectedImageIndex].caption}
              </p>
            )}
          </div>

          <button
            onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % galleryBlock.content.items.length)}
            className="absolute right-6 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* Calendly-Style Booking Flow */}
      {showBookingSheet && (
        <CalendlyBookingFlow
          artistName={heroBlock?.content.artistName || 'Artist'}
          onClose={() => setShowBookingSheet(false)}
          theme={theme}
        />
      )}

      {/* Inquiry Bottom Sheet */}
      {showInquirySheet && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowInquirySheet(false)}
          />
          <div
            className="relative w-full md:max-w-2xl rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto p-8"
            style={{ background: theme.background }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
                Quick Inquiry
              </h2>
              <button
                onClick={() => setShowInquirySheet(false)}
                className="p-2 rounded-full hover:bg-black/5"
              >
                <X className="w-6 h-6" style={{ color: theme.text }} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none"
                style={{
                  borderColor: theme.border,
                  background: theme.surface,
                  color: theme.text,
                }}
              />
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none"
                style={{
                  borderColor: theme.border,
                  background: theme.surface,
                  color: theme.text,
                }}
              />
              <textarea
                placeholder="Tell us about your event..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none resize-none"
                style={{
                  borderColor: theme.border,
                  background: theme.surface,
                  color: theme.text,
                }}
              />
              <button
                onClick={() => {
                  alert('Inquiry sent! (This is a demo)');
                  setShowInquirySheet(false);
                }}
                className="w-full py-4 rounded-xl font-semibold text-lg"
                style={{
                  background: theme.accent,
                  color: theme.surface,
                }}
              >
                Send Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Video Section Component - Slide from Left with Rotation
function VideoSection({ block, theme }: { block: any, theme: any}) {
  const { ref, isVisible } = useScrollReveal();
  const { ref: parallaxRef, scrollY } = useParallaxScroll();
  
  return (
    <section 
      ref={ref}
      id="featured-video" 
      className="scroll-mt-20"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'translateX(0) rotateY(0deg)' 
          : 'translateX(-60px) rotateY(-8deg)',
        transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <div 
        className="text-center mb-8"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
        }}
      >
        <h2
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ color: theme.text }}
        >
          {block.title}
        </h2>
        {block.content.description && (
          <p style={{ color: theme.textSecondary }}>
            {block.content.description}
          </p>
        )}
      </div>
      <div
        ref={parallaxRef}
        className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${theme.surfaceElevated}, ${theme.surface})`,
          border: `1px solid ${theme.border}`,
          transform: `translateY(${scrollY * 0.05}px)`,
        }}
        onClick={() => window.open(block.content.videoUrl, '_blank')}
      >
        <ImageWithFallback
          src={block.content.thumbnail || ''}
          alt={block.title || 'Video'}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 flex items-center justify-center transition-all"
          style={{ 
            background: 'linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.5))',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentLight})`,
            }}
          >
            <Play className="w-8 h-8 ml-1 drop-shadow-lg" style={{ color: '#FFFFFF' }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Bio Section Component - Zoom and Fade
function BioSection({ block, theme }: { block: any, theme: any }) {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <section 
      ref={ref}
      className="max-w-3xl mx-auto text-center"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(60px)',
        transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <h2
        className="text-3xl md:text-4xl font-bold mb-6"
        style={{ 
          color: theme.text,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
        }}
      >
        {block.title}
      </h2>
      <p
        className="text-lg leading-relaxed"
        style={{ 
          color: theme.textSecondary,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
        }}
      >
        {block.content.text}
      </p>
    </section>
  );
}

// Testimonials Section Component - Slide from Right with Bounce
function TestimonialsSection({ block, theme, currentTestimonial, setCurrentTestimonial }: { block: any, theme: any, currentTestimonial: number, setCurrentTestimonial: (index: number) => void }) {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <section
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0) rotateY(0deg)' : 'translateX(80px) rotateY(12deg)',
        transition: 'all 1.1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <h2
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ 
          color: theme.text,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.7)',
          transition: 'all 0.9s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s',
        }}
      >
        {block.title}
      </h2>
      <div className="relative max-w-4xl mx-auto">
        <div
          className="rounded-3xl p-8 md:p-12 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${theme.surface}, ${theme.surfaceElevated})`,
            border: `1px solid ${theme.border}`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5"
                  fill={theme.accent}
                  style={{ 
                    color: theme.accent,
                    animation: isVisible ? `starPulse 0.6s ease-out ${i * 0.1}s` : 'none',
                  }}
                />
              ))}
            </div>
          </div>
          <blockquote
            className="text-xl md:text-2xl mb-6 italic leading-relaxed"
            style={{ color: theme.text }}
          >
            "{block.content.testimonials[currentTestimonial].quote}"
          </blockquote>
          <div>
            <div
              className="font-bold text-lg"
              style={{ color: theme.text }}
            >
              {block.content.testimonials[currentTestimonial].author}
            </div>
            <div style={{ color: theme.textSecondary }}>
              {block.content.testimonials[currentTestimonial].role} · {block.content.testimonials[currentTestimonial].company}
            </div>
          </div>
        </div>

        {/* Navigation */}
        {block.content.testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setCurrentTestimonial((currentTestimonial - 1 + block.content.testimonials.length) % block.content.testimonials.length)}
              className="p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
              style={{ 
                background: `${theme.surface}90`, 
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.border}` 
              }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: theme.text }} />
            </button>
            <div className="flex gap-2">
              {block.content.testimonials.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: index === currentTestimonial ? theme.accent : theme.border,
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentTestimonial((currentTestimonial + 1) % block.content.testimonials.length)}
              className="p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
              style={{ 
                background: `${theme.surface}90`, 
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.border}` 
              }}
            >
              <ChevronRight className="w-5 h-5" style={{ color: theme.text }} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// Gallery Section Component - Cascading Flip Cards
function GallerySection({ block, theme, onImageClick }: { block: any, theme: any, onImageClick: (index: number) => void }) {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <section
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.6s ease-out',
      }}
    >
      <h2
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ 
          color: theme.text,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'rotateX(0deg) translateY(0)' : 'rotateX(-20deg) translateY(40px)',
          transition: 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {block.title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {block.content.items.map((item: any, index: number) => (
          <div
            key={item.id}
            className="aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all"
            onClick={() => onImageClick(index)}
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              opacity: isVisible ? 1 : 0,
              transform: isVisible 
                ? 'scale(1) rotateY(0deg)' 
                : 'scale(0.7) rotateY(-45deg)',
              transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.08 * index}s`,
              transformStyle: 'preserve-3d',
            }}
          >
            <ImageWithFallback
              src={item.url}
              alt={item.caption || ''}
              className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-all duration-700"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// Brand Logos Section Component - Wave Animation
function LogosSection({ block, theme }: { block: any, theme: any }) {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <section
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <h2
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ 
          color: theme.text,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-5deg)',
          transition: 'all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        }}
      >
        {block.title}
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
        {block.content.brands.map((brand: any, index: number) => (
          <div
            key={brand.id}
            className="flex items-center justify-center p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            style={{
              background: `${theme.surface}90`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.border}`,
              opacity: isVisible ? 1 : 0,
              transform: isVisible 
                ? 'translateY(0) scale(1)' 
                : `translateY(${40 + Math.sin(index) * 20}px) scale(0.8)`,
              transition: `all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.05 * index}s`,
            }}
          >
            <div
              className="font-bold text-center"
              style={{ color: theme.textSecondary }}
            >
              {brand.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Packages Section Component - 3D Card Flip
function PackagesSection({ block, theme, onBookingClick }: { block: any, theme: any, onBookingClick: () => void }) {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <section
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      <h2
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ 
          color: theme.text,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(0.9)',
          transition: 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {block.title}
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {block.content.packages.map((pkg: any, index: number) => (
          <div
            key={pkg.id}
            className="rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${theme.surface}, ${theme.surfaceElevated})`,
              border: `2px solid ${theme.border}`,
              backdropFilter: 'blur(10px)',
              opacity: isVisible ? 1 : 0,
              transform: isVisible 
                ? 'translateY(0) rotateX(0deg) scale(1)' 
                : 'translateY(60px) rotateX(-15deg) scale(0.9)',
              transition: `all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.12 * index}s`,
              transformStyle: 'preserve-3d',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) rotateX(5deg) scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) rotateX(0deg) scale(1)';
            }}
          >
            <h3
              className="text-2xl font-bold mb-2"
              style={{ color: theme.text }}
            >
              {pkg.name}
            </h3>
            <div
              className="text-4xl font-bold mb-2"
              style={{ color: theme.accent }}
            >
              {pkg.price}
            </div>
            <div
              className="mb-6"
              style={{ color: theme.textSecondary }}
            >
              {pkg.duration}
            </div>
            <p
              className="mb-6"
              style={{ color: theme.textSecondary }}
            >
              {pkg.description}
            </p>
            <ul className="space-y-3 mb-8">
              {pkg.features?.map((feature: string, featureIndex: number) => (
                <li
                  key={featureIndex}
                  className="flex items-start gap-2"
                  style={{ 
                    color: theme.text,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                    transition: `all 0.5s ease-out ${0.3 + (0.05 * featureIndex)}s`,
                  }}
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: theme.accent }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={onBookingClick}
              className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentLight})`,
                color: '#FFFFFF',
              }}
            >
              Select Package
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// FAQ Section Component - Accordion Slide with Rotation
function FAQSection({ block, theme, expandedFAQ, setExpandedFAQ }: { block: any, theme: any, expandedFAQ: string | null, setExpandedFAQ: (id: string | null) => void }) {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <section 
      ref={ref}
      className="max-w-3xl mx-auto"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(-40px) scale(0.95)',
        transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <h2
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        style={{ 
          color: theme.text,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(-40px)',
          transition: 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
        }}
      >
        {block.title}
      </h2>
      <div className="space-y-4">
        {block.content.items.map((item: any, index: number) => (
          <div
            key={item.id}
            className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
            style={{
              background: `${theme.surface}90`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.border}`,
              opacity: isVisible ? 1 : 0,
              transform: isVisible 
                ? 'translateX(0) rotateZ(0deg)' 
                : 'translateX(60px) rotateZ(3deg)',
              transition: `all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.08 * index}s`,
            }}
          >
            <button
              onClick={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-black/5 transition-colors"
            >
              <span
                className="font-semibold"
                style={{ color: theme.text }}
              >
                {item.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${expandedFAQ === item.id ? 'rotate-180' : ''}`}
                style={{ color: theme.accent }}
              />
            </button>
            {expandedFAQ === item.id && (
              <div
                className="px-6 pb-4"
                style={{ 
                  color: theme.textSecondary,
                  animation: 'slideDown 0.3s ease-out',
                }}
              >
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Booking CTA Section Component - Explosive Entrance
function BookingCTASection({ block, theme, onBookingClick, onInquiryClick }: { block: any, theme: any, onBookingClick: () => void, onInquiryClick: () => void }) {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <section 
      ref={ref}
      className="text-center"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1) rotateX(0deg)' : 'scale(0.7) rotateX(20deg)',
        transition: 'all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <div
        className="rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.accent})`,
        }}
      >
        {/* Glossy overlay with pulse */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
            animation: isVisible ? 'pulse 3s ease-in-out infinite' : 'none',
          }}
        />
        
        <h2
          className="text-3xl md:text-5xl font-bold mb-4 relative z-10 drop-shadow-lg"
          style={{ 
            color: '#FFFFFF',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.8)',
            transition: 'all 0.9s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s',
          }}
        >
          {block.content.heading}
        </h2>
        <p
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto relative z-10 drop-shadow-md"
          style={{ 
            color: 'rgba(255, 255, 255, 0.95)',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s',
          }}
        >
          {block.content.description}
        </p>
        <div 
          className="flex items-center justify-center gap-4 flex-wrap relative z-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.5)',
            transition: 'all 0.9s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.6s',
          }}
        >
          <button
            onClick={onBookingClick}
            className="px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:scale-110 hover:rotate-2 transition-all duration-300"
            style={{
              background: '#FFFFFF',
              color: theme.accent,
            }}
          >
            {block.content.ctaLabel}
          </button>
          <button
            onClick={onInquiryClick}
            className="px-8 py-4 rounded-2xl font-bold text-lg hover:scale-110 hover:-rotate-2 transition-all duration-300 shadow-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              color: '#FFFFFF',
              border: '2px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            {block.content.secondaryCtaLabel}
          </button>
        </div>
      </div>
    </section>
  );
}