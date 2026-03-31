import { useParams, useNavigate } from 'react-router';
import { Instagram, Facebook, Twitter, Youtube, Music, Calendar, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { mockPortfolio } from '../data/mockData';
import { useState } from 'react';

type ViewState = 'found' | 'not-found' | 'not-public' | 'empty';

export function PublicPortfolio() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [viewState] = useState<ViewState>(
    handle === 'alexrivers' ? 'found' : handle === 'private' ? 'not-public' : 'not-found'
  );

  // Not Found State
  if (viewState === 'not-found') {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-6">
            <Music className="w-12 h-12 text-[#7A42E8]" />
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

  // Not Public State
  if (viewState === 'not-public') {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-6">
            <Music className="w-12 h-12 text-[#7A42E8]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1F2430] mb-3">Portfolio Not Public</h1>
          <p className="text-[#7A7F8C] mb-6">
            This portfolio is currently private and not available for public viewing.
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

  const portfolio = mockPortfolio;
  const enabledSections = portfolio.sections.filter(s => s.enabled);
  const socialIcons = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    youtube: Youtube,
    spotify: Music,
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] text-white">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Portrait */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 mx-auto mb-6 overflow-hidden">
              <ImageWithFallback
                src=""
                alt={portfolio.artistName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Artist Name */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{portfolio.artistName}</h1>

            {/* Bio */}
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              {portfolio.bio}
            </p>

            {/* Social Links */}
            {Object.keys(portfolio.socialLinks).length > 0 && (
              <div className="flex items-center justify-center gap-4 mb-8">
                {Object.entries(portfolio.socialLinks).map(([platform, url]) => {
                  if (!url) return null;
                  const Icon = socialIcons[platform as keyof typeof socialIcons];
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
                    >
                      <Icon className="w-6 h-6" />
                    </a>
                  );
                })}
              </div>
            )}

            {/* Book CTA */}
            <button
              onClick={() => navigate(`/${handle}/book`)}
              className="px-8 py-4 rounded-2xl bg-white text-[#7A42E8] font-semibold text-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Book Me</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {enabledSections.map((section) => {
          // Photos Section
          if (section.type === 'photos' && section.content.photos?.length > 0) {
            return (
              <section key={section.id} className="mb-16">
                <h2 className="text-3xl font-bold text-[#1F2430] mb-6">{section.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {section.content.photos.map((photo: any) => (
                    <div key={photo.id} className="aspect-square rounded-2xl bg-[#F4EEFD] overflow-hidden">
                      <ImageWithFallback
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Videos Section
          if (section.type === 'videos' && section.content.videos?.length > 0) {
            return (
              <section key={section.id} className="mb-16">
                <h2 className="text-3xl font-bold text-[#1F2430] mb-6">{section.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.content.videos.map((video: any) => (
                    <a
                      key={video.id}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-video rounded-2xl bg-[#F4EEFD] overflow-hidden"
                    >
                      <ImageWithFallback
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[16px] border-l-[#7A42E8] border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white font-semibold">{video.title}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          }

          // Music Section
          if (section.type === 'music' && section.content.releases?.length > 0) {
            return (
              <section key={section.id} className="mb-16">
                <h2 className="text-3xl font-bold text-[#1F2430] mb-6">{section.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {section.content.releases.map((release: any) => (
                    <a
                      key={release.id}
                      href={release.streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-2xl border border-[#DDDCE7] p-6 hover:shadow-lg transition-all"
                    >
                      <div className="aspect-square rounded-xl bg-[#F4EEFD] mb-4 overflow-hidden">
                        <ImageWithFallback
                          src={release.coverUrl}
                          alt={release.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-bold text-[#1F2430] mb-1">{release.title}</h3>
                      <p className="text-sm text-[#7A7F8C]">{release.artist}</p>
                      <div className="mt-4 flex items-center gap-2 text-[#7A42E8] font-medium text-sm">
                        <span>Stream Now</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          }

          // Booking Section
          if (section.type === 'booking') {
            return (
              <section key={section.id} className="mb-16">
                <div className="bg-gradient-to-br from-[#F4EEFD] to-[#E3DBF9] rounded-3xl p-8 md:p-12 text-center">
                  <h2 className="text-3xl font-bold text-[#1F2430] mb-4">{section.title}</h2>
                  <p className="text-[#4F5868] mb-8 max-w-2xl mx-auto">
                    {section.content.description}
                  </p>
                  <button
                    onClick={() => navigate(`/${handle}/book`)}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold text-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Check Availability</span>
                  </button>
                </div>
              </section>
            );
          }

          return null;
        })}

        {/* Empty State */}
        {enabledSections.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-6">
              <Music className="w-12 h-12 text-[#7A42E8]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1F2430] mb-3">Portfolio Coming Soon</h2>
            <p className="text-[#7A7F8C]">
              {portfolio.artistName} is currently building their portfolio. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#DDDCE7] bg-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#7A7F8C]">
            Powered by{' '}
            <button onClick={() => navigate('/')} className="text-[#7A42E8] font-medium hover:underline">
              Museio
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
}
