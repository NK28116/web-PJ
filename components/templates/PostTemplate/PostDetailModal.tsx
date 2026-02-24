import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/organisms/Modal';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import type { Post } from './PostTemplate';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onStatusChange?: (postId: number) => void;
  onUpdate: (post: Post) => void;
  onDelete: (postId: number) => void;
  formatDate?: (dateString: string) => string;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  isOpen,
  onClose,
  post,
  onStatusChange,
  onUpdate,
  onDelete,
  formatDate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // IME不具合対策: テキスト入力は個別Stateで管理し、onChange時のオブジェクト再生成を避ける
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // モーダルが閉じる際に編集状態をリセット
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setEditingPost(null);
      setPreviewImage(null);
      setShowDeleteConfirm(false);
      setShowCancelConfirm(false);
      setEditTitle('');
      setEditContent('');
      setEditTags('');
    }
  }, [isOpen]);

  if (!post) return null;

  const isHidden = post.status === '非表示';
  const displayDate = formatDate ? formatDate(post.date) : post.date;

  const handleStartEdit = () => {
    setEditingPost({ ...post });
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditTags(post.tags);
    setPreviewImage(null);
    setIsEditing(true);
  };

  // 編集モード中はキャンセル確認を表示、そうでなければ閉じる
  const handleModalClose = () => {
    if (isEditing) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  // ×ボタン: 編集モード中は削除確認、そうでなければ閉じる
  const handleCloseButton = () => {
    if (isEditing) {
      setShowDeleteConfirm(true);
    } else {
      onClose();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingPost) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setEditingPost({ ...editingPost, imageUrl: url });
    }
  };

  const handleSave = () => {
    if (editingPost) {
      // 保存時に個別Stateの値をマージ
      onUpdate({ ...editingPost, title: editTitle, content: editContent, tags: editTags });
      setIsEditing(false);
      setPreviewImage(null);
    }
  };

  // 編集内容を非表示ステータスで保存
  const handleSaveHidden = () => {
    if (editingPost) {
      // 保存時に個別Stateの値をマージし、ステータスを非表示に変更
      onUpdate({ ...editingPost, title: editTitle, content: editContent, tags: editTags, status: '非表示' });
      setIsEditing(false);
      setPreviewImage(null);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(post.id);
    setShowDeleteConfirm(false);
  };

  const handleConfirmCancel = () => {
    setIsEditing(false);
    setEditingPost(null);
    setPreviewImage(null);
    setShowCancelConfirm(false);
    setEditTitle('');
    setEditContent('');
    setEditTags('');
  };

  const handleStatusToggle = () => {
    if (onStatusChange) {
      onStatusChange(post.id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
      <div className="flex flex-col max-h-[90vh] relative">

        {/* 削除確認オーバーレイ */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center gap-4 p-6 rounded-lg">
            <Text className="font-bold text-base text-center">本当にこの投稿を削除しますか？</Text>
            <Text className="text-sm text-gray-600 text-center">この操作は取り消せません。</Text>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-[#C4C4C4] rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-bold hover:bg-red-600 transition-colors"
              >
                削除する
              </Button>
            </div>
          </div>
        )}

        {/* 編集キャンセル確認オーバーレイ */}
        {showCancelConfirm && (
          <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center gap-4 p-6 rounded-lg">
            <Text className="font-bold text-base text-center">編集をキャンセルしますか？</Text>
            <Text className="text-sm text-gray-600 text-center">入力した内容は破棄されます。</Text>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-[#C4C4C4] rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                いいえ
              </Button>
              <Button
                onClick={handleConfirmCancel}
                className="px-4 py-2 border border-[#00A48D] text-[#00A48D] rounded-md text-sm font-bold hover:bg-[#00A48D]/10 transition-colors"
              >
                はい
              </Button>
            </div>
          </div>
        )}

        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <Text className="font-bold text-sm">{post.username}</Text>
            {!isEditing && (
              <div
                className={`px-2 py-[2px] border text-[10px] rounded ${
                  isHidden
                    ? 'border-gray-500 text-gray-500 bg-gray-100'
                    : 'border-[#00A48D] text-[#00A48D] bg-white'
                }`}
              >
                {post.status}
              </div>
            )}
          </div>
          {isEditing ? (
            /* 編集モード: ゴミ箱アイコン（赤）で削除機能を明示 */
            <Button onClick={handleCloseButton} className="p-1 hover:bg-red-50 rounded-full transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6L18.2 20C18.0888 20.6143 17.5543 21 16.9333 21H7.0667C6.44565 21 5.91118 20.6143 5.8 20L5 6H19Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          ) : (
            /* 閲覧モード: ×アイコンで閉じる */
            <Button onClick={handleCloseButton} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          )}
        </div>

        <div className="overflow-y-auto p-5 flex-1 scrollbar-hide">
          {isEditing && editingPost ? (
            /* 編集モード */
            <>
              {/* 画像エリア（クリックでファイル選択） */}
              <div
                className="w-full aspect-square relative mb-5 border border-gray-100 cursor-pointer overflow-hidden"
                style={{ backgroundColor: editingPost.bgColor }}
                onClick={() => fileInputRef.current?.click()}
              >
                {(previewImage || editingPost.imageUrl) ? (
                  <img
                    src={previewImage || editingPost.imageUrl}
                    alt="投稿画像"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute bottom-0 left-0 right-0 bg-[#F4D03F] p-3">
                    <Text className="font-bold text-xs uppercase tracking-wide truncate">
                      {editingPost.title.replace(/^【.*?】/, '')}
                    </Text>
                  </div>
                )}
                {/* 画像変更オーバーレイ */}
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="17 8 12 3 7 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="3" x2="12" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <Text className="text-white text-xs font-bold">画像を変更</Text>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* タイトル */}
              <div className="mb-4">
                <Text className="text-xs text-gray-500 mb-1">タイトル</Text>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#00A48D]"
                />
              </div>

              {/* 本文 */}
              <div className="mb-4">
                <Text className="text-xs text-gray-500 mb-1">本文</Text>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#00A48D] resize-none"
                />
              </div>

              {/* タグ */}
              <div className="mb-4">
                <Text className="text-xs text-gray-500 mb-1">タグ</Text>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#00A48D]"
                  placeholder="#タグ1 #タグ2"
                />
              </div>
            </>
          ) : (
            /* 閲覧モード */
            <>
              {/* 画像エリア */}
              <div
                className="w-full aspect-square relative mb-5 border border-gray-100 overflow-hidden"
                style={{ backgroundColor: post.bgColor }}
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt="投稿画像"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* 画像がない場合はbgColorと黄色い帯 */
                  <div className="absolute bottom-0 left-0 right-0 bg-[#F4D03F] p-3">
                    {post.isNew && (
                      <Text className="text-[10px] font-bold leading-none mb-1">NEW</Text>
                    )}
                    <Text className="font-bold text-xs uppercase tracking-wide truncate">
                      {post.title.replace(/^【.*?】/, '')}
                    </Text>
                  </div>
                )}
              </div>

              {/* タイトル & 本文 */}
              <div className="mb-5">
                <Text className="font-bold text-base mb-3 leading-tight">{post.title}</Text>
                <Text className="text-[13px] whitespace-pre-wrap leading-relaxed text-[#333333]">
                  {post.content || '投稿の本文がここに入ります。'}
                </Text>
                <div className="text-right mt-2">
                  <Text className="text-[12px] text-gray-500">{displayDate}</Text>
                </div>
              </div>

              {/* タグエリア */}
              <div className="border-t border-b border-gray-200 py-3 mb-5">
                <Text className="text-[13px] font-bold mb-1"># タグ</Text>
                <Text className="text-[13px] text-gray-600">{post.tags}</Text>
              </div>

              {/* 統計エリア */}
              <div className="space-y-4 mb-2">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <Text className="text-[13px] text-gray-600">集客誘導率</Text>
                    <div className="flex items-baseline gap-1">
                      <Text className="text-2xl font-bold text-[#00A48D]">{post.rate.toFixed(1)}</Text>
                      <Text className="text-sm text-[#00A48D]">%</Text>
                    </div>
                  </div>
                  {/* プログレスバー */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden relative">
                    <div
                      className="bg-[#00A48D] h-full rounded-full absolute left-0 top-0"
                      style={{ width: `${Math.min(post.rate, 100)}%` }}
                    />
                    <div
                      className="absolute top-full mt-0.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#00A48D]"
                      style={{ left: `calc(${Math.min(post.rate, 100)}% - 4px)` }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* フッターアクション */}
        <div className="p-4 flex gap-3 justify-center pb-6">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                className="px-4 py-2 border border-[#00A48D] text-[#00A48D] rounded-md text-[13px] font-bold hover:bg-[#00A48D]/10 transition-colors"
              >
                編集内容を保存する
              </Button>
              <Button
                onClick={handleSaveHidden}
                className="px-4 py-2 border border-[#C4C4C4] rounded-md text-[13px] text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                編集を一時保存する
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleStartEdit}
                className="px-4 py-2 border border-[#C4C4C4] rounded-md text-[13px] text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                投稿を編集
              </Button>
              <Button
                onClick={handleStatusToggle}
                className={`px-4 py-2 border rounded-md text-[13px] font-bold transition-colors ${
                  isHidden
                    ? 'border-[#00A48D] text-[#00A48D] hover:bg-[#00A48D]/10'
                    : 'border-[#C4C4C4] text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isHidden ? '表示する' : '非表示にする'}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};