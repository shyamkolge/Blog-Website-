import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiClock, FiUser, FiHeart, FiMessageCircle, FiEye } from 'react-icons/fi'

const BlogCard = ({ 
  blog, 
  isLiked = false, 
  onLikeClick,
  showFullContent = false 
}) => {
  const navigate = useNavigate()

  // Strip HTML tags and extract plain text
  const stripHtmlTags = (html) => {
    if (!html) return ''
    if (typeof document === 'undefined') {
      return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    }
    const div = document.createElement('div')
    div.innerHTML = html
    const text = div.textContent || div.innerText || ''
    return text.trim()
  }

  const truncateContent = (content, maxLength = 200) => {
    if (!content) return ''
    const plainText = stripHtmlTags(content)
    if (plainText.length <= maxLength) return plainText
    // Try to cut at a word boundary
    const truncated = plainText.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + '...'
    }
    return truncated + '...'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getReadingTime = (content) => {
    if (!content) return '1 min read'
    const plainText = stripHtmlTags(content)
    const wordsPerMinute = 200
    const wordCount = plainText.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    return `${readingTime} min read`
  }

  const handleCardClick = () => {
    navigate(`/blog/${blog.slug}`)
  }

  const handleCommentsClick = (e) => {
    e.stopPropagation()
    navigate(`/blog/${blog.slug}#comments`)
  }

  const handleLikeClick = (e) => {
    e.stopPropagation()
    if (onLikeClick) {
      onLikeClick(blog._id)
    }
  }

  return (
    <article
      className="border-b border-gray-200 dark:border-gray-800 pb-8 last:border-b-0 cursor-pointer hover:opacity-90 transition-opacity"
      onClick={handleCardClick}
    >
      <div className={`flex flex-col ${blog.featureImages ? 'md:flex-row' : ''} gap-6 w-full`}>
        {/* Blog Content */}
        <div className={`${blog.featureImages ? 'flex-1 min-w-0' : 'w-full'} overflow-hidden`}>
          {/* Author & Date */}
          <div className="flex items-center space-x-3 mb-3 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            {blog.author?.profilePhoto ? (
              <img
                src={blog.author.profilePhoto}
                alt={blog.author.username}
                className="w-6 h-6 rounded-full shrink-0 object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0">
                <FiUser className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
            )}
            <span className="font-medium whitespace-nowrap">
              {blog.author?.firstName} {blog.author?.lastName}
            </span>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <span className="flex items-center space-x-1 whitespace-nowrap">
              <FiClock className="w-4 h-4" />
              <span>{formatDate(blog.createdAt)}</span>
            </span>
            <span className="hidden sm:inline-flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <span className="text-gray-400 dark:text-gray-600 mx-1">•</span>
              <span>{getReadingTime(blog.content)}</span>
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 hover:text-gray-700 dark:hover:text-gray-300 transition break-words line-clamp-2">
            {blog.tittle}
          </h2>

          {/* Content Preview */}
          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed break-words line-clamp-3">
            {showFullContent ? stripHtmlTags(blog.content) : truncateContent(blog.content)}
          </p>

          {/* Category & Stats */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              {blog.category && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 whitespace-nowrap text-xs font-medium">
                  {blog.category.name || 'Uncategorized'}
                </span>
              )}

              <div className="flex items-center space-x-4 flex-wrap">
                <button
                  onClick={handleLikeClick}
                  className={`flex items-center space-x-1 whitespace-nowrap transition-colors ${
                    isLiked ? 'text-red-600 dark:text-red-400' : 'hover:text-red-600 dark:hover:text-red-400'
                  }`}
                  title="Likes"
                >
                  <FiHeart className={`w-4 h-4 shrink-0 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{blog.likeCount || 0}</span>
                </button>
                <button
                  onClick={handleCommentsClick}
                  className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition whitespace-nowrap"
                  title="View comments"
                >
                  <FiMessageCircle className="w-4 h-4 shrink-0" />
                  <span>{blog.commentCount || 0}</span>
                </button>
                <span className="flex items-center space-x-1 whitespace-nowrap" title="Views">
                  <FiEye className="w-4 h-4 shrink-0" />
                  <span>{blog.readCount || 0}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Image */}
        {blog.featureImages && (
          <div className="md:w-48 lg:w-64 shrink-0">
            <img
              src={blog.featureImages}
              alt={blog.tittle}
              className="w-full h-48 md:h-full object-cover rounded-lg"
            />
          </div>
        )}
      </div>
    </article>
  )
}

export default BlogCard

