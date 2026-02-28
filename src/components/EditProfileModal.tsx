"use client";

import { useState, useRef } from "react";
import { User } from "@/types/marketplace";
import Button from "@/components/Button";

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditProfileModal({
  user,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? "");
  const [twitter, setTwitter] = useState(user.socialLinks?.twitter ?? "");
  const [discord, setDiscord] = useState(user.socialLinks?.discord ?? "");
  const [website, setWebsite] = useState(user.socialLinks?.website ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(user.coverImage ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "profile-images");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      return url;
    }
    return null;
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const url = await uploadImage(file);
    if (url) setAvatarUrl(url);
    setUploadingAvatar(false);
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const url = await uploadImage(file);
    if (url) setCoverImageUrl(url);
    setUploadingCover(false);
  }

  async function handleSave() {
    if (!displayName.trim() || !username.trim()) {
      setError("Display name and username are required");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          displayName: displayName.trim(),
          bio: bio.trim() || null,
          avatarUrl: avatarUrl || null,
          coverImageUrl: coverImageUrl || null,
          socialLinks: {
            twitter: twitter.trim() || undefined,
            discord: discord.trim() || undefined,
            website: website.trim() || undefined,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update profile");
        return;
      }

      onSaved();
      onClose();
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-neutral-900 rounded-t-3xl z-10">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Cover Image */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Cover Image</label>
            <div
              className="h-32 rounded-2xl bg-neutral-800 border border-white/10 overflow-hidden cursor-pointer relative group"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverImageUrl ? (
                <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  Click to upload cover image
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-sm">
                {uploadingCover ? "Uploading..." : "Change Cover"}
              </div>
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Avatar</label>
            <div
              className="w-20 h-20 rounded-full bg-neutral-800 border border-white/10 overflow-hidden cursor-pointer relative group"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/30">
                  {displayName?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-full flex items-center justify-center text-xs">
                {uploadingAvatar ? "..." : "Edit"}
              </div>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
              placeholder="Your display name"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
              placeholder="username"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Social Links</label>
            <div className="space-y-3">
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
                placeholder="Twitter URL"
              />
              <input
                type="text"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
                placeholder="Discord username"
              />
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
                placeholder="Website URL"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              className="flex-1 !h-12"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="secondary" className="!h-12" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
