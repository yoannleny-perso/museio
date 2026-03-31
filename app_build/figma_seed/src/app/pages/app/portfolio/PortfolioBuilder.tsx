import { useState } from 'react';
import { Eye, Edit, Smartphone, Layers, Palette, Plus, GripVertical, Trash2, ChevronDown, ChevronUp, Settings, CheckCircle2, MoreVertical, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { mockPortfolioV3 } from '../../../data/mockPortfolioV3';
import { BuilderMode } from '../../../types/portfolio-v3';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';

// Define drag item type
const BLOCK_TYPE = 'PORTFOLIO_BLOCK';

interface DragItem {
  id: string;
  index: number;
}

// Draggable Block Component
function DraggableBlock({ block, index, moveBlock, expandedBlock, toggleBlockExpanded, toggleBlockEnabled, deleteBlock, navigate }: any) {
  const [{ isDragging }, drag, preview] = useDrag({
    type: BLOCK_TYPE,
    item: { id: block.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: BLOCK_TYPE,
    hover: (item: DragItem) => {
      if (item.index !== index) {
        moveBlock(item.index, index);
        item.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => preview(drop(node))}
      className={`bg-white rounded-2xl overflow-hidden border-2 transition-all ${
        expandedBlock === block.id
          ? 'border-brand shadow-lg'
          : isOver
          ? 'border-brand'
          : 'border-[#DDDCE7]'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Main Card - Always Visible */}
      <div className="flex items-center gap-3 p-4">
        {/* Drag Handle */}
        <button
          ref={drag}
          className="cursor-grab active:cursor-grabbing p-2 -ml-2 hover:bg-[#F8F9FB] rounded-lg transition-colors"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5 text-[#A4A9B6]" />
        </button>

        {/* Content - Takes remaining space */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => toggleBlockExpanded(block.id)}
        >
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#1F2430] text-base truncate">
              {block.title || block.type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </h3>
            {!block.enabled && (
              <span className="px-2 py-0.5 rounded-full bg-[#F8F9FB] text-[10px] font-medium text-[#7A7F8C] uppercase tracking-wide flex-shrink-0">
                Off
              </span>
            )}
          </div>
          <div className="text-xs text-[#A4A9B6] mt-0.5 truncate">{block.type}</div>
        </div>

        {/* Right Actions - Compact */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status Indicator */}
          <div
            className={`w-2 h-2 rounded-full ${
              block.enabled ? 'bg-green-500' : 'bg-[#DDDCE7]'
            }`}
            aria-label={block.enabled ? 'Enabled' : 'Disabled'}
          />

          {/* Expand Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBlockExpanded(block.id);
            }}
            className="p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors"
            aria-label={expandedBlock === block.id ? 'Collapse' : 'Expand'}
          >
            {expandedBlock === block.id ? (
              <ChevronUp className="w-5 h-5 text-[#7A7F8C]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#7A7F8C]" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Action Panel */}
      {expandedBlock === block.id && (
        <div className="border-t border-[#DDDCE7] bg-[#F8F9FB]">
          {/* Action Buttons Grid */}
          <div className="p-3 grid grid-cols-2 gap-2">
            {/* Edit Button */}
            <button
              onClick={() => navigate(`/app/portfolio/builder/edit/${block.id}`)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C6FDC] text-white font-medium hover:shadow-lg transition-all active:scale-95"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Edit</span>
            </button>

            {/* Toggle Enabled */}
            <button
              onClick={() => toggleBlockEnabled(block.id)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all active:scale-95 ${
                block.enabled
                  ? 'bg-white border-2 border-[#DDDCE7] text-[#4F5868] hover:border-brand'
                  : 'bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100'
              }`}
            >
              {block.enabled ? (
                <>
                  <X className="w-4 h-4" />
                  <span className="text-sm">Disable</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Enable</span>
                </>
              )}
            </button>

            {/* Delete Button */}
            <button
              onClick={() => deleteBlock(block.id)}
              className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-red-200 text-red-600 font-medium hover:bg-red-50 hover:border-red-300 transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Delete Section</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PortfolioBuilder() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(() => {
    // Load from localStorage if available, otherwise use mock data
    const saved = localStorage.getItem('museio-portfolio-v3');
    return saved ? JSON.parse(saved) : mockPortfolioV3;
  });
  const [mode, setMode] = useState<BuilderMode>('edit');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  // Save to localStorage whenever portfolio changes
  const updatePortfolio = (updatedPortfolio: any) => {
    setPortfolio(updatedPortfolio);
    localStorage.setItem('museio-portfolio-v3', JSON.stringify(updatedPortfolio));
  };

  const selectedBlock = portfolio.blocks.find(b => b.id === selectedBlockId);

  const toggleBlockExpanded = (blockId: string) => {
    setExpandedBlock(expandedBlock === blockId ? null : blockId);
  };

  const deleteBlock = (blockId: string) => {
    if (confirm('Delete this section?')) {
      updatePortfolio({
        ...portfolio,
        blocks: portfolio.blocks.filter(b => b.id !== blockId),
      });
      setSelectedBlockId(null);
    }
  };

  const toggleBlockEnabled = (blockId: string) => {
    updatePortfolio({
      ...portfolio,
      blocks: portfolio.blocks.map(b =>
        b.id === blockId ? { ...b, enabled: !b.enabled } : b
      ),
    });
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const blocks = [...portfolio.blocks];
    const [movedBlock] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, movedBlock);
    updatePortfolio({
      ...portfolio,
      blocks,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-[#DDDCE7] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app/portfolio')}
              className="text-brand font-medium hover:underline text-sm flex-shrink-0"
            >
              ← Back
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-[#F8F9FB] rounded-xl p-1 flex-shrink-0">
            <button
              onClick={() => setMode('edit')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'edit'
                  ? 'bg-white text-brand shadow-sm'
                  : 'text-[#7A7F8C] hover:text-[#1F2430]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span className="hidden md:inline">Edit</span>
              </span>
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'preview'
                  ? 'bg-white text-brand shadow-sm'
                  : 'text-[#7A7F8C] hover:text-[#1F2430]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="hidden md:inline">Preview</span>
              </span>
            </button>
            <button
              onClick={() => window.open(`/${portfolio.handle}`, '_blank')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'live'
                  ? 'bg-white text-brand shadow-sm'
                  : 'text-[#7A7F8C] hover:text-[#1F2430]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span className="hidden md:inline">Live</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {mode === 'edit' ? (
          <div className="space-y-4">
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-[#1F2430] mb-2">Portfolio Builder</h1>

            {/* Empty State */}
            {portfolio.blocks.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-[#DDDCE7]">
                <div className="w-20 h-20 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-10 h-10 text-[#7A42E8]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1F2430] mb-2">Start Building</h2>
                <p className="text-[#7A7F8C] mb-6">Add your first section to create your portfolio</p>
                <button
                  onClick={() => setShowAddSection(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all"
                >
                  Add Section
                </button>
              </div>
            )}

            {/* Block List */}
            <DndProvider backend={HTML5Backend}>
              {portfolio.blocks.map((block, index) => (
                <DraggableBlock
                  key={block.id}
                  block={block}
                  index={index}
                  moveBlock={moveBlock}
                  expandedBlock={expandedBlock}
                  toggleBlockExpanded={toggleBlockExpanded}
                  toggleBlockEnabled={toggleBlockEnabled}
                  deleteBlock={deleteBlock}
                  navigate={navigate}
                />
              ))}
            </DndProvider>

            {/* Add Section Button */}
            {portfolio.blocks.length > 0 && (
              <button
                onClick={() => setShowAddSection(true)}
                className="w-full py-6 rounded-2xl border-2 border-dashed border-[#DDDCE7] text-[#7A42E8] font-semibold hover:border-[#7A42E8] hover:bg-white transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Section</span>
              </button>
            )}
          </div>
        ) : (
          // Preview Mode - Show simplified public view
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto">
            <div className="bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] p-8 text-white text-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-4 overflow-hidden border-4 border-white/30">
                <ImageWithFallback src="" alt="Preview" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {portfolio.blocks.find(b => b.type === 'hero')?.content.artistName || 'Your Name'}
              </h2>
              <p className="opacity-90">
                {portfolio.blocks.find(b => b.type === 'hero')?.content.descriptor || 'Your title'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {portfolio.blocks
                .filter(b => b.enabled)
                .map(block => (
                  <div key={block.id} className="p-4 rounded-xl border border-[#DDDCE7] bg-[#F8F9FB]">
                    <div className="font-semibold text-[#1F2430] text-sm">
                      {block.title || block.type}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Thumb-First Action Dock */}
      <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:right-auto md:left-0 md:w-full z-20 bg-white border-t border-[#DDDCE7] md:border-b md:border-t-0 px-6 py-4 md:hidden">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setShowAddSection(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-[#F8F9FB] transition-colors"
          >
            <Plus className="w-6 h-6 text-[#7A42E8]" />
            <span className="text-xs font-medium text-[#7A42E8]">Add</span>
          </button>

          <button
            onClick={() => setMode('rearrange')}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-[#F8F9FB] transition-colors"
          >
            <Layers className="w-6 h-6 text-[#7A7F8C]" />
            <span className="text-xs font-medium text-[#7A7F8C]">Arrange</span>
          </button>

          <button
            onClick={() => navigate('/app/portfolio/theme-studio')}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-[#F8F9FB] transition-colors"
          >
            <Palette className="w-6 h-6 text-[#7A7F8C]" />
            <span className="text-xs font-medium text-[#7A7F8C]">Style</span>
          </button>

          <button
            onClick={() => setMode('preview')}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-[#F8F9FB] transition-colors"
          >
            <Eye className="w-6 h-6 text-[#7A7F8C]" />
            <span className="text-xs font-medium text-[#7A7F8C]">Preview</span>
          </button>

          <button
            onClick={() => alert('Publishing...')}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="text-xs font-medium">Publish</span>
          </button>
        </div>
      </div>

      {/* Add Section Bottom Sheet */}
      {showAddSection && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddSection(false)}
          />
          <div className="relative w-full md:max-w-3xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#DDDCE7] p-6 rounded-t-3xl md:rounded-t-3xl">
              <h2 className="text-2xl font-bold text-[#1F2430]">Add Section</h2>
              <p className="text-sm text-[#7A7F8C] mt-1">Choose a content block to add to your portfolio</p>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-4">
              {sectionTypes.map(section => (
                <button
                  key={section.type}
                  onClick={() => {
                    // Add new block
                    const newBlock = {
                      id: `block-${Date.now()}`,
                      type: section.type as any,
                      title: section.title,
                      enabled: true,
                      order: portfolio.blocks.length,
                      visibility: 'public' as const,
                      content: {},
                    };
                    updatePortfolio({
                      ...portfolio,
                      blocks: [...portfolio.blocks, newBlock],
                    });
                    setShowAddSection(false);
                    navigate(`/app/portfolio/builder/edit/${newBlock.id}`);
                  }}
                  className="p-4 rounded-xl border-2 border-[#DDDCE7] hover:border-[#7A42E8] hover:bg-[#F4EEFD] transition-all text-left group"
                >
                  <div className="font-bold text-[#1F2430] mb-1 group-hover:text-[#7A42E8]">{section.title}</div>
                  <div className="text-sm text-[#7A7F8C]">{section.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sectionTypes = [
  { type: 'hero', title: 'Hero Section', description: 'Main introduction with photo and CTAs' },
  { type: 'short-bio', title: 'Bio', description: 'About you and your work' },
  { type: 'featured-video', title: 'Featured Video', description: 'Showcase your reel or performance' },
  { type: 'gallery', title: 'Gallery', description: 'Photo and video collection' },
  { type: 'testimonial-carousel', title: 'Testimonials', description: 'Client reviews and feedback' },
  { type: 'brand-logos', title: 'Brand Logos', description: 'Companies and venues you\'ve worked with' },
  { type: 'featured-package', title: 'Packages', description: 'Service offerings and pricing' },
  { type: 'faq', title: 'FAQ', description: 'Frequently asked questions' },
  { type: 'booking-cta', title: 'Booking CTA', description: 'Call-to-action for bookings' },
  { type: 'contact', title: 'Contact', description: 'Contact information and inquiry form' },
];