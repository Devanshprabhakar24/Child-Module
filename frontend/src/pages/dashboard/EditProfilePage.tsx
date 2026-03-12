import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileApi, authApi, dashboardApi, registrationApi } from '../../services/api';

type ChildSummary = {
  registrationId: string;
  childName: string;
  childGender?: string;
  ageGroup?: string;
  ageInYears?: number;
  profilePictureUrl?: string;
};

export default function EditProfilePage() {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePictureUrl || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [childrenLoading, setChildrenLoading] = useState(false);
  const [childrenError, setChildrenError] = useState('');
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [childDrafts, setChildDrafts] = useState<Record<string, { childName: string; profilePictureUrl: string }>>({});
  const [childUploading, setChildUploading] = useState<Record<string, boolean>>({});
  const [childSaving, setChildSaving] = useState<Record<string, boolean>>({});
  const [childSuccess, setChildSuccess] = useState<Record<string, string>>({});
  const [childError, setChildError] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    setChildrenLoading(true);
    setChildrenError('');

    dashboardApi
      .getFamily()
      .then((res) => {
        const data = res.data?.data?.children ?? res.data?.children ?? [];
        if (!mounted) return;
        setChildren(data);
        const drafts: Record<string, { childName: string; profilePictureUrl: string }> = {};
        for (const c of data) {
          drafts[c.registrationId] = {
            childName: c.childName ?? '',
            profilePictureUrl: c.profilePictureUrl ?? '',
          };
        }
        setChildDrafts(drafts);
      })
      .catch(() => {
        if (!mounted) return;
        setChildrenError('Failed to load children. Please refresh and try again.');
      })
      .finally(() => {
        if (!mounted) return;
        setChildrenLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
      setUser((prev) => (prev ? { ...prev, ...payload } : prev));
      setSuccess('Profile updated successfully!');
      setError('');
    } catch {
      setError('Failed to update profile. Please try again.');
      setSuccess('');
    }
  };

  const handleChildFileChange = (registrationId: string) => async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setChildUploading((s) => ({ ...s, [registrationId]: true }));
    setChildError((s) => ({ ...s, [registrationId]: '' }));
    setChildSuccess((s) => ({ ...s, [registrationId]: '' }));

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
      setChildDrafts((d) => ({
        ...d,
        [registrationId]: {
          childName: d[registrationId]?.childName ?? '',
          profilePictureUrl: data.secure_url,
        },
      }));
    } catch (err) {
      console.error(err);
      setChildError((s) => ({ ...s, [registrationId]: 'Upload failed. Please try a different image.' }));
    } finally {
      setChildUploading((s) => ({ ...s, [registrationId]: false }));
    }
  };

  const saveChild = async (registrationId: string) => {
    setChildSaving((s) => ({ ...s, [registrationId]: true }));
    setChildError((s) => ({ ...s, [registrationId]: '' }));
    setChildSuccess((s) => ({ ...s, [registrationId]: '' }));

    try {
      const draft = childDrafts[registrationId] || { childName: '', profilePictureUrl: '' };
      const payload: { childName?: string; profilePictureUrl?: string } = {};
      if (draft.childName.trim()) payload.childName = draft.childName.trim();
      if (draft.profilePictureUrl.trim()) payload.profilePictureUrl = draft.profilePictureUrl.trim();

      const res = await registrationApi.updateChild(registrationId, payload);
      const updated = res.data?.data ?? res.data;

      setChildren((prev) =>
        prev.map((c) =>
          c.registrationId === registrationId
            ? { ...c, childName: updated.childName ?? payload.childName ?? c.childName, profilePictureUrl: updated.profilePictureUrl ?? payload.profilePictureUrl ?? c.profilePictureUrl }
            : c,
        ),
      );
      setChildSuccess((s) => ({ ...s, [registrationId]: 'Child profile updated.' }));
    } catch {
      setChildError((s) => ({ ...s, [registrationId]: 'Failed to update child. Please try again.' }));
    } finally {
      setChildSaving((s) => ({ ...s, [registrationId]: false }));
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Edit Profile</h1>
          <p>Update your personal information and profile picture</p>
        </div>
      </div>
    
      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-header">
          <h2>Profile Details</h2>
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && (
          <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
            {success}
          </div>
        )}

        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text"
            value={fullName} 
            onChange={e => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label>Profile Picture</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            {profilePictureUrl ? (
              <img 
                src={profilePictureUrl} 
                alt="Profile" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gray-200)' }} 
              />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', fontSize: '12px' }}>
                No Image
              </div>
            )}
            <div style={{ flex: 1 }}>
              <input 
                type="file" 
                id="profile-upload"
                accept="image/*" 
                onChange={handleFileChange} 
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <label htmlFor="profile-upload" className="btn-secondary" style={{ display: 'inline-flex', marginBottom: '8px' }}>
                {uploading ? 'Uploading...' : 'Choose new picture'}
              </label>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: 0 }}>JPG, GIF or PNG. Max size of 2MB.</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={uploading}
            style={{ width: 'auto', padding: '10px 24px' }}
          >
            {uploading ? 'Please wait...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px', marginTop: '24px' }}>
        <div className="card-header">
          <h2>Child Management</h2>
        </div>

        {childrenError && <div className="form-error">{childrenError}</div>}
        {childrenLoading ? (
          <div style={{ padding: '12px 16px', color: 'var(--gray-600)' }}>Loading children…</div>
        ) : children.length === 0 ? (
          <div style={{ padding: '12px 16px', color: 'var(--gray-600)' }}>No children linked to this account yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {children.map((c) => {
              const draft = childDrafts[c.registrationId] || { childName: c.childName || '', profilePictureUrl: c.profilePictureUrl || '' };
              const isUploading = !!childUploading[c.registrationId];
              const isSaving = !!childSaving[c.registrationId];
              const errMsg = childError[c.registrationId] || '';
              const okMsg = childSuccess[c.registrationId] || '';

              return (
                <div key={c.registrationId} className="card" style={{ margin: 0 }}>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>{c.childName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Reg ID: {c.registrationId}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                        {c.ageGroup ? <div>Age group: {c.ageGroup}</div> : null}
                        {typeof c.ageInYears === 'number' ? <div>Age: {c.ageInYears} years</div> : null}
                      </div>
                    </div>

                    {errMsg && <div className="form-error" style={{ marginTop: '12px' }}>{errMsg}</div>}
                    {okMsg && (
                      <div style={{ marginTop: '12px', background: 'var(--success-light)', color: 'var(--success)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 500 }}>
                        {okMsg}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Child Name</label>
                        <input
                          type="text"
                          value={draft.childName}
                          onChange={(e) =>
                            setChildDrafts((d) => ({
                              ...d,
                              [c.registrationId]: {
                                childName: e.target.value,
                                profilePictureUrl: d[c.registrationId]?.profilePictureUrl ?? '',
                              },
                            }))
                          }
                          placeholder="Enter child name"
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Child Profile Picture</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                          {draft.profilePictureUrl ? (
                            <img
                              src={draft.profilePictureUrl}
                              alt="Child"
                              style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gray-200)' }}
                            />
                          ) : (
                            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', fontSize: '12px' }}>
                              No Image
                            </div>
                          )}

                          <div style={{ flex: 1 }}>
                            <input
                              type="file"
                              id={`child-upload-${c.registrationId}`}
                              accept="image/*"
                              onChange={handleChildFileChange(c.registrationId)}
                              disabled={isUploading || isSaving}
                              style={{ display: 'none' }}
                            />
                            <label htmlFor={`child-upload-${c.registrationId}`} className="btn-secondary" style={{ display: 'inline-flex', marginBottom: '8px' }}>
                              {isUploading ? 'Uploading…' : 'Choose new picture'}
                            </label>
                            <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: 0 }}>JPG, GIF or PNG. Max size of 2MB.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                      <button
                        className="btn-primary"
                        onClick={() => saveChild(c.registrationId)}
                        disabled={isUploading || isSaving}
                        style={{ width: 'auto', padding: '10px 24px' }}
                      >
                        {isSaving ? 'Saving…' : 'Save Child'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
