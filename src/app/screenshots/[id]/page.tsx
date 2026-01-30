'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

export default function ScreenshotDetailPage() {
  const params = useParams();
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchScreenshot() {
      try {
        const res = await fetch(`/api/screenshots/${params.id}`);
        if (!res.ok) {
          throw new Error('Screenshot not found');
        }
        setScreenshot(await res.json());
      } catch (err) {
        setError('Failed to load screenshot');
      }
      setLoading(false);
    }

    if (params.id) {
      fetchScreenshot();
    }
  }, [params.id]);

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !screenshot) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500">{error}</div>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Gallery
      </Link>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="max-h-[70vh] bg-gray-100 flex items-center justify-center p-4">
          <img
            src={screenshot.url}
            alt={screenshot.originalName}
            className="max-w-full max-h-[65vh] object-contain rounded"
          />
        </div>

        <div className="p-6">
          <h1 className="text-xl font-semibold mb-4">{screenshot.originalName}</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Size</div>
              <div className="font-medium">{formatSize(screenshot.size)}</div>
            </div>
            <div>
              <div className="text-gray-500">Type</div>
              <div className="font-medium">{screenshot.mimeType}</div>
            </div>
            <div>
              <div className="text-gray-500">Created</div>
              <div className="font-medium">{formatDate(screenshot.createdAt)}</div>
            </div>
            <div>
              <div className="text-gray-500">Filename</div>
              <div className="font-medium truncate" title={screenshot.filename}>
                {screenshot.filename}
              </div>
            </div>
          </div>

          {screenshot.tags.length > 0 && (
            <div className="mt-6">
              <div className="text-gray-500 text-sm mb-2">Tags</div>
              <div className="flex flex-wrap gap-2">
                {screenshot.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/?tag=${encodeURIComponent(tag)}`}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t flex gap-4">
            <a
              href={screenshot.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Open Original
            </a>
            <a
              href={screenshot.url}
              download={screenshot.originalName}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
