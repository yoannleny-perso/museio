import { Eye, Share2, Edit, TrendingUp, Users, MousePointerClick, Calendar, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockPortfolioV3 } from '../../../data/mockPortfolioV3';
import { themePresets } from '../../../types/portfolio-v3';
import artistPhoto from 'figma:asset/955703e49fcbf25216ca19f63d51755d531a4505.png';

export function PortfolioHome() {
  const navigate = useNavigate();
  const portfolio = mockPortfolioV3;
  const theme = themePresets[portfolio.theme.preset];
  const analytics = portfolio.analytics;

  const getCompletionColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-[#DDDCE7] px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1F2430]">Portfolio</h1>
          <p className="text-sm text-[#7A7F8C] mt-1">Build your premium creator showcase</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Live Status Card */}
        <div className="bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] rounded-3xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-semibold opacity-90">Live & Public</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">{portfolio.handle ? `/${portfolio.handle}` : 'Portfolio'}</h2>
              {portfolio.lastPublished && (
                <p className="text-sm opacity-75">
                  Last updated {new Date(portfolio.lastPublished).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/app/portfolio/builder')}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  // Open in new tab
                  const url = `/${portfolio.handle}`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                title="Preview your portfolio"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-2xl font-bold">{analytics.stats.views.toLocaleString()}</div>
              <div className="text-xs opacity-75 mt-1">Views (30d)</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-2xl font-bold">{analytics.stats.ctaTaps}</div>
              <div className="text-xs opacity-75 mt-1">CTA Taps</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-2xl font-bold">{analytics.stats.conversionRate}%</div>
              <div className="text-xs opacity-75 mt-1">Conversion</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/app/portfolio/builder')}
            className="bg-white rounded-2xl p-6 border border-[#DDDCE7] hover:border-[#7A42E8] hover:shadow-lg transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] flex items-center justify-center mb-4">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-[#1F2430] mb-1">Edit Portfolio</h3>
            <p className="text-sm text-[#7A7F8C]">Add sections, update content</p>
            <div className="flex items-center gap-1 text-[#7A42E8] text-sm font-medium mt-3 group-hover:gap-2 transition-all">
              <span>Open Builder</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => navigate('/app/portfolio/theme-studio')}
            className="bg-white rounded-2xl p-6 border border-[#DDDCE7] hover:border-[#7A42E8] hover:shadow-lg transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F472B6] to-[#DB2777] flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-[#1F2430] mb-1">Theme Studio</h3>
            <p className="text-sm text-[#7A7F8C]">Customize colors, style, mood</p>
            <div className="flex items-center gap-1 text-[#DB2777] text-sm font-medium mt-3 group-hover:gap-2 transition-all">
              <span>Customize</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => navigate('/app/portfolio/insights')}
            className="bg-white rounded-2xl p-6 border border-[#DDDCE7] hover:border-[#7A42E8] hover:shadow-lg transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-[#1F2430] mb-1">Insights</h3>
            <p className="text-sm text-[#7A7F8C]">Views, conversions, analytics</p>
            <div className="flex items-center gap-1 text-[#059669] text-sm font-medium mt-3 group-hover:gap-2 transition-all">
              <span>View Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Completion & Readiness Scores */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1F2430]">Portfolio Completion</h3>
              <span className={`text-2xl font-bold px-3 py-1 rounded-xl ${getCompletionColor(portfolio.completionScore)}`}>
                {portfolio.completionScore}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#F4EEFD] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] rounded-full transition-all duration-500"
                style={{ width: `${portfolio.completionScore}%` }}
              />
            </div>
            <p className="text-sm text-[#7A7F8C] mt-3">
              {portfolio.completionScore >= 80 ? 'Looking great! Your portfolio is complete and ready to impress.' : 'Add more sections to boost your completion score.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1F2430]">Booking Readiness</h3>
              <span className={`text-2xl font-bold px-3 py-1 rounded-xl ${getCompletionColor(portfolio.bookingReadinessScore)}`}>
                {portfolio.bookingReadinessScore}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#F4EEFD] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full transition-all duration-500"
                style={{ width: `${portfolio.bookingReadinessScore}%` }}
              />
            </div>
            <p className="text-sm text-[#7A7F8C] mt-3">
              {portfolio.bookingReadinessScore >= 80 ? 'Excellent! Clients can easily understand and book you.' : 'Add testimonials and packages to improve booking conversion.'}
            </p>
          </div>
        </div>

        {/* Recent Analytics Snapshot */}
        <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[#1F2430]">Recent Performance</h3>
            <button
              onClick={() => navigate('/app/portfolio/insights')}
              className="text-sm text-[#7A42E8] font-medium hover:underline"
            >
              View Full Analytics
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#F8F9FB]">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#7A42E8]" />
                <span className="text-xs font-semibold text-[#7A7F8C] uppercase">Visitors</span>
              </div>
              <div className="text-2xl font-bold text-[#1F2430]">{analytics.stats.uniqueVisitors.toLocaleString()}</div>
              <div className="text-xs text-[#7A7F8C] mt-1">Last 30 days</div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FB]">
              <div className="flex items-center gap-2 mb-2">
                <MousePointerClick className="w-4 h-4 text-[#7A42E8]" />
                <span className="text-xs font-semibold text-[#7A7F8C] uppercase">CTA Taps</span>
              </div>
              <div className="text-2xl font-bold text-[#1F2430]">{analytics.stats.ctaTaps}</div>
              <div className="text-xs text-green-600 mt-1">+12% from last period</div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FB]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#7A42E8]" />
                <span className="text-xs font-semibold text-[#7A7F8C] uppercase">Bookings</span>
              </div>
              <div className="text-2xl font-bold text-[#1F2430]">{analytics.stats.bookingSubmissions}</div>
              <div className="text-xs text-green-600 mt-1">+8% from last period</div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FB]">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#7A42E8]" />
                <span className="text-xs font-semibold text-[#7A7F8C] uppercase">Conversion</span>
              </div>
              <div className="text-2xl font-bold text-[#1F2430]">{analytics.stats.conversionRate}%</div>
              <div className="text-xs text-[#7A7F8C] mt-1">Above average</div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {analytics.insights && analytics.insights.length > 0 && (
          <div className="bg-gradient-to-br from-[#F4EEFD] to-[#E8DEFF] rounded-2xl p-6 border border-[#DDDCE7]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#7A42E8]" />
              <h3 className="font-bold text-[#1F2430]">Smart Insights</h3>
            </div>
            <div className="space-y-3">
              {analytics.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <div className="w-6 h-6 rounded-full bg-[#7A42E8] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-[#1F2430] font-medium">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Options */}
        <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
          <h3 className="font-bold text-[#1F2430] mb-4">Share Your Portfolio</h3>
          <div className="flex items-center gap-3 p-4 bg-[#F8F9FB] rounded-xl mb-4">
            <div className="flex-1 font-mono text-sm text-[#7A42E8] truncate">
              {window.location.origin}/{portfolio.handle}
            </div>
            <button
              onClick={() => {
                const url = `${window.location.origin}/${portfolio.handle}`;
                // Try modern clipboard API first, fallback to legacy method
                if (navigator.clipboard && window.isSecureContext) {
                  navigator.clipboard.writeText(url)
                    .then(() => alert('Link copied to clipboard!'))
                    .catch(() => {
                      // Fallback: create a temporary input element
                      const input = document.createElement('input');
                      input.value = url;
                      document.body.appendChild(input);
                      input.select();
                      document.execCommand('copy');
                      document.body.removeChild(input);
                      alert('Link copied to clipboard!');
                    });
                } else {
                  // Fallback for non-secure contexts
                  const input = document.createElement('input');
                  input.value = url;
                  document.body.appendChild(input);
                  input.select();
                  document.execCommand('copy');
                  document.body.removeChild(input);
                  alert('Link copied to clipboard!');
                }
              }}
              className="px-4 py-2 rounded-lg bg-[#7A42E8] text-white font-medium hover:bg-[#6816B0] transition-colors flex-shrink-0"
            >
              Copy Link
            </button>
          </div>
          <button
            onClick={() => {
              // Open native share dialog
              if (navigator.share) {
                navigator.share({
                  title: portfolio.handle,
                  url: `${window.location.origin}/${portfolio.handle}`,
                });
              }
            }}
            className="w-full px-6 py-3 rounded-xl border-2 border-[#7A42E8] text-[#7A42E8] font-semibold hover:bg-[#F4EEFD] transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Portfolio</span>
          </button>
        </div>

        {/* Setup Reminder (if handle not set) */}
        {!portfolio.handle && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">Set Your Portfolio Handle</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Choose a custom handle to make your portfolio public and shareable.
                </p>
                <button
                  onClick={() => navigate('/app/settings')}
                  className="px-4 py-2 rounded-lg bg-yellow-600 text-white font-medium hover:bg-yellow-700 transition-colors"
                >
                  Go to Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}