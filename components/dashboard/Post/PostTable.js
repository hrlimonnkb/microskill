'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiEdit, FiImage, FiExternalLink, FiX } from 'react-icons/fi';
const IMG_URL = "http://localhost:8006";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#041442]">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const isPublished = status === 'PUBLISHED';
  return (
    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${isPublished ? 'bg-orange-100 text-brand-orange' : 'bg-sky-100 text-[#00a5f2]'}`}>
      {status}
    </span>
  );
};

const PlaceholderImage = () => (
  <div className="w-16 h-10 rounded-md bg-slate-200 flex items-center justify-center">
    <FiImage className="w-5 h-5 text-slate-500" />
  </div>
);

export function PostTable({ 
  posts, 
  onDeletePost,
  selectedPostIds,
  onSelectOne,
  currentPage,
  itemsPerPage,
  baseViewPath,
  baseEditPath
}) {
  const [postToDelete, setPostToDelete] = useState(null);
  
  const handleDeleteClick = (post) => setPostToDelete(post);
  const confirmDelete = () => {
    if (postToDelete) {
      onDeletePost(postToDelete.id);
      setPostToDelete(null);
    }
  };

  return (
    <>
      {posts.map((post, index) => (
        <tr key={post.id} className="bg-white border-b border-[#eef2f7] hover:bg-gray-50">
          <td className="w-4 p-4">
            <input 
              type="checkbox"
              className="custom-checkbox"
              checked={selectedPostIds.includes(post.id)}
              onChange={(e) => onSelectOne(e, post.id)}
            />
          </td>
          <td className="px-6 py-4 font-semibold text-slate-700">
            {(currentPage - 1) * itemsPerPage + index + 1}
          </td>
          <td className="px-6 py-4">
            {post.featuredImage ? (
              <Image src={`${IMG_URL}${post.featuredImage}`} alt={post.title} width={64} height={40} className="rounded-md object-cover"/>
            ) : (
              <PlaceholderImage />
            )}
          </td>
          <th scope="row" className="px-6 py-4 font-bold text-slate-900">{post.title}</th>
          <td className="px-6 py-4"><StatusBadge status={post.status} /></td>
          <td className="px-6 py-4">
            <div className="flex items-center justify-center gap-2">
              <Link 
                href={`${baseViewPath}/${post.slug}`} 
                className="p-2 text-green-600 bg-green-100 hover:text-white hover:bg-green-600 rounded-full transition-colors cursor-pointer" 
                title="View Live Post"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiExternalLink className="w-4 h-4" />
              </Link>
              <Link href={`${baseEditPath}/${post.id}/edit`} className="p-2 text-[#00a5f2] bg-sky-100 hover:text-white hover:bg-[#00a5f2] rounded-full transition-colors cursor-pointer" title="Edit Post">
                <FiEdit className="w-4 h-4" />
              </Link>
              <button onClick={() => handleDeleteClick(post)} className="p-2 text-brand-orange bg-orange-100 hover:text-white hover:bg-brand-orange rounded-full transition-colors cursor-pointer" title="Delete Post">
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      ))}

      <Modal isOpen={!!postToDelete} onClose={() => setPostToDelete(null)} title="Confirm Post Deletion">
        <div>
          <p>Are you sure you want to delete the post <span className="font-bold"> {postToDelete?.title} </span>?</p>
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer" onClick={() => setPostToDelete(null)}>Cancel</button>
            <button type="button" className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md cursor-pointer" onClick={confirmDelete}>Delete</button>
          </div>
        </div>
      </Modal>
    </>
  );
}