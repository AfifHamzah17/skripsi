import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../Context/AuthContext';
import profileModel from './profile-model';
import ProfileView from './profile-view';

const createImage = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.addEventListener('load', () => resolve(img));
  img.addEventListener('error', reject);
  img.src = url;
});

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve) => { canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85); });
};

export default function ProfilePresenter({ userId, currentUser }) {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState(null);
  const isOwnProfile = authUser?.id === userId;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cropModal, setCropModal] = useState({ isOpen: false, imageSrc: null, crop: { x: 0, y: 0 }, zoom: 1 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await profileModel.getProfile(userId);
      // Backend return: { error: false, user: {...}, statistics: {...} }
      if (res.error) { setError(res.message); }
      else { setUser(res.user || res.result || res); setStatistics(res.statistics || null); }
    } catch (e) { setError('Gagal memuat profil'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditData({
        nama: user.nama || '',
        email: user.email || '',
        nohp: user.nohp || '',
        nip: user.nip || '',
        nisn: user.nisn || '',
        kelas: user.kelas || '',
        mapel: Array.isArray(user.mapel) ? [...user.mapel] : user.mapel ? [user.mapel] : [],
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarSelect = (file) => {
    if (!file.type.startsWith('image/')) return toast.error('Hanya file gambar');
    if (file.size > 2 * 1024 * 1024) return toast.error('Maks 2MB');
    const reader = new FileReader();
    reader.onloadend = () => setCropModal(prev => ({ ...prev, isOpen: true, imageSrc: reader.result }));
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);

  const handleCropConfirm = async () => {
    try {
      const blob = await getCroppedImg(cropModal.imageSrc, croppedAreaPixels);
      if (blob.size > 2 * 1024 * 1024) return toast.error('Hasil crop melebihi 2MB');
      setAvatarUploading(true);
      setCropModal(prev => ({ ...prev, isOpen: false }));
      const reader = new FileReader();
      reader.onloadend = async () => {
        const res = await profileModel.updateAvatar(userId, reader.result);
        if (res.error) toast.error(res.message);
        else { toast.success('Foto profil diperbarui'); loadProfile(); }
        setAvatarUploading(false);
      };
      reader.readAsDataURL(blob);
    } catch { toast.error('Gagal memproses gambar'); setAvatarUploading(false); }
  };

  const handleCropCancel = () => setCropModal(prev => ({ ...prev, isOpen: false, imageSrc: null }));
  const onCropChange = (crop) => setCropModal(prev => ({ ...prev, crop }));
  const onZoomChange = (zoom) => setCropModal(prev => ({ ...prev, zoom }));

  const handleSave = async () => {
    if (!editData.nama?.trim()) return toast.error('Nama wajib diisi');
    try {
      // Backend updateOwnProfile sudah handle mapel di dalam payload
      // Jadi cukup kirim sekali, tidak perlu saveTeacherMapel terpisah
      const res = await profileModel.updateProfile(userId, editData);
      if (res.error) return toast.error(res.message);
      toast.success('Profil berhasil diperbarui');
      setIsEditing(false);
      loadProfile();
    } catch (e) { toast.error('Gagal menyimpan'); }
  };

  const handleCancel = () => { setIsEditing(false); setEditData({}); };

  return (
    <ProfileView
      user={user}
      loading={loading}
      error={error}
      isOwnProfile={isOwnProfile}
      isEditing={isEditing}
      onEditToggle={handleEditToggle}
      onSave={handleSave}
      onCancel={handleCancel}
      editData={editData}
      onEditChange={handleEditChange}
      avatarUploading={avatarUploading}
      onAvatarSelect={handleAvatarSelect}
      cropModal={cropModal}
      onCropChange={onCropChange}
      onZoomChange={onZoomChange}
      onCropComplete={onCropComplete}
      onCropConfirm={handleCropConfirm}
      onCropCancel={handleCropCancel}
      statistics={statistics}
    />
  );
}