'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Screenshot {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  tags: string[];
  createdAt: string;
}

interface Stats {
  total: number;
  byTag: { tag: string; count: number }[];
  byMonth: { month: string; count: number }[];
}

export default function HomePage() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedTag, startDate, endDate]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTag) params.append('tag', selectedTag);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [screenshotsRes, statsRes, tagsRes] = await Promise.all([
        fetch(`/api/screenshots?${params}`),
        fetch('/api/stats'),
        fetch('/api/tags'),
      ]);

      if (screenshotsRes.ok) {
        const data = await screenshotsRes.json();
        setScreenshots(data.screenshots);
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (tagsRes.ok) {
        setTags(await tagsRes.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-8">
      {/* Stats Dashboard */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-600">Total Screenshots</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{stats.byTag.length}</div>
              <div className="text-sm text-green-600">Unique Tags</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {stats.byMonth[0]?.count || 0}
              </div>
              <div className="text-sm text-purple-600">This Month</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {stats.byTag.slice(0, 1)[0]?.count || 0}
              </div>
              <div className="text-sm text-orange-600">Top Tag Count</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 min-w-[150px]"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          {(selectedTag || startDate || endDate) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedTag('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : screenshots.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No screenshots found</div>
          <div className="text-gray-400 text-sm mt-2">
            Upload screenshots to see them here
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {screenshots.map((screenshot) => (
            <Link
              key={screenshot.id}
              href={`/screenshots/${screenshot.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={screenshot.url}
                  alt={screenshot.originalName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-3">
                <div className="font-medium text-sm truncate" title={screenshot.originalName}>
                  {screenshot.originalName}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>{formatSize(screenshot.size)}</span>
                  <span>{formatDate(screenshot.createdAt)}</span>
                </div>
                {screenshot.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {screenshot.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {screenshot.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{screenshot.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
