"use client";

import { z } from "zod";
import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { Pencil, Check, X, Lock, Key, ShieldCheck, UploadCloud, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const profileSchema = z.object({
  image: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  education: z.string().optional().nullable(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional().nullable(),
  previousInstitution: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Password must contain at least one digit")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ProfilePagePremium() {
  const { data: session, update: updateSession, status } = useSession();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    image: "",
    name: "",
    email: "",
    education: "",
    skills: [] as string[],
    experience: "",
    previousInstitution: "",
    address: "",
    newSkill: "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // Initialize form with session data
  useEffect(() => {
    if (session?.user) {
      setForm({
        image: session.user.image || "",
        name: session.user.name || "",
        email: session.user.email || "",
        education: session.user.education || "",
        skills: Array.isArray(session.user.skills) ? session.user.skills : [],
        experience: session.user.experience || "",
        previousInstitution: session.user.previousInstitution || "",
        address: session.user.address || "",
        newSkill: "",
      });
    }
  }, [session?.user]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPwdForm((p) => ({ ...p, [name]: value }));
    setPwdError(null);
  };

  const addSkill = () => {
    const val = form.newSkill?.trim();
    if (!val) return;
    if (!form.skills.includes(val)) {
      setForm((prev) => ({ 
        ...prev, 
        skills: [...prev.skills, val], 
        newSkill: "" 
      }));
    }
  };

  const removeSkill = (s: string) => 
    setForm((prev) => ({ 
      ...prev, 
      skills: prev.skills.filter((sk: string) => sk !== s) 
    }));

  const onEditToggle = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("Please sign in to update profile");
      return;
    }

    setError(null);
    setSuccess(false);

    // Validate form data
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const errorMessage = parsed.error.issues.map((i) => i.message).join(", ");
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setLoading(true);
    try {
      const body = { ...form };
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Update failed");
      }

      const updatedUser = await res.json();

      // ✅ INDUSTRY STANDARD: Update session immediately
      await updateSession({
        ...session,
        user: {
          ...session.user,
          ...updatedUser,
        }
      });

      setSuccess(true);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      
      // Refresh server components
      router.refresh();

    } catch (err: any) {
      console.error("Profile update error:", err);
      const errorMsg = err.message || "Update failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);

    const parsed = passwordSchema.safeParse(pwdForm);
    if (!parsed.success) {
      const errorMessage = parsed.error.issues.map((i) => i.message).join(", ");
      setPwdError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Password change failed");
      }

      // Update session after password change
      await updateSession();
      
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordModal(false);
      toast.success("Password changed successfully!");

    } catch (err: any) {
      console.error("Password change error:", err);
      const errorMsg = err.message || "Password change failed";
      setPwdError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setPwdLoading(false);
    }
  };

  const pwdStrength = useMemo(() => {
    const p = pwdForm.newPassword || "";
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }, [pwdForm.newPassword]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="max-w-7xl mx-auto bg-white/80 py-8 px-4 sm:px-6 lg:px-8 rounded-md sm:rounded-lg shadow-xl">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="max-w-7xl mx-auto bg-white/80 py-8 px-4 sm:px-6 lg:px-8 rounded-md sm:rounded-lg shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row items-center lg:items-start gap-6 justify-between w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
            {/* Profile Image */}
            <div className="relative mx-auto sm:mx-0 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center shrink-0">
              {form.image ? (
                <img
                  src={form.image}
                  alt={form.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-gray-400">
                  {form.name?.charAt(0) ?? "U"}
                </span>
              )}

              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                    onSuccess={(e: any) => {
                      if (e?.info?.secure_url) {
                        setForm((p) => ({ ...p, image: e.info.secure_url }));
                        toast.success("Image uploaded successfully!");
                      }
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-full text-xs sm:text-sm"
                      >
                        <UploadCloud className="w-4 h-4" /> Change
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-lg sm:text-2xl xl:text-3xl font-extrabold text-slate-800 wrap-break-word">
                {form.name || "Unnamed"}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1 truncate">
                {form.email}
              </p>

              {/* Action Buttons */}
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                {!isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={onEditToggle}
                      className="inline-flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow transition-colors"
                    >
                      <Pencil size={16} /> Edit Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="inline-flex items-center gap-2 border border-slate-200 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:shadow transition-shadow"
                    >
                      <Lock size={16} /> Change Password
                    </button>
                  </>
                ) : (
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors"
                      disabled={loading}
                    >
                      <X size={16} /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="w-full lg:w-auto text-center lg:text-right mt-4 lg:mt-0">
            <div className="text-xs sm:text-sm text-slate-500">Last updated</div>
            <span className="text-xs sm:text-sm text-orange-400">
              {session.user.updatedAt
                ? new Date(session.user.updatedAt).toLocaleString()
                : "Never"}
            </span>
          </div>
        </header>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Profile updated successfully!
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Details & Skills */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Personal Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-xs text-slate-600 mb-1">Full name</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 text-sm transition-colors"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-xs text-slate-600 mb-1">Email</span>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 text-sm transition-colors"
                  />
                </label>

                <label className="flex flex-col sm:col-span-2">
                  <span className="text-xs text-slate-600 mb-1">Education</span>
                  <input
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="BSc in Computer Science"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 text-sm transition-colors"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-xs text-slate-600 mb-1">Experience</span>
                  <input
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="3 years in web development"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 text-sm transition-colors"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-xs text-slate-600 mb-1">Previous Institution</span>
                  <input
                    name="previousInstitution"
                    value={form.previousInstitution}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 text-sm transition-colors"
                  />
                </label>

                <label className="flex flex-col sm:col-span-2">
                  <span className="text-xs text-slate-600 mb-1">Address</span>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-60 text-sm resize-none transition-colors"
                  />
                </label>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <h3 className="text-lg font-semibold text-slate-700 text-center sm:text-left">Skills</h3>

                {isEditing && (
                  <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-2">
                    <input
                      name="newSkill"
                      value={form.newSkill}
                      onChange={(e) => setForm((p) => ({ ...p, newSkill: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Add skill and press Enter"
                      className="w-full sm:w-auto rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 max-w-full">
                {form.skills.length > 0 ? (
                  form.skills.map((s: string) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-200 transition-colors"
                    >
                      {s}
                      {isEditing && (
                        <X
                          className="w-3 h-3 cursor-pointer text-slate-500 hover:text-red-500 transition-colors"
                          onClick={() => removeSkill(s)}
                        />
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No skills added yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <aside className="space-y-6">
            {/* Security Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-slate-700">Account & Security</h4>
              <div className="text-sm text-slate-600">
                Two-factor: {session.user.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <button 
                onClick={() => setShowPasswordModal(true)} 
                className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-300 hover:shadow transition-shadow"
              >
                <Key className="w-4 h-4" /> Change password
              </button>
              <button
                onClick={async () => {
                  await fetch('/api/auth/signout', { method: 'POST' });
                  router.push('/');
                }}
                className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-300 hover:shadow text-sm transition-shadow"
              >
                Sign out
              </button>
            </div>

            {/* Profile Completeness Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h4 className="text-sm font-semibold text-slate-700">Profile completeness</h4>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (Object.values(form).filter(val => val && val !== '').length / 8) * 100)}%`, 
                    background: 'linear-gradient(90deg,#ffb86b,#16a34a)' 
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Keep your profile updated to get better matches</p>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h4 className="text-sm font-semibold text-slate-700">Support</h4>
              <p className="text-sm text-slate-500">Need help? Reach out to support or update your details.</p>
              <a className="mt-3 inline-block text-sm text-orange-600 font-medium hover:underline transition-colors" href="mailto:support@example.com">
                Contact support
              </a>
            </div>
          </aside>
        </div>
      </form>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 transition-opacity" 
            onClick={() => !pwdLoading && setShowPasswordModal(false)} 
          />
          <div className="relative max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-orange-500" /> 
              Change password
            </h3>
            
            {pwdError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
                {pwdError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Current password</label>
                <input 
                  name="currentPassword" 
                  value={pwdForm.currentPassword} 
                  onChange={handlePwdChange} 
                  type="password" 
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors" 
                  required
                  disabled={pwdLoading}
                />
              </div>
              
              <div>
                <label className="text-xs text-slate-600 mb-1 block">New password</label>
                <input 
                  name="newPassword" 
                  value={pwdForm.newPassword} 
                  onChange={handlePwdChange} 
                  type="password" 
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors" 
                  required
                  disabled={pwdLoading}
                />
                <div className="mt-2 text-xs text-slate-500">
                  Strength: <span className="font-medium">{['Very weak', 'Weak', 'Okay', 'Good', 'Strong'][pwdStrength]}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
                  <div 
                    style={{ 
                      width: `${(pwdStrength / 4) * 100}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg,#ff7a18,#ffb86b)',
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Confirm new password</label>
                <input 
                  name="confirmPassword" 
                  value={pwdForm.confirmPassword} 
                  onChange={handlePwdChange} 
                  type="password" 
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors" 
                  required
                  disabled={pwdLoading}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)} 
                  className="px-4 py-2 rounded-md border border-slate-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={pwdLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={pwdLoading}
                  className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {pwdLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {pwdLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}















// "use client";

// import { z } from "zod";
// import React, { useEffect, useMemo, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { CldUploadWidget } from "next-cloudinary";
// import { Pencil, Check, X, Lock, Key, ShieldCheck, UploadCloud } from "lucide-react";
// import toast from "react-hot-toast";


// const profileSchema = z.object({
//   image: z.string().optional(),
//   name: z.string().min(1, "Name is required"),
//   email: z.string().email("Invalid email"),
//   education: z.string().optional().nullable(),
//   skills: z.array(z.string()).optional(),
//   experience: z.string().optional().nullable(),
//   previousInstitution: z.string().optional().nullable(),
//   address: z.string().optional().nullable(),
// });


// const passwordSchema = z
//   .object({
//     currentPassword: z.string().min(6, "Current password is required"),
//     newPassword: z
//       .string()
//       .min(8, "Password must be at least 8 characters")
//       .regex(/[0-9]/, "Password must contain at least one digit")
//       .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
//       .regex(/[a-z]/, "Password must contain at least one lowercase letter")
//       .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
//     confirmPassword: z.string().min(1),
//   })
//   .refine((d) => d.newPassword === d.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

// export default function ProfilePagePremium() {
//   const { data: session, update } = useSession();
//   const router = useRouter();
//   const user = session?.user as any;

//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   if (!session) {
//     router.push("/auth/signin")
//   };

//   const [form, setForm] = useState({
//     image: user?.image || "",
//     name: user?.name || "",
//     email: user?.email || "",
//     education: user?.education || "",
//     // skills: user?.skills ? String(user?.skills).split(",").map((s: string) => s.trim()).filter(Boolean) : [],
//     skills: user?.skills || [],
//     experience: user?.experience || "",
//     previousInstitution: user?.previousInstitution || "",
//     address: user?.address || "",
//     newSkill: "",
//   });


//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [pwdForm, setPwdForm] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });
//   const [pwdLoading, setPwdLoading] = useState(false);
//   const [pwdError, setPwdError] = useState<string | null>(null);
//   const [pwdSuccess, setPwdSuccess] = useState(false);

//   useEffect(() => {
//     setForm((prev) => ({ ...prev, image: user.image || prev.image, name: user.name || prev.name, email: user.email || prev.email }));
//   }, [user?.image, user?.name, user?.email]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setPwdForm((p) => ({ ...p, [name]: value }));
//   };

//   const addSkill = () => {
//     const val = form.newSkill?.trim();
//     if (!val) return;
//     if (!form.skills.includes(val)) setForm((prev) => ({ ...prev, skills: [...prev.skills, val], newSkill: "" }));
//   };
//   const removeSkill = (s: string) => setForm((prev) => ({ ...prev, skills: prev.skills.filter((sk: string) => sk !== s) }));

//   const onEditToggle = () => {
//     setIsEditing(true);
//     setError(null);
//     setSuccess(false);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(false);

//     // const parsed = profileSchema.safeParse({ ...form, skills: form.skills });
//     // if (!parsed.success) {
//     //   setError(parsed.error.issues.map((i) => i.message).join(", "));
//     //   return;
//     // }

//     setLoading(true);
//     try {
//       const body = { ...form };
//       const res = await fetch("/api/profile/update", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });
//       if (!res.ok) throw new Error((await res.json()).message || "Update failed");
//       const updated = await res.json();
//       await update();
//       await update({ user: updated });
//       setSuccess(true);
//       setIsEditing(false);
//       toast.success("Profile updated");
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || "Update failed");
//       toast.error(err.message || "Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };


//   const handleChangePassword = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     setPwdError(null);
//     setPwdSuccess(false);

//     const parsed = passwordSchema.safeParse(pwdForm);
//     if (!parsed.success) {
//       setPwdError(parsed.error.issues.map((i) => i.message).join(", "));
//       return;
//     }

//     setPwdLoading(true);
//     try {
//       const res = await fetch("/api/profile/change-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           currentPassword: pwdForm.currentPassword,
//           newPassword: pwdForm.newPassword,
//         }),
//       });
//       if (!res.ok) throw new Error((await res.json()).message || "Password change failed");
//       setPwdSuccess(true);
//       setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
//       setShowPasswordModal(false);
//       toast.success("Password changed successfully");
//     } catch (err: any) {
//       console.error(err);
//       setPwdError(err.message || "Password change failed");
//       toast.error(err.message || "Password change failed");
//     } finally {
//       setPwdLoading(false);
//     }
//   };


//   const pwdStrength = useMemo(() => {
//     const p = pwdForm.newPassword || "";
//     let score = 0;
//     if (p.length >= 8) score++;
//     if (/[A-Z]/.test(p)) score++;
//     if (/[0-9]/.test(p)) score++;
//     if (/[^A-Za-z0-9]/.test(p)) score++;
//     return score; // 0..4
//   }, [pwdForm.newPassword]);

//   return (
//     <div className="max-w-7xl mx-auto bg-white/80 py-8 px-4 sm:px-6 lg:px-8 rounded-md sm:rounded-lg shadow-xl">
//       <form onSubmit={handleSubmit} className="space-y-6">

//         <header className="flex flex-col lg:flex-row items-center lg:items-start gap-6 justify-between w-full">

//           <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
//             <div className="relative mx-auto sm:mx-0 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center shrink-0">
//               {form.image ? (
//                 <img
//                   src={form.image}
//                   alt={form.name}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <span className="text-3xl sm:text-4xl font-bold text-gray-400">
//                   {form.name?.charAt(0) ?? "U"}
//                 </span>
//               )}

//               {isEditing && (
//                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
//                   <CldUploadWidget
//                     uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
//                     onSuccess={(e: any) => {
//                       if (e?.info?.secure_url)
//                         setForm((p) => ({ ...p, image: e.info.secure_url }));
//                     }}
//                   >
//                     {({ open }) => (
//                       <button
//                         type="button"
//                         onClick={() => open()}
//                         className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-full text-xs sm:text-sm"
//                       >
//                         <UploadCloud className="w-4 h-4" /> Change
//                       </button>
//                     )}
//                   </CldUploadWidget>
//                 </div>
//               )}
//             </div>

//             <div className="flex-1 text-center sm:text-left min-w-0">
//               <h1 className="text-lg sm:text-2xl xl:text-3xl font-extrabold text-slate-800 wrap-break-word">
//                 {form.name || "Unnamed"}
//               </h1>
//               <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1 truncate">
//                 {form.email}
//               </p>

//               <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
//                 {!isEditing ? (
//                   <>
//                     <button
//                       type="button"
//                       onClick={onEditToggle}
//                       className="inline-flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow"
//                     >
//                       <Pencil size={16} /> Edit Profile
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setShowPasswordModal(true)}
//                       className="inline-flex items-center gap-2 border border-slate-200 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:shadow"
//                     >
//                       <Lock size={16} /> Change Password
//                     </button>
//                   </>
//                 ) : (
//                   <div className="flex flex-wrap justify-center sm:justify-start gap-2">
//                     <button
//                       type="button"
//                       onClick={() => setIsEditing(false)}
//                       className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold"
//                       disabled={loading}
//                     >
//                       <X size={16} /> Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold"
//                       disabled={loading}
//                     >
//                       <Check size={16} /> Save Changes
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="w-full lg:w-auto text-center lg:text-right mt-4 lg:mt-0">
//             <div className="text-xs sm:text-sm text-slate-500">Last updated</div>
//             <span className="text-xs sm:text-sm text-orange-400">
//               {user?.updatedAt
//                 ? new Date(user.updatedAt).toLocaleString()
//                 : "Never"}
//             </span>
//           </div>
//         </header>

//         {error && <div className="text-red-600 text-sm">{error}</div>}
//         {success && <div className="text-green-600 text-sm">Profile saved</div>}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-white rounded-2xl shadow-sm p-6">
//               <h2 className="text-lg font-semibold text-slate-700 mb-4">Personal Details</h2>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <label className="flex flex-col">
//                   <span className="text-xs text-slate-600 mb-1">Full name</span>
//                   <input
//                     name="name"
//                     value={form.name}
//                     onChange={handleChange}
//                     disabled={!isEditing}
//                     className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-60 text-sm"
//                   />
//                 </label>

//                 <label className="flex flex-col">
//                   <span className="text-xs text-slate-600 mb-1">Email</span>
//                   <input
//                     name="email"
//                     value={form.email}
//                     onChange={handleChange}
//                     disabled={!isEditing}
//                     className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-60 text-sm"
//                   />
//                 </label>

//                 <label className="flex flex-col sm:col-span-2">
//                   <span className="text-xs text-slate-600 mb-1">Education</span>
//                   <input
//                     name="education"
//                     value={form.education}
//                     onChange={handleChange}
//                     disabled={!isEditing}
//                     placeholder="BSc in Computer Science"
//                     className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-60 text-sm"
//                   />
//                 </label>

//                 <label className="flex flex-col">
//                   <span className="text-xs text-slate-600 mb-1">Experience</span>
//                   <input
//                     name="experience"
//                     value={form.experience}
//                     onChange={handleChange}
//                     disabled={!isEditing}
//                     placeholder="3 years in web development"
//                     className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-60 text-sm"
//                   />
//                 </label>

//                 <label className="flex flex-col">
//                   <span className="text-xs text-slate-600 mb-1">Previous Institution</span>
//                   <input
//                     name="previousInstitution"
//                     value={form.previousInstitution}
//                     onChange={handleChange}
//                     disabled={!isEditing}
//                     className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-60 text-sm"
//                   />
//                 </label>

//                 <label className="flex flex-col sm:col-span-2">
//                   <span className="text-xs text-slate-600 mb-1">Address</span>
//                   <textarea
//                     name="address"
//                     value={form.address}
//                     onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
//                     disabled={!isEditing}
//                     rows={3}
//                     className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-60 text-sm resize-none"
//                   />
//                 </label>
//               </div>
//             </div>


//             <div className="bg-white rounded-2xl shadow-sm p-6">
//               <div
//                 className=" flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
//                 <h3 className="text-lg font-semibold text-slate-700 text-center sm:text-left">Skills</h3>

//                 {isEditing && (
//                   <div className=" flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-2">
//                     <input
//                       name="newSkill"
//                       value={form.newSkill}
//                       onChange={(e) =>
//                         setForm((p) => ({ ...p, newSkill: e.target.value }))
//                       }
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") {
//                           e.preventDefault();
//                           addSkill();
//                         }
//                       }}
//                       placeholder="Add skill and press Enter"
//                       className=" w-full sm:w-auto rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400" />
//                     <button
//                       type="button"
//                       onClick={addSkill}
//                       className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium">
//                       Add
//                     </button>
//                   </div>
//                 )}
//               </div>

//               <div className=" flex flex-wrap gap-2 max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
//                 {form.skills.length ? (
//                   form.skills.map((s: any) => (
//                     <span
//                       key={s}
//                       className=" inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-200 transition">
//                       {s}
//                       {isEditing && (
//                         <X
//                           className="w-3 h-3 cursor-pointer text-slate-500 hover:text-red-500 transition"
//                           onClick={() => removeSkill(s)}
//                         />
//                       )}
//                     </span>
//                   ))
//                 ) : (
//                   <p className="text-sm text-slate-500">No skills added yet</p>
//                 )}
//               </div>
//             </div>

//           </div>

//           <aside className="space-y-6">
//             <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-3">
//               <h4 className="text-sm font-semibold text-slate-700">Account & Security</h4>
//               <div className="text-sm text-slate-600">Two-factor: {user.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}</div>
//               <button onClick={() => setShowPasswordModal(true)} className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:shadow">
//                 <Key className="w-4 h-4" /> Change password
//               </button>
//               <button
//                 onClick={async () => {
//                   await fetch('/api/auth/signout', { method: 'POST' });
//                   router.push('/');
//                 }}
//                 className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:shadow text-sm"
//               >
//                 Sign out
//               </button>
//             </div>

//             <div className="bg-white rounded-2xl shadow-sm p-6">
//               <h4 className="text-sm font-semibold text-slate-700">Profile completeness</h4>
//               <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
//                 <div
//                   className="h-2 rounded-full"
//                   style={{ width: `${Math.min(100, (Object.values(form).filter(Boolean).length / 8) * 100)}%`, background: 'linear-gradient(90deg,#ffb86b,#16a34a)' }}
//                 />
//               </div>
//               <p className="text-xs text-slate-500 mt-2">Keep your profile updated to get better matches</p>
//             </div>

//             <div className="bg-white rounded-2xl shadow-sm p-6">
//               <h4 className="text-sm font-semibold text-slate-700">Support</h4>
//               <p className="text-sm text-slate-500">Need help? Reach out to support or update your details.</p>
//               <a className="mt-3 inline-block text-sm text-orange-600 font-medium hover:underline" href="mailto:support@example.com">Contact support</a>
//             </div>
//           </aside>
//         </div>

//         {showPasswordModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <div className="absolute inset-0 bg-black/40" onClick={() => setShowPasswordModal(false)} />
//             <div className="relative max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
//               <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><ShieldCheck /> Change password</h3>
//               {pwdError && <div className="text-red-600 text-sm mb-2">{pwdError}</div>}
//               {pwdSuccess && <div className="text-green-600 text-sm mb-2">Password changed</div>}

//               <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-3">
//                 <div>
//                   <label className="text-xs text-slate-600">Current password</label>
//                   <input name="currentPassword" value={pwdForm.currentPassword} onChange={handlePwdChange} type="password" className="w-full rounded-md border px-3 py-2 text-sm" />
//                 </div>
//                 <div>
//                   <label className="text-xs text-slate-600">New password</label>
//                   <input name="newPassword" value={pwdForm.newPassword} onChange={handlePwdChange} type="password" className="w-full rounded-md border px-3 py-2 text-sm" />
//                   <div className="mt-1 text-xs text-slate-500">Strength: {['Very weak', 'Weak', 'Okay', 'Good', 'Strong'][pwdStrength]}</div>
//                   <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
//                     <div style={{ width: `${(pwdStrength / 4) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#ff7a18,#ffb86b)' }} />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="text-xs text-slate-600">Confirm new password</label>
//                   <input name="confirmPassword" value={pwdForm.confirmPassword} onChange={handlePwdChange} type="password" className="w-full rounded-md border px-3 py-2 text-sm" />
//                 </div>

//                 <div className="flex gap-2 justify-end">
//                   <button type="button" onClick={() => setShowPasswordModal(false)} className="px-3 py-2 rounded-md border">Cancel</button>
//                   <button type="button" onClick={() => handleChangePassword()} disabled={pwdLoading} className="px-3 py-2 rounded-md bg-orange-500 text-white">Change</button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//       </form>
//     </div>
//   );
// };

