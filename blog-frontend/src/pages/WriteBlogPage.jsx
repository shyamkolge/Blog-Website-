import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createBlogAPI, getAllCategoriesAPI } from "../api/blog.api";
import useAuth from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import {
  FiEdit3,
  FiImage,
  FiX,
  FiSave,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiArrowLeft,
  FiAlertCircle,
  FiBold,
  FiItalic,
  FiUnderline,
  FiLink,
  FiList,
} from "react-icons/fi";
import { useToast } from "../context/ToastContext";

const WriteBlogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    tittle: "",
    content: "",
    slug: "",
    category: "",
    visibility: "public",
    featureImages: null,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategoriesAPI();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Auto-generate slug from title
    if (name === "tittle") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({
        ...prev,
        slug: slug,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFormData({
        ...formData,
        featureImages: file,
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      featureImages: null,
    });
    setImagePreview(null);
  };

  // Strip HTML tags for character count and validation
  const getTextContent = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const validateForm = () => {
    if (!formData.tittle.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (formData.tittle.length < 5) {
      toast.error("Title must be at least 5 characters");
      return false;
    }
    const textContent = getTextContent(formData.content);
    if (!textContent.trim()) {
      toast.error("Content is required");
      return false;
    }
    if (textContent.length < 50) {
      toast.error("Content must be at least 50 characters");
      return false;
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return false;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return false;
    }
    return true;
  };

  // Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 dark:text-blue-400 underline cursor-pointer",
        },
      }),
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({
        ...prev,
        content: editor.getHTML(),
      }));
    },
    editorProps: {
      attributes: {
        class: "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  // Update editor content when formData.content changes externally (but not from editor)
  useEffect(() => {
    if (editor && formData.content !== editor.getHTML()) {
      // Only update if content changed externally
      const isExternalChange = !editor.isDestroyed && editor.getHTML() !== formData.content;
      if (isExternalChange) {
        editor.commands.setContent(formData.content, false);
      }
    }
  }, [formData.content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("tittle", formData.tittle);
      form.append("content", formData.content);
      form.append("slug", formData.slug);
      form.append("category", formData.category);
      form.append("visibility", formData.visibility);

      if (formData.featureImages) {
        form.append("featureImages", formData.featureImages);
      }

      const response = await createBlogAPI(form);

      if (response.status === "success" || response.success) {
        toast.success("Blog created successfully!");
        setTimeout(() => {
          navigate("/blog/" + response.data.slug);
        }, 1500);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to create blog. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (!editor) {
    return (
      <section className="w-full h-full dark:bg-gray-900">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 px-4 sm:px-6 lg:px-8 py-8 transition-colors w-full">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading editor...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all duration-200 mb-6 group"
        >
          <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-block mb-4">
            <span className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              New Post
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Write Your Story
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Share your thoughts, ideas, and experiences with the world
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label
                htmlFor="tittle"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="tittle"
                name="tittle"
                type="text"
                value={formData.tittle}
                onChange={handleChange}
                placeholder="Enter an engaging title..."
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 text-xl font-medium"
                disabled={loading}
                required
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Make it catchy and descriptive
                </p>
                <p className={`text-xs font-medium ${
                  formData.tittle.length > 200 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formData.tittle.length}/200
                </p>
              </div>
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
              >
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all">
                <span className="text-gray-500 dark:text-gray-400 text-sm font-mono whitespace-nowrap">
                  /blog/
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="your-blog-url-slug"
                  className="flex-1 px-2 py-2 bg-transparent border-0 focus:outline-none dark:text-white text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 font-mono text-sm"
                  disabled={loading}
                  required
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <FiEdit3 className="w-3 h-3 mr-1" />
                Auto-generated from title. You can customize it.
              </p>
            </div>

            {/* Content - Rich Text Editor */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
              >
                Content <span className="text-red-500">*</span>
              </label>
              
              {/* Toolbar */}
              <div className="border-2 border-b-0 border-gray-200 dark:border-gray-700 rounded-t-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-3 flex flex-wrap items-center gap-1.5">
                {/* Text Formatting */}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  disabled={!editor.can().chain().focus().toggleBold().run() || loading}
                  className={`p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 ${
                    editor.isActive("bold") 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  <FiBold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  disabled={!editor.can().chain().focus().toggleItalic().run() || loading}
                  className={`p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 ${
                    editor.isActive("italic") 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  <FiItalic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  disabled={!editor.can().chain().focus().toggleStrike().run() || loading}
                  className={`p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 ${
                    editor.isActive("strike") 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Strikethrough"
                >
                  <span className="text-sm font-bold line-through">S</span>
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                {/* Headings */}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 text-xs font-bold ${
                    editor.isActive("heading", { level: 1 }) 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 text-xs font-bold ${
                    editor.isActive("heading", { level: 2 }) 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 text-xs font-bold ${
                    editor.isActive("heading", { level: 3 }) 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Heading 3"
                >
                  H3
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                {/* Lists */}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  disabled={loading}
                  className={`p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 ${
                    editor.isActive("bulletList") 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Bullet List"
                >
                  <FiList className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  disabled={loading}
                  className={`px-3 py-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 text-sm font-semibold ${
                    editor.isActive("orderedList") 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Numbered List"
                >
                  1.
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  disabled={loading}
                  className={`p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 text-lg ${
                    editor.isActive("blockquote") 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Blockquote"
                >
                  "
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                {/* Links and Images */}
                <button
                  type="button"
                  onClick={setLink}
                  disabled={loading}
                  className={`p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 ${
                    editor.isActive("link") 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Add Link"
                >
                  <FiLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={addImage}
                  disabled={loading}
                  className="p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 text-gray-600 dark:text-gray-400"
                  title="Add Image"
                >
                  <FiImage className="w-4 h-4" />
                </button>

                {/* Text Alignment */}
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1 ml-auto"></div>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign("left").run()}
                  disabled={loading}
                  className={`p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 ${
                    editor.isActive({ textAlign: "left" }) 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Align Left"
                >
                  ⬅
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign("center").run()}
                  disabled={loading}
                  className={`p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 ${
                    editor.isActive({ textAlign: "center" }) 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Align Center"
                >
                  ⬌
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign("right").run()}
                  disabled={loading}
                  className={`p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 ${
                    editor.isActive({ textAlign: "right" }) 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Align Right"
                >
                  ➡
                </button>

                {/* Clear Formatting */}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                  disabled={loading}
                  className="px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Clear Formatting"
                >
                  Clear
                </button>
              </div>

              {/* Editor Content */}
              <div className="border-2 border-t-0 border-gray-200 dark:border-gray-700 rounded-b-xl bg-white dark:bg-gray-800 min-h-[400px] shadow-inner">
                <EditorContent editor={editor} />
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Start writing your story...
                </p>
                <p className={`text-xs font-medium ${
                  getTextContent(formData.content).length < 50 
                    ? 'text-orange-500 dark:text-orange-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {getTextContent(formData.content).length} characters (minimum 50)
                </p>
              </div>
            </div>

            {/* Category and Visibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer font-medium"
                    disabled={loading}
                    required
                  >
                    <option value="">Choose a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label
                  htmlFor="visibility"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
                >
                  Visibility
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === "public"}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 accent-blue-600 dark:accent-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                    />
                    <div className={`flex items-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      formData.visibility === "public" 
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                      <FiEye className={`w-5 h-5 ${formData.visibility === "public" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                      <span className={`text-sm font-medium ${formData.visibility === "public" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                        Public
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === "private"}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 accent-blue-600 dark:accent-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                    />
                    <div className={`flex items-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      formData.visibility === "private" 
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                      <FiEyeOff className={`w-5 h-5 ${formData.visibility === "private" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                      <span className={`text-sm font-medium ${formData.visibility === "private" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                        Private
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Feature Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Feature Image <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
              </label>
              {imagePreview ? (
                <div className="relative group">
                  <div className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                    title="Remove image"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <FiImage className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    name="featureImages"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin h-5 w-5" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    <span>Publish Story</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default WriteBlogPage;
