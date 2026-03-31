import { useState } from 'react';
import { Plus, Eye, Share2, ExternalLink, GripVertical, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

export function Portfolio() {
  const navigate = useNavigate();
  const { portfolio, updatePortfolio, user } = useApp();
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleTogglePublic = () => {
    if (!user?.username) {
      setShowUsernameDialog(true);
      return;
    }
    updatePortfolio({ isPublic: !portfolio.isPublic });
  };

  const handleShare = () => {
    if (!user?.username) {
      setShowUsernameDialog(true);
      return;
    }
    setShowShareDialog(true);
  };

  const portfolioUrl = user?.username ? `${window.location.origin}/${user.username}` : '';

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] flex items-center justify-center">
              <span className="font-bold text-white text-lg">M</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1F2430]">MUSEIO</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-medium text-[#4F5868]">
                {portfolio.isPublic ? 'Public' : 'Private'}
              </span>
              <button
                onClick={handleTogglePublic}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  portfolio.isPublic ? 'bg-[#7A42E8]' : 'bg-[#DDDCE7]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    portfolio.isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
            <button
              onClick={() => user?.username && navigate(`/${user.username}`)}
              disabled={!user?.username}
              className="px-4 py-2 rounded-xl border border-[#DDDCE7] text-[#4F5868] font-medium hover:bg-[#F8F9FB] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Portfolio Builder */}
        <div className="bg-gradient-to-br from-[#F4EEFD] to-[#E3DBF9] rounded-3xl p-8 border border-[#DDDCE7] space-y-6">
          {/* Hero Section */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1F2430]">Hero Section</h3>
              <Edit className="w-5 h-5 text-[#7A42E8]" />
            </div>
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-full bg-[#F4EEFD] flex items-center justify-center overflow-hidden">
                <ImageWithFallback src="" alt="Portrait" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={portfolio.artistName}
                  onChange={(e) => updatePortfolio({ artistName: e.target.value })}
                  placeholder="Artist Name"
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none font-semibold text-lg"
                />
                <textarea
                  value={portfolio.bio}
                  onChange={(e) => updatePortfolio({ bio: e.target.value })}
                  placeholder="Short bio..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-bold text-[#1F2430] mb-4">Social Media Links</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(portfolio.socialLinks).map(([platform, url]) => (
                <input
                  key={platform}
                  type="url"
                  value={url || ''}
                  onChange={(e) => updatePortfolio({ 
                    socialLinks: { ...portfolio.socialLinks, [platform]: e.target.value }
                  })}
                  placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                  className="px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                />
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            {portfolio.sections.map((section) => (
              <div key={section.id} className="bg-white rounded-2xl p-6 flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-[#A4A9B6] cursor-move flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-[#1F2430] text-lg">{section.title || section.type}</div>
                  <div className="text-sm text-[#7A7F8C]">{section.type}</div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={(e) => {
                          const updated = portfolio.sections.map(s => 
                            s.id === section.id ? { ...s, enabled: e.target.checked } : s
                          );
                          updatePortfolio({ sections: updated });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-6 h-6 border-2 border-[#DDDCE7] rounded peer-checked:bg-[#5865F2] peer-checked:border-[#5865F2] flex items-center justify-center transition-all">
                        {section.enabled && (
                          <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                            <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[#1F2430]">Enabled</span>
                  </label>
                  <button 
                    onClick={() => {
                      if (confirm(`Delete ${section.title || section.type} section?`)) {
                        const updated = portfolio.sections.filter(s => s.id !== section.id);
                        updatePortfolio({ sections: updated });
                      }
                    }}
                    className="p-2 text-[#FF4444] hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Section */}
          <button className="w-full py-4 rounded-2xl border-2 border-dashed border-[#DDDCE7] text-[#7A42E8] font-semibold hover:border-[#7A42E8] hover:bg-white transition-all flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            <span>Add New Section</span>
          </button>
        </div>
      </div>

      {/* Username Required Dialog */}
      {showUsernameDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUsernameDialog(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1F2430] mb-4">Username Required</h2>
            <p className="text-[#4F5868] mb-6">
              You need to set a public username before you can publish or share your portfolio.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUsernameDialog(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-[#DDDCE7] font-semibold hover:bg-[#F8F9FB]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUsernameDialog(false);
                  navigate('/app/settings');
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold"
              >
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowShareDialog(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1F2430] mb-4">Share Your Portfolio</h2>
            <div className="bg-[#F4EEFD] rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-1 text-sm text-[#7A42E8] font-mono truncate">{portfolioUrl}</div>
                <button
                  onClick={() => {
                    // Try modern clipboard API first, fallback to legacy method
                    if (navigator.clipboard && window.isSecureContext) {
                      navigator.clipboard.writeText(portfolioUrl)
                        .then(() => alert('Link copied!'))
                        .catch(() => {
                          // Fallback: create a temporary input element
                          const input = document.createElement('input');
                          input.value = portfolioUrl;
                          document.body.appendChild(input);
                          input.select();
                          document.execCommand('copy');
                          document.body.removeChild(input);
                          alert('Link copied!');
                        });
                    } else {
                      // Fallback for non-secure contexts
                      const input = document.createElement('input');
                      input.value = portfolioUrl;
                      document.body.appendChild(input);
                      input.select();
                      document.execCommand('copy');
                      document.body.removeChild(input);
                      alert('Link copied!');
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-[#7A42E8] text-white font-medium hover:bg-[#6816B0]"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowShareDialog(false)}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}