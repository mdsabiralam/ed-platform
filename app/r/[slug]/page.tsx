import React from 'react';

// This is a Server Component by default in Next.js App Router
export default async function PublicResultPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Use environment variable for API URL, fallback to localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const apiUrl = `${baseUrl}/api/social/public/${slug}`;

  let data = null;
  let error = null;

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) error = "Result not found.";
      else if (res.status === 400) error = "This link has expired.";
      else error = "Something went wrong.";
    } else {
      data = await res.json();
    }
  } catch (e) {
    error = "Failed to load result.";
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-100">
         <div className="animate-pulse text-lg">Loading...</div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Congratulations!</h2>
        <h1 className="text-4xl font-bold text-blue-600 mb-6">{data.firstName}</h1>

        <div className="space-y-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Class</p>
                <p className="text-xl font-semibold text-gray-800">{data.className}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Rank</p>
                    <p className="text-2xl font-bold text-yellow-600">{data.rank}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Score</p>
                    <p className="text-2xl font-bold text-green-600">{data.percentage}</p>
                </div>
            </div>

            <div>
                <p className="text-sm text-gray-500">School</p>
                <p className="text-lg font-medium text-gray-700">{data.schoolName}</p>
            </div>
        </div>

        <div className="text-xs text-gray-400 mt-8">
            Verified Result via EdPlatform
        </div>
      </div>
    </div>
  );
}
