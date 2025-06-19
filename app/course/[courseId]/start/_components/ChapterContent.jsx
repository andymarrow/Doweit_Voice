import React from 'react';
import YouTube from 'react-youtube';
import ReactMarkdown from 'react-markdown';

const opts = {

  playerVars: {
    autoplay: 0,
  },
};

function ChapterContent({ chapter, content }) {
  // Combine content and video IDs in an interleaved manner.
  const combinedContent = [];
  const contentLength = Math.max(content?.content?.length || 0, content?.videoIds?.length || 0);

  for (let i = 0; i < contentLength; i++) {
    if (content?.content?.[i]) {
      combinedContent.push({ type: 'content', data: content.content[i] });
    }
    if (content?.videoIds?.[i]) {
      combinedContent.push({ type: 'video', data: content.videoIds[i] });
    }
  }

  return (
    <div className='p-10'>
      <h2 className='font-medium text-2xl'>{chapter?.name}</h2>
      <p className='text-gray-500'>{chapter?.about}</p>

      {/* Render interleaved content */}
      <div className='my-6'>
        {combinedContent.map((item, index) => (
          <div key={index} className="my-6">
            {item.type === 'content' && (
              <div className="p-5 bg-sky-50 rounded-lg my-2">
                <h2 className='font-medium text-lg'>{item.data.title}</h2>
                <ReactMarkdown>{item.data.description}</ReactMarkdown>
                {item.data.code && (
                  <div className='rounded-md mt-3 p-4 bg-black text-white'>
                    <pre>
                      <code>{item.data.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
            {item.type === 'video' && (
  <div className="w-full max-w-2xl mx-auto">
    <div className="relative w-full h-0 pb-[56.25%]">
      <div className="absolute top-0 left-0 w-full h-full">
        <YouTube videoId={item.data} opts={{ width: '100%', height: '100%' }} className="w-full h-full" />
      </div>
    </div>
  </div>
)}

          </div>
        ))}
      </div>
    </div>
  );
}

export default ChapterContent;
