'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiLoader } from 'react-icons/fi';

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CategoryForm({ onSave, initialData = null, isSaving = false }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    status: 'DRAFT',
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Edit mode এ initial data load করো
  useEffect(() => {
    if (initialData) {
      setFormData({
        name:            initialData.name            || '',
        slug:            initialData.slug            || '',
        description:     initialData.description     || '',
        metaTitle:       initialData.metaTitle       || '',
        metaDescription: initialData.metaDescription || '',
        status:          initialData.status          || 'DRAFT',
      });
      setSlugManuallyEdited(true); // edit mode এ slug auto-generate বন্ধ
    }
  }, [initialData]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: slugManuallyEdited ? prev.slug : generateSlug(name),
    }));
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setFormData(prev => ({ ...prev, slug: e.target.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Info */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-[#041442] border-b border-slate-100 pb-3">
          Category Information
        </h2>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="e.g. Technology"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0957ff] focus:ring-1 focus:ring-[#0957ff] text-sm transition"
          />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Slug</label>
          <input
            type="text"
            value={formData.slug}
            onChange={handleSlugChange}
            placeholder="auto-generated from name"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0957ff] focus:ring-1 focus:ring-[#0957ff] text-sm font-mono transition"
          />
          <p className="text-xs text-slate-400">Name দিলে auto-generate হবে। নিজে edit করলে তাই রাখবে।</p>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Short description about this category..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0957ff] focus:ring-1 focus:ring-[#0957ff] text-sm resize-none transition"
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0957ff] focus:ring-1 focus:ring-[#0957ff] text-sm bg-white transition"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-[#041442] border-b border-slate-100 pb-3">
          SEO Settings
        </h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Meta Title</label>
          <input
            type="text"
            name="metaTitle"
            value={formData.metaTitle}
            onChange={handleChange}
            placeholder="SEO title for search engines"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0957ff] focus:ring-1 focus:ring-[#0957ff] text-sm transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Meta Description</label>
          <textarea
            name="metaDescription"
            value={formData.metaDescription}
            onChange={handleChange}
            placeholder="SEO description for search engines"
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0957ff] focus:ring-1 focus:ring-[#0957ff] text-sm resize-none transition"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving || !formData.name.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0957ff] to-[#34bfff] text-white text-sm font-semibold rounded-lg shadow-sm hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
          {isSaving ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}