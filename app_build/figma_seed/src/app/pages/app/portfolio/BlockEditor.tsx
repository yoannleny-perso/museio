import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Upload, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { mockPortfolioV3 } from '../../../data/mockPortfolioV3';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';
import artistPhoto from 'figma:asset/955703e49fcbf25216ca19f63d51755d531a4505.png';

export function BlockEditor() {
  const navigate = useNavigate();
  const { blockId } = useParams();
  const [portfolio, setPortfolio] = useState(() => {
    // Load from localStorage if available, otherwise use mock data
    const saved = localStorage.getItem('museio-portfolio-v3');
    return saved ? JSON.parse(saved) : mockPortfolioV3;
  });

  const block = portfolio.blocks.find(b => b.id === blockId);

  if (!block) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1F2430] mb-2">Block Not Found</h2>
          <button
            onClick={() => navigate('/app/portfolio/builder')}
            className="text-[#7A42E8] font-medium hover:underline"
          >
            Back to Builder
          </button>
        </div>
      </div>
    );
  }

  const updateBlockContent = (updates: any) => {
    const updated = portfolio.blocks.map(b =>
      b.id === blockId
        ? { ...b, content: { ...b.content, ...updates } }
        : b
    );
    const updatedPortfolio = { ...portfolio, blocks: updated };
    setPortfolio(updatedPortfolio);
    localStorage.setItem('museio-portfolio-v3', JSON.stringify(updatedPortfolio));
  };

  const updateBlockTitle = (title: string) => {
    const updated = portfolio.blocks.map(b =>
      b.id === blockId ? { ...b, title } : b
    );
    const updatedPortfolio = { ...portfolio, blocks: updated };
    setPortfolio(updatedPortfolio);
    localStorage.setItem('museio-portfolio-v3', JSON.stringify(updatedPortfolio));
  };

  const saveBlock = () => {
    // In production, save to backend
    alert('Block saved successfully!');
    navigate('/app/portfolio/builder');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-[#DDDCE7] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/portfolio/builder')}
              className="flex items-center gap-2 text-[#7A42E8] font-medium hover:underline text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-[#1F2430]">
              Edit {block.title || block.type}
            </h1>
          </div>

          <button
            onClick={saveBlock}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Hero Block Editor */}
        {block.type === 'hero' && <HeroEditor block={block} updateContent={updateBlockContent} />}

        {/* Short Bio Editor */}
        {block.type === 'short-bio' && <BioEditor block={block} updateContent={updateBlockContent} updateTitle={updateBlockTitle} />}

        {/* Featured Video Editor */}
        {block.type === 'featured-video' && <VideoEditor block={block} updateContent={updateBlockContent} updateTitle={updateBlockTitle} />}

        {/* Gallery Editor */}
        {block.type === 'gallery' && <GalleryEditor block={block} updateContent={updateBlockContent} updateTitle={updateBlockTitle} />}

        {/* Testimonials Editor */}
        {block.type === 'testimonial-carousel' && <TestimonialsEditor block={block} updateContent={updateBlockContent} updateTitle={updateBlockTitle} />}

        {/* Brand Logos Editor */}
        {block.type === 'brand-logos' && <BrandLogosEditor block={block} updateContent={updateBlockContent} updateTitle={updateBlockTitle} />}

        {/* Featured Package Editor */}
        {block.type === 'featured-package' && <PackagesEditor block={block} updateContent={updateBlockContent} updateTitle={updateBlockTitle} />}

        {/* FAQ Editor */}
        {block.type === 'faq' && <FAQEditor block={block} updateContent={updateBlockContent} updateTitle={updateBlockTitle} />}

        {/* Booking CTA Editor */}
        {block.type === 'booking-cta' && <BookingCTAEditor block={block} updateContent={updateBlockContent} updateTitle={updateBlockTitle} />}

        {/* Contact Editor */}
        {block.type === 'contact' && <ContactEditor block={block} updateContent={updateBlockContent} updateTitle={updateBlockTitle} />}
      </div>
    </div>
  );
}

// Hero Section Editor
function HeroEditor({ block, updateContent }: any) {
  const [genres, setGenres] = useState<string[]>(block.content.genres || []);
  const [newGenre, setNewGenre] = useState('');

  const addGenre = () => {
    if (newGenre.trim()) {
      const updated = [...genres, newGenre.trim()];
      setGenres(updated);
      updateContent({ genres: updated });
      setNewGenre('');
    }
  };

  const removeGenre = (index: number) => {
    const updated = genres.filter((_, i) => i !== index);
    setGenres(updated);
    updateContent({ genres: updated });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
        <h3 className="font-bold text-[#1F2430] mb-4">Hero Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Artist Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[#F4EEFD] overflow-hidden border-4 border-white shadow-lg">
                <img src={artistPhoto} alt="Artist" className="w-full h-full object-cover" />
              </div>
              <div>
                <button className="px-4 py-2 rounded-lg border-2 border-[#DDDCE7] text-[#7A42E8] font-medium hover:bg-[#F4EEFD] flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </button>
                <p className="text-xs text-[#7A7F8C] mt-1">Recommended: 400x400px</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Artist Name *</label>
            <input
              type="text"
              value={block.content.artistName || ''}
              onChange={(e) => updateContent({ artistName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
              placeholder="Your stage name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Descriptor / Tagline *</label>
            <input
              type="text"
              value={block.content.descriptor || ''}
              onChange={(e) => updateContent({ descriptor: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
              placeholder="Electronic Music Producer & Live Performer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#7A7F8C] mb-2">City / Location</label>
            <input
              type="text"
              value={block.content.city || ''}
              onChange={(e) => updateContent({ city: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
              placeholder="Melbourne"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Genres / Specialties</label>
            <div className="flex gap-2 mb-3 flex-wrap">
              {genres.map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-[#F4EEFD] text-[#7A42E8] text-sm font-medium flex items-center gap-2"
                >
                  {genre}
                  <button onClick={() => removeGenre(index)} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addGenre()}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                placeholder="Add genre (e.g., House, Techno)"
              />
              <button
                onClick={addGenre}
                className="px-4 py-2 rounded-lg bg-[#7A42E8] text-white font-medium hover:bg-[#6816B0]"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Social Proof Line</label>
            <input
              type="text"
              value={block.content.socialProof || ''}
              onChange={(e) => updateContent({ socialProof: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
              placeholder="Trusted by 200+ venues worldwide"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Bio Editor
function BioEditor({ block, updateContent, updateTitle }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
      <h3 className="font-bold text-[#1F2430] mb-4">Bio Content</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Section Title</label>
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => updateTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="About"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Bio Text *</label>
          <textarea
            value={block.content.text || ''}
            onChange={(e) => updateContent({ text: e.target.value })}
            rows={8}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none resize-none"
            placeholder="Tell your story... Share your journey, experience, and what makes you unique."
          />
          <p className="text-xs text-[#7A7F8C] mt-1">
            {(block.content.text || '').length} characters
          </p>
        </div>
      </div>
    </div>
  );
}

// Video Editor
function VideoEditor({ block, updateContent, updateTitle }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
      <h3 className="font-bold text-[#1F2430] mb-4">Featured Video</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Section Title</label>
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => updateTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="Latest Performance Reel"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Video URL *</label>
          <input
            type="url"
            value={block.content.videoUrl || ''}
            onChange={(e) => updateContent({ videoUrl: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="text-xs text-[#7A7F8C] mt-1">Supports YouTube, Vimeo, and direct video links</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Description</label>
          <input
            type="text"
            value={block.content.description || ''}
            onChange={(e) => updateContent({ description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="2026 Festival Season Highlights"
          />
        </div>
      </div>
    </div>
  );
}

// Gallery Editor
function GalleryEditor({ block, updateContent, updateTitle }: any) {
  const items = block.content.items || [];

  const addImage = () => {
    const newItem = {
      id: `img-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1698153782147-07bb858d5232?w=800',
      type: 'image',
      caption: 'New image',
    };
    updateContent({ items: [...items, newItem] });
  };

  const removeImage = (id: string) => {
    updateContent({ items: items.filter((item: any) => item.id !== id) });
  };

  const updateImageCaption = (id: string, caption: string) => {
    updateContent({
      items: items.map((item: any) =>
        item.id === id ? { ...item, caption } : item
      ),
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-[#1F2430]">Gallery Images</h3>
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => updateTitle(e.target.value)}
            className="mt-2 w-full max-w-md px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="Section title (e.g., Gallery)"
          />
        </div>
        <button
          onClick={addImage}
          className="px-4 py-2 rounded-lg bg-[#7A42E8] text-white font-medium hover:bg-[#6816B0] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Image</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {items.map((item: any) => (
          <div key={item.id} className="relative aspect-square rounded-xl bg-[#F4EEFD] overflow-hidden group">
            <ImageWithFallback
              src={item.url}
              alt={item.caption || ''}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <input
                  type="text"
                  value={item.caption || ''}
                  onChange={(e) => updateImageCaption(item.id, e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded bg-white/90 text-[#1F2430]"
                  placeholder="Add caption"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <button
              onClick={() => removeImage(item.id)}
              className="absolute top-2 right-2 p-2 rounded-lg bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-[#7A7F8C]">
          <p>No images yet. Click "Add Image" to get started.</p>
        </div>
      )}
    </div>
  );
}

// Testimonials Editor
function TestimonialsEditor({ block, updateContent, updateTitle }: any) {
  const testimonials = block.content.testimonials || [];

  const addTestimonial = () => {
    const newTestimonial = {
      id: `t-${Date.now()}`,
      quote: '',
      author: '',
      role: '',
      company: '',
    };
    updateContent({ testimonials: [...testimonials, newTestimonial] });
  };

  const removeTestimonial = (id: string) => {
    updateContent({ testimonials: testimonials.filter((t: any) => t.id !== id) });
  };

  const updateTestimonial = (id: string, field: string, value: string) => {
    updateContent({
      testimonials: testimonials.map((t: any) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-[#1F2430]">Testimonials</h3>
            <input
              type="text"
              value={block.title || ''}
              onChange={(e) => updateTitle(e.target.value)}
              className="mt-2 w-full max-w-md px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
              placeholder="Section title (e.g., What Clients Say)"
            />
          </div>
          <button
            onClick={addTestimonial}
            className="px-4 py-2 rounded-lg bg-[#7A42E8] text-white font-medium hover:bg-[#6816B0] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        <div className="space-y-4 mt-6">
          {testimonials.map((testimonial: any) => (
            <div
              key={testimonial.id}
              className="p-4 rounded-xl border-2 border-[#DDDCE7] hover:border-[#B8ACE8] transition-colors space-y-3"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-[#1F2430]">Testimonial</h4>
                <button
                  onClick={() => removeTestimonial(testimonial.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={testimonial.quote}
                onChange={(e) => updateTestimonial(testimonial.id, 'quote', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none resize-none"
                placeholder="Client testimonial quote..."
              />

              <div className="grid md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={testimonial.author}
                  onChange={(e) => updateTestimonial(testimonial.id, 'author', e.target.value)}
                  className="px-3 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                  placeholder="Client name"
                />
                <input
                  type="text"
                  value={testimonial.role}
                  onChange={(e) => updateTestimonial(testimonial.id, 'role', e.target.value)}
                  className="px-3 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                  placeholder="Role"
                />
                <input
                  type="text"
                  value={testimonial.company}
                  onChange={(e) => updateTestimonial(testimonial.id, 'company', e.target.value)}
                  className="px-3 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                  placeholder="Company"
                />
              </div>
            </div>
          ))}
        </div>

        {testimonials.length === 0 && (
          <div className="text-center py-8 text-[#7A7F8C]">
            <p>No testimonials yet. Click "Add" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Brand Logos Editor
function BrandLogosEditor({ block, updateContent, updateTitle }: any) {
  const brands = block.content.brands || [];

  const addBrand = () => {
    const newBrand = {
      id: `brand-${Date.now()}`,
      name: '',
      logo: '',
    };
    updateContent({ brands: [...brands, newBrand] });
  };

  const removeBrand = (id: string) => {
    updateContent({ brands: brands.filter((b: any) => b.id !== id) });
  };

  const updateBrand = (id: string, field: string, value: string) => {
    updateContent({
      brands: brands.map((b: any) =>
        b.id === id ? { ...b, [field]: value } : b
      ),
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-[#1F2430]">Brand Logos</h3>
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => updateTitle(e.target.value)}
            className="mt-2 w-full max-w-md px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="Section title (e.g., Trusted By)"
          />
        </div>
        <button
          onClick={addBrand}
          className="px-4 py-2 rounded-lg bg-[#7A42E8] text-white font-medium hover:bg-[#6816B0] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {brands.map((brand: any) => (
          <div key={brand.id} className="p-4 rounded-xl border-2 border-[#DDDCE7] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-[#1F2430]">Brand</h4>
              <button
                onClick={() => removeBrand(brand.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={brand.name}
              onChange={(e) => updateBrand(brand.id, 'name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
              placeholder="Brand name"
            />
            <input
              type="url"
              value={brand.logo}
              onChange={(e) => updateBrand(brand.id, 'logo', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
              placeholder="Logo URL"
            />
          </div>
        ))}
      </div>

      {brands.length === 0 && (
        <div className="text-center py-8 text-[#7A7F8C]">
          <p>No brands yet. Click "Add Brand" to get started.</p>
        </div>
      )}
    </div>
  );
}

// Packages Editor
function PackagesEditor({ block, updateContent, updateTitle }: any) {
  const packages = block.content.packages || [];

  const addPackage = () => {
    const newPackage = {
      id: `pkg-${Date.now()}`,
      name: '',
      price: '',
      duration: '',
      description: '',
      features: [],
    };
    updateContent({ packages: [...packages, newPackage] });
  };

  const removePackage = (id: string) => {
    updateContent({ packages: packages.filter((p: any) => p.id !== id) });
  };

  const updatePackage = (id: string, field: string, value: any) => {
    updateContent({
      packages: packages.map((p: any) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };

  const addFeature = (packageId: string) => {
    const pkg = packages.find((p: any) => p.id === packageId);
    if (pkg) {
      updatePackage(packageId, 'features', [...(pkg.features || []), '']);
    }
  };

  const updateFeature = (packageId: string, featureIndex: number, value: string) => {
    const pkg = packages.find((p: any) => p.id === packageId);
    if (pkg) {
      const updated = [...pkg.features];
      updated[featureIndex] = value;
      updatePackage(packageId, 'features', updated);
    }
  };

  const removeFeature = (packageId: string, featureIndex: number) => {
    const pkg = packages.find((p: any) => p.id === packageId);
    if (pkg) {
      updatePackage(packageId, 'features', pkg.features.filter((_: any, i: number) => i !== featureIndex));
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-[#1F2430]">Booking Packages</h3>
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => updateTitle(e.target.value)}
            className="mt-2 w-full max-w-md px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="Section title (e.g., Packages)"
          />
        </div>
        <button
          onClick={addPackage}
          className="px-4 py-2 rounded-lg bg-[#7A42E8] text-white font-medium hover:bg-[#6816B0] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Package</span>
        </button>
      </div>

      <div className="space-y-4 mt-6">
        {packages.map((pkg: any) => (
          <div key={pkg.id} className="p-4 rounded-xl border-2 border-[#DDDCE7] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-[#1F2430]">Package</h4>
              <button
                onClick={() => removePackage(pkg.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <input
                type="text"
                value={pkg.name}
                onChange={(e) => updatePackage(pkg.id, 'name', e.target.value)}
                className="px-3 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                placeholder="Package name"
              />
              <input
                type="text"
                value={pkg.price}
                onChange={(e) => updatePackage(pkg.id, 'price', e.target.value)}
                className="px-3 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                placeholder="Price (e.g., $1,500)"
              />
              <input
                type="text"
                value={pkg.duration}
                onChange={(e) => updatePackage(pkg.id, 'duration', e.target.value)}
                className="px-3 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                placeholder="Duration (e.g., 2 hours)"
              />
            </div>

            <textarea
              value={pkg.description}
              onChange={(e) => updatePackage(pkg.id, 'description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none resize-none"
              placeholder="Package description"
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#7A7F8C]">Features</label>
                <button
                  onClick={() => addFeature(pkg.id)}
                  className="text-xs px-2 py-1 rounded bg-[#F4EEFD] text-[#7A42E8] hover:bg-[#E8DEFF]"
                >
                  + Add Feature
                </button>
              </div>
              <div className="space-y-2">
                {(pkg.features || []).map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(pkg.id, index, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none text-sm"
                      placeholder="Feature description"
                    />
                    <button
                      onClick={() => removeFeature(pkg.id, index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-8 text-[#7A7F8C]">
          <p>No packages yet. Click "Add Package" to create one.</p>
        </div>
      )}
    </div>
  );
}

// FAQ Editor
function FAQEditor({ block, updateContent, updateTitle }: any) {
  const items = block.content.items || [];

  const addFAQ = () => {
    const newItem = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
    };
    updateContent({ items: [...items, newItem] });
  };

  const removeFAQ = (id: string) => {
    updateContent({ items: items.filter((item: any) => item.id !== id) });
  };

  const updateFAQ = (id: string, field: string, value: string) => {
    updateContent({
      items: items.map((item: any) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-[#1F2430]">FAQ Items</h3>
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => updateTitle(e.target.value)}
            className="mt-2 w-full max-w-md px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="Section title (e.g., Frequently Asked Questions)"
          />
        </div>
        <button
          onClick={addFAQ}
          className="px-4 py-2 rounded-lg bg-[#7A42E8] text-white font-medium hover:bg-[#6816B0] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      <div className="space-y-4 mt-6">
        {items.map((item: any) => (
          <div key={item.id} className="p-4 rounded-xl border-2 border-[#DDDCE7] space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-[#1F2430]">FAQ Item</h4>
              <button
                onClick={() => removeFAQ(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={item.question}
              onChange={(e) => updateFAQ(item.id, 'question', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
              placeholder="Question"
            />

            <textarea
              value={item.answer}
              onChange={(e) => updateFAQ(item.id, 'answer', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none resize-none"
              placeholder="Answer"
            />
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-[#7A7F8C]">
          <p>No FAQ items yet. Click "Add Question" to create one.</p>
        </div>
      )}
    </div>
  );
}

// Booking CTA Editor
function BookingCTAEditor({ block, updateContent, updateTitle }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
      <h3 className="font-bold text-[#1F2430] mb-4">Booking Call-to-Action</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Headline</label>
          <input
            type="text"
            value={block.content.headline || ''}
            onChange={(e) => updateContent({ headline: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="Ready to Book?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Subheadline</label>
          <input
            type="text"
            value={block.content.subheadline || ''}
            onChange={(e) => updateContent({ subheadline: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="Let's create something amazing together"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Button Text</label>
          <input
            type="text"
            value={block.content.buttonText || ''}
            onChange={(e) => updateContent({ buttonText: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="Book Now"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Secondary Text</label>
          <input
            type="text"
            value={block.content.secondaryText || ''}
            onChange={(e) => updateContent({ secondaryText: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="Usually responds within 2 hours"
          />
        </div>
      </div>
    </div>
  );
}

// Contact Editor
function ContactEditor({ block, updateContent, updateTitle }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
      <h3 className="font-bold text-[#1F2430] mb-4">Contact Information</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Section Title</label>
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => updateTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="Get In Touch"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Email</label>
          <input
            type="email"
            value={block.content.email || ''}
            onChange={(e) => updateContent({ email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="hello@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Phone</label>
          <input
            type="tel"
            value={block.content.phone || ''}
            onChange={(e) => updateContent({ phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#7A7F8C] mb-2">Address</label>
          <textarea
            value={block.content.address || ''}
            onChange={(e) => updateContent({ address: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none resize-none"
            placeholder="123 Main St, City, State, ZIP"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="showContactForm"
            checked={block.content.showContactForm || false}
            onChange={(e) => updateContent({ showContactForm: e.target.checked })}
            className="w-5 h-5 rounded border-2 border-[#DDDCE7] text-[#7A42E8] focus:ring-[#7A42E8]"
          />
          <label htmlFor="showContactForm" className="text-sm font-medium text-[#7A7F8C]">
            Show contact form
          </label>
        </div>
      </div>
    </div>
  );
}