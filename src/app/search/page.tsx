"use client";

import { useState, useCallback, useEffect } from "react";
import { SearchInput } from "@/components/shared/search-input";
import { PostCard } from "@/components/post/post-card";
import { EmptyState } from "@/components/shared/empty-state";
import { searchPosts } from "@/lib/actions/search-actions";
import { motion, AnimatePresence } from "framer-motion";

const POPULAR_SUGGESTIONS = [
  "냉면",
  "갈비",
  "떡볶이",
  "곱창",
  "을지로",
  "마포",
  "김치찌개",
  "삼겹살",
];

const RECENT_SEARCHES_KEY = "dokbo_recent_searches";

type Post = React.ComponentProps<typeof PostCard>["post"];

export default function SearchPage() {
  const [results, setResults] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [
      term,
      ...recentSearches.filter((s) => s !== term),
    ].slice(0, 10);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const { data } = await searchPosts(searchQuery);
    setResults(data as Post[]);
    setIsSearching(false);
    saveRecentSearch(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <SearchInput onSearch={handleSearch} />

      {!query && (
        <div className="space-y-6">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#1A1A1A]/70">
                  최근 검색
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-[#1A1A1A]/40 hover:text-[#1A1A1A]/60"
                >
                  전체 삭제
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSuggestionClick(term)}
                    className="px-3 py-1.5 rounded-full bg-white border border-orange-100 text-sm text-[#1A1A1A]/70 hover:bg-orange-50 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-[#1A1A1A]/70 mb-2">
              인기 검색어
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 rounded-full bg-orange-50 text-sm text-[#E54D2E] font-medium hover:bg-orange-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isSearching && (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-[#E54D2E] border-t-transparent rounded-full" />
        </div>
      )}

      {query && !isSearching && (
        <AnimatePresence mode="wait">
          {results.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                message={`"${query}" 검색 결과가 없어요`}
                sub="다른 검색어로 시도해보세요"
              />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <p className="text-xs text-[#1A1A1A]/40">
                {results.length}개의 결과
              </p>
              {results.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
