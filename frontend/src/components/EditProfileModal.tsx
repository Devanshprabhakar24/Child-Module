import { useState } from 'react';
import { profileApi, authApi } from '../services/api';

export default function EditProfileModal({ user, onClose, onSave }: any) {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(user.profilePictureUrl || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const sigRes = await authApi.getCloudinarySignature();
      const { signature, timestamp, apiKey, cloudName } = sigRes.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setProfilePictureUrl(data.secure_url);
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please try a different image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload: { fullName?: string; profilePictureUrl?: string } = {};
      if (fullName.trim()) payload.fullName = fullName.trim();
      if (profilePictureUrl.trim()) payload.profilePictureUrl = profilePictureUrl.trim();

      await profileApi.updateProfile(payload);
      onSave(payload);
    } catch {
      setError('Failed to update profile');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Profile</h2>
        <label>Name</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)} />
        <label>Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        {profilePictureUrl && <img src={profilePictureUrl} alt="Profile" style={{ width: 80, borderRadius: '50%' }} />}
        {error && <div className="error-text">{error}</div>}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave} disabled={uploading}>Save</button>
        </div>
      </div>
    </div>
  );
}
