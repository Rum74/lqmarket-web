import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BLOG_POSTS } from '../../data/blogData';
import { BlogPostItem } from '../../types';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ChevronLeft,
  Share2,
  Tag,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';

export const BlogView: React.FC = () => {
  const { accounts, setSelectedAccountId, setCurrentView } = useApp();
  const [selectedPost, setSelectedPost] = useState<BlogPostItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'meta' | 'security' | 'guide' | 'review'>('all');

  const filteredPosts = BLOG_POSTS.filter(post =>
    selectedCategory === 'all' ? true : post.category === selectedCategory
  );

  // If a post is selected, render the detail article view
  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <button
          onClick={() => setSelectedPost(null)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Quay Lại Danh Sách Bài Viết</span>
        </button>

        <article className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative aspect-[21/9] bg-slate-950 overflow-hidden">
            <img
              src={selectedPost.coverImage}
              alt={selectedPost.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-amber-500 text-slate-950">
                {selectedPost.category === 'meta'
                  ? 'Meta Tướng'
                  : selectedPost.category === 'security'
                  ? 'Bảo Mật An Toàn'
                  : selectedPost.category === 'review'
                  ? 'Review Acc'
                  : 'Cẩm Nang'}
              </span>
              <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
                {selectedPost.title}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-slate-300 leading-relaxed text-sm">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pb-4 border-b border-slate-800">
              <span className="flex items-center gap-1">
                <User size={13} className="text-amber-400" /> {selectedPost.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-amber-400" /> {selectedPost.publishedAt}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-amber-400" /> {selectedPost.readTime}
              </span>
            </div>

            {/* Article Content */}
            <div className="space-y-4 whitespace-pre-line leading-relaxed text-slate-300">
              {selectedPost.content}
            </div>

            {/* Account recommendation CTA */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Khám Phá Danh Sách Acc Liên Quân Chất Lượng Cao</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Hơn 100+ tài khoản trắng thông tin, full tướng, giá tốt đang chờ bạn tại chợ.
                </p>
              </div>

              <button
                onClick={() => setCurrentView('accounts')}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Xem Ngay Tại Chợ</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          <BookOpen size={13} />
          <span>CẨM NANG & TIN TỨC LIÊN QUÂN</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Kiến Thức Mua Acc & Meta Game Chuẩn Nhất
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Tổng hợp kinh nghiệm chọn mua acc trắng thông tin an toàn, phân tích meta tướng leo rank và bảng ngọc tối ưu từ các cao thủ Liên Quân.
        </p>

        {/* Category Pills */}
        <div className="flex gap-2 pt-2 overflow-x-auto">
          {[
            { id: 'all', label: 'Tất Cả Bài Viết' },
            { id: 'review', label: 'Review Acc' },
            { id: 'security', label: 'Bảo Mật Acc' },
            { id: 'meta', label: 'Meta Tướng' },
            { id: 'guide', label: 'Hướng Dẫn' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map(post => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30">
                    {post.category === 'meta'
                      ? 'Meta'
                      : post.category === 'security'
                      ? 'Bảo Mật'
                      : post.category === 'review'
                      ? 'Review Acc'
                      : 'Cẩm Nang'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {post.summary}
                </p>
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-amber-400" /> {post.publishedAt}
              </span>
              <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Đọc thêm</span>
                <ArrowRight size={13} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
