'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiUpload, FiX } from 'react-icons/fi';
import { Editor } from '@tinymce/tinymce-react';

export function PostForm({ onSave, categoryApiEndpoint, redirectPath, initialData = null, isSaving = false }) {
  const router = useRouter();
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    status: 'DRAFT',
    categoryId: '',
    content: '',
  });

  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title:           initialData.title           || '',
        slug:            initialData.slug            || '',
        excerpt:         initialData.excerpt         || '',
        featuredImage:   initialData.featuredImage   || '',
        metaTitle:       initialData.metaTitle       || '',
        metaDescription: initialData.metaDescription || '',
        status:          initialData.status          || 'DRAFT',
        categoryId:      initialData.categoryId      ? String(initialData.categoryId) : '',
        content:         initialData.content         || '',
      });
      if (initialData.featuredImage) {
        setImagePreview(initialData.featuredImage);
      }
    }
  }, [initialData]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const res = await fetch(categoryApiEndpoint);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.categories || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    if (categoryApiEndpoint) fetchCategories();
  }, [categoryApiEndpoint]);

  // Auto-generate slug from title (only when creating)
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      ...(!initialData && {
        slug: title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, ''),
      }),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ── Featured image upload (sidebar) ───────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, featuredImage: 'Only JPG, PNG, WEBP, or GIF allowed.' }));
      return;
    }

    try {
      setIsUploadingImage(true);
      const fd = new FormData();
      fd.append('featuredImage', file);

     const token = localStorage.getItem('authToken'); // Adjust if your auth token is stored differently
const res = await fetch('https://api.microskill.com.bd/api/post/upload-image', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: fd,
});
      if (!res.ok) throw new Error('Image upload failed.');

      const data = await res.json();
      setFormData((prev) => ({ ...prev, featuredImage: data.imageUrl }));
      setImagePreview(data.imageUrl);
      setErrors((prev) => ({ ...prev, featuredImage: '' }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, featuredImage: err.message }));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, featuredImage: '' }));
    setImagePreview('');
  };

  // ── TinyMCE image upload handler ──────────────────────────────
  // Called for: toolbar insert, drag-drop, paste
  const handleEditorImageUpload = async (blobInfo) => {
    const fd = new FormData();
    fd.append('featuredImage', blobInfo.blob(), blobInfo.filename() || 'image.png');

 const token = localStorage.getItem('authToken'); // Adjust if your auth token is stored differently
const res = await fetch('https://api.microskill.com.bd/api/post/upload-image', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: fd,
});

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Image upload failed');
    }

    const data = await res.json();
    return data.imageUrl; // TinyMCE replaces the blob src with this URL
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required.';
    if (!formData.slug.trim())  newErrors.slug  = 'Slug is required.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const content = editorRef.current ? editorRef.current.getContent() : formData.content;

    const payload = {
      ...formData,
      content,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
    };

    onSave(payload);
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-lg border outline-none text-sm transition-colors ${
      errors[field]
        ? 'border-red-400 focus:ring-1 focus:ring-red-400'
        : 'border-slate-300 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-black">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left / Main Column ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Post Details */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#041442]">Post Details</h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Enter post title..."
                className={inputClass('title')}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="post-url-slug"
                className={inputClass('slug')}
              />
              {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                placeholder="Short summary of the post..."
                className={inputClass('excerpt')}
              />
            </div>

            {/* Content — TinyMCE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
              <div className={`rounded-lg border overflow-hidden ${errors.content ? 'border-red-400' : 'border-slate-300'}`}>
                <Editor
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  initialValue={formData.content}
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  init={{
                    height: 520,
                    menubar: true,
                    branding: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount',
                      'emoticons', 'codesample',
                    ],
                    toolbar:
                      'undo redo | blocks | bold italic underline strikethrough | ' +
                      'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
                      'bullist numlist outdent indent | link image media table | ' +
                      'codesample code | emoticons charmap | removeformat | fullscreen help',
                    content_style: `
                      body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; font-size: 14px; line-height: 1.7; color: #334155; padding: 12px 16px; }
                      p { margin: 0 0 1em 0; }
                      h1,h2,h3,h4,h5,h6 { color: #041442; font-weight: 700; margin: 1.25em 0 0.5em; }
                    `,
                    // ── Image handling ────────────────────────────
                    // Allows pasting images directly into the editor
                    paste_data_images: true,
                    // Automatically upload blob images (paste / drag-drop) via handler below
                    automatic_uploads: true,
                    file_picker_types: 'image',
                    // All three cases (toolbar insert, drag-drop, paste) go through this handler
                    images_upload_handler: handleEditorImageUpload,
                  }}
                />
              </div>
              {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#041442]">SEO Settings</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                placeholder="SEO title (defaults to post title)"
                className={inputClass('metaTitle')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                rows={3}
                placeholder="SEO description..."
                className={inputClass('metaDescription')}
              />
            </div>
          </div>
        </div>

        {/* ── Right / Sidebar Column ─────────────────────────────── */}
        <div className="space-y-6">

        

          {/* Category */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#041442]">Category</h2>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={isCategoriesLoading}
              className={inputClass('categoryId')}
            >
              <option value="">{isCategoriesLoading ? 'Loading...' : '— Select category —'}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#041442]">Featured Image</h2>

            {imagePreview ? (
              <div className="relative group">
                <img
    src={
      imagePreview.startsWith('data:') || imagePreview.startsWith('blob:')
        ? imagePreview 
        : `https://api.microskill.com.bd${imagePreview.startsWith('/') ? '' : '/'}${imagePreview}`
    }
    alt="Featured"
    className="w-full h-48 object-cover rounded-lg border border-slate-200"
  />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove image"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-brand-orange hover:bg-orange-50 transition-colors">
                <FiUpload className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500">
                  {isUploadingImage ? 'Uploading...' : 'Click to upload image'}
                </span>
                <span className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP, GIF</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="hidden"
                />
              </label>
            )}

            {/* Manual URL input */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Or paste image URL</label>
              <input
                type="text"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={(e) => {
                  handleChange(e);
                  setImagePreview(e.target.value);
                }}
                placeholder="https://example.com/image.jpg"
                className={`${inputClass('featuredImage')} text-xs`}
              />
            </div>

            {errors.featuredImage && (
              <p className="text-xs text-red-500">{errors.featuredImage}</p>
            )}
          </div>
            {/* Publish */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#041442]">Publish</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass('status')}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push(redirectPath)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
               className="px-4 py-2.5 flex items-center gap-2 bg-gradient-to-r from-[#f97316] to-[#fb923c] text-sm text-white font-semibold rounded-lg shadow-md hover:shadow-orange-200/50 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <FiSave className="w-4 h-4" />
                {isSaving ? 'Saving...' : initialData ? 'Update Post' : 'Save Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}