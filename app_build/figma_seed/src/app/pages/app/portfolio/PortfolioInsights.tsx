import { TrendingUp, Users, MousePointerClick, Calendar, ExternalLink, Eye, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockPortfolioV3 } from '../../../data/mockPortfolioV3';

export function PortfolioInsights() {
  const navigate = useNavigate();
  const portfolio = mockPortfolioV3;
  const analytics = portfolio.analytics;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-[#DDDCE7] px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate('/app/portfolio')}
              className="flex items-center gap-2 text-[#7A42E8] font-medium hover:underline text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-[#1F2430]">Portfolio Insights</h1>
          </div>
          <p className="text-sm text-[#7A7F8C]">
            {new Date(analytics.dateRange.start).toLocaleDateString()} - {new Date(analytics.dateRange.end).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-[#7A42E8]" />
              <span className="text-xs font-semibold text-[#7A7F8C] uppercase">Total Views</span>
            </div>
            <div className="text-3xl font-bold text-[#1F2430] mb-1">
              {analytics.stats.views.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 font-medium">+24% from last period</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-[#7A42E8]" />
              <span className="text-xs font-semibold text-[#7A7F8C] uppercase">Unique Visitors</span>
            </div>
            <div className="text-3xl font-bold text-[#1F2430] mb-1">
              {analytics.stats.uniqueVisitors.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 font-medium">+18% from last period</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
            <div className="flex items-center gap-2 mb-3">
              <MousePointerClick className="w-5 h-5 text-[#7A42E8]" />
              <span className="text-xs font-semibold text-[#7A7F8C] uppercase">CTA Taps</span>
            </div>
            <div className="text-3xl font-bold text-[#1F2430] mb-1">
              {analytics.stats.ctaTaps}
            </div>
            <div className="text-sm text-green-600 font-medium">+12% from last period</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-[#7A42E8]" />
              <span className="text-xs font-semibold text-[#7A7F8C] uppercase">Bookings</span>
            </div>
            <div className="text-3xl font-bold text-[#1F2430] mb-1">
              {analytics.stats.bookingSubmissions}
            </div>
            <div className="text-sm text-green-600 font-medium">+8% from last period</div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
          <h2 className="font-bold text-[#1F2430] mb-6">Booking Conversion Funnel</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#7A7F8C]">Portfolio Views</span>
                <span className="text-sm font-bold text-[#1F2430]">{analytics.bookingFunnel.views.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-[#F4EEFD] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#7A7F8C]">Booking Started</span>
                <span className="text-sm font-bold text-[#1F2430]">{analytics.bookingFunnel.bookingStarts}</span>
              </div>
              <div className="w-full h-3 bg-[#F4EEFD] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] rounded-full"
                  style={{ width: `${(analytics.bookingFunnel.bookingStarts / analytics.bookingFunnel.views) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#7A7F8C]">Booking Submitted</span>
                <span className="text-sm font-bold text-[#1F2430]">{analytics.bookingFunnel.submissions}</span>
              </div>
              <div className="w-full h-3 bg-[#F4EEFD] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full"
                  style={{ width: `${(analytics.bookingFunnel.submissions / analytics.bookingFunnel.views) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#DDDCE7]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1F2430]">Overall Conversion Rate</span>
                <span className="text-2xl font-bold text-green-600">{analytics.bookingFunnel.conversionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Performance */}
        <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
          <h2 className="font-bold text-[#1F2430] mb-6">Top Performing Sections</h2>
          <div className="space-y-4">
            {analytics.sectionPerformance.map((section, index) => (
              <div key={section.sectionId} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#7A42E8] text-white flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#1F2430]">{section.sectionTitle}</span>
                    <span className="text-sm text-[#7A7F8C]">{section.views.toLocaleString()} views</span>
                  </div>
                  <div className="w-full h-2 bg-[#F4EEFD] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] rounded-full"
                      style={{ width: `${section.engagement}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referrer Sources */}
        <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
          <h2 className="font-bold text-[#1F2430] mb-6">Top Referrer Sources</h2>
          <div className="space-y-4">
            {analytics.referrerSources.map((referrer, index) => (
              <div key={referrer.source} className="flex items-center justify-between p-4 bg-[#F8F9FB] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#7A42E8] text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1F2430]">{referrer.source}</div>
                    <div className="text-sm text-[#7A7F8C]">{referrer.visits} visits</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#1F2430]">{referrer.conversions}</div>
                  <div className="text-xs text-[#7A7F8C]">conversions</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Insights */}
        <div className="bg-gradient-to-br from-[#F4EEFD] to-[#E8DEFF] rounded-2xl p-6 border border-[#DDDCE7]">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-[#7A42E8]" />
            <h2 className="font-bold text-[#1F2430]">AI-Powered Insights</h2>
          </div>
          <div className="space-y-3">
            {analytics.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4">
                <TrendingUp className="w-5 h-5 text-[#7A42E8] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#1F2430] font-medium">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/app/portfolio/builder')}
            className="bg-white rounded-2xl p-6 border border-[#DDDCE7] hover:border-[#7A42E8] hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1F2430] mb-1">Improve Your Portfolio</h3>
                <p className="text-sm text-[#7A7F8C]">Add more sections based on insights</p>
              </div>
              <ExternalLink className="w-5 h-5 text-[#7A42E8] group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/app/portfolio/theme-studio')}
            className="bg-white rounded-2xl p-6 border border-[#DDDCE7] hover:border-[#7A42E8] hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1F2430] mb-1">Try A/B Testing Themes</h3>
                <p className="text-sm text-[#7A7F8C]">Test different themes for better conversion</p>
              </div>
              <ExternalLink className="w-5 h-5 text-[#7A42E8] group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
