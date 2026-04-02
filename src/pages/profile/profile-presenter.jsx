import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getUserById, updateUserProfile, uploadAvatar } from './profile-model';
import ProfileView from './profile-view';
import { toast } from 'react-toastify';

// Utility: convert cropped area ke Blob
function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = Math.max(pixelCrop.width, pixelCrop.height);
      // Output 400x400 px — cukup tajam untuk avatar, tidak terlalu besar
      const outputSize = 400;
      canvas.width = outputSize;
      canvas.height = outputSize;

      const ctx = canvas.getContext('2d');

      // Hitung posisi agar crop area pas di tengah canvas
      const scaleX = outputSize / pixelCrop.width;
      const scaleY = outputSize / pixelCrop.height;
      const scale = Math.max(scaleX, scaleY);

      const drawW = image.naturalWidth * scale;
      const drawH = image.naturalHeight * scale;
      const drawX = -pixelCrop.x * scale;
      const drawY = -pixelCrop.y * scale;

      ctx.drawImage(image, drawX, drawY, drawW, drawH);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Gagal membuat blob dari canvas'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.92 // kualitas — 92% bagus untuk foto, ukuran tetap kecil
      );
    };
    image.onerror = () => reject(new Error('Gagal memuat gambar'));
    image.src = imageSrc;
  });
}

export default function ProfilePresenter({ userId, currentUser }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Crop state
  const [cropModal, setCropModal] = useState({
    isOpen: false,
    imageSrc: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
  });
  const croppedAreaPixelsRef = useRef(null);

  const isOwnProfile = currentUser?.id === userId;

  // Fetch user
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    getUserById(userId)
      .then((userData) => {
        setUser(userData);
        if (userData.peminjamans) {
          const rows = userData.peminjamans;
          setStatistics({
            totalPinjam: rows.length,
            dipinjam: rows.filter((r) => r.status === 'disetujui').length,
            selesai: rows.filter((r) => r.status === 'kembali').length,
          });
        }
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat profil');
        toast.error(err.message || 'Gagal memuat profil');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleEditToggle = useCallback(() => {
    setEditData({
      nama: user?.nama || '',
      email: user?.email || '',
      nohp: user?.nohp || '',
      nip: user?.nip || '',
      nisn: user?.nisn || '',
      kelas: user?.kelas || '',
      mapel: Array.isArray(user?.mapel) ? user.mapel.join(', ') : (user?.mapel || ''),
    });
    setIsEditing(true);
  }, [user]);

  const handleEditChange = useCallback((field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!editData.nama?.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }
    try {
      const updated = await updateUserProfile(userId, editData);
      setUser(updated);
      setIsEditing(false);
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui profil');
    }
  }, [userId, editData]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditData({});
  }, []);

  // ── AVATAR: pilih file → buka crop modal ──
  const handleAvatarSelect = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diperbolehkan');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropModal({
        isOpen: true,
        imageSrc: reader.result,
        crop: { x: 0, y: 0 },
        zoom: 1,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Crop handlers ──
  const handleCropChange = useCallback((crop) => {
    setCropModal((prev) => ({ ...prev, crop }));
  }, []);

  const handleZoomChange = useCallback((zoom) => {
    setCropModal((prev) => ({ ...prev, zoom }));
  }, []);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    croppedAreaPixelsRef.current = croppedAreaPixels;
  }, []);

  const handleCropCancel = useCallback(() => {
    setCropModal({ isOpen: false, imageSrc: null, crop: { x: 0, y: 0 }, zoom: 1 });
    croppedAreaPixelsRef.current = null;
  }, []);

  // ── Crop confirm: generate blob → upload ──
  const handleCropConfirm = useCallback(async () => {
    const imageSrc = cropModal.imageSrc;
    const pixelCrop = croppedAreaPixelsRef.current;

    if (!imageSrc || !pixelCrop) return;

    // Tutup modal crop dulu
    setCropModal({ isOpen: false, imageSrc: null, crop: { x: 0, y: 0 }, zoom: 1 });

    setAvatarUploading(true);
    try {
      // Generate blob dari crop area
      const croppedBlob = await getCroppedImg(imageSrc, pixelCrop);

      // Buat File dari Blob (supaya FormData bisa baca nama file)
      const croppedFile = new File([croppedBlob], `avatar-${userId}.jpg`, {
        type: 'image/jpeg',
      });

      // Upload
      const fotoUrl = await uploadAvatar(userId, croppedFile);
      setUser((prev) => ({ ...prev, foto: fotoUrl }));
      toast.success('Foto profil berhasil diperbarui');
    } catch (err) {
      toast.error(err.message || 'Gagal mengupload foto');
    } finally {
      setAvatarUploading(false);
      croppedAreaPixelsRef.current = null;
    }
  }, [cropModal.imageSrc, userId]);

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
      onCropChange={handleCropChange}
      onZoomChange={handleZoomChange}
      onCropComplete={handleCropComplete}
      onCropConfirm={handleCropConfirm}
      onCropCancel={handleCropCancel}
      statistics={statistics}
    />
  );
}