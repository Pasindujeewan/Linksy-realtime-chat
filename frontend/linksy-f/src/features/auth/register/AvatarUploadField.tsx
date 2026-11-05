import { Check, LoaderCircle, UserRound } from "lucide-react";
import type { ChangeEvent } from "react";
import type { AvatarUploadStatus } from "./registerTypes";

interface AvatarUploadFieldProps {
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  previewUrl: string;
  status: AvatarUploadStatus;
  uploadedToken: string;
}

export default function AvatarUploadField({
  error,
  onChange,
  previewUrl,
  status,
  uploadedToken,
}: AvatarUploadFieldProps) {
  const isUploading = status === "uploading";
  const isUploaded = status === "uploaded";

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="avatarFile"
        className="block text-sm font-semibold text-slate-700"
      >
        Profile picture
      </label>
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected profile picture preview"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div
              role="img"
              aria-label="No profile picture selected"
              className="grid h-16 w-16 place-items-center rounded-full border border-indigo-100 bg-indigo-50 text-indigo-400"
            >
              <UserRound aria-hidden="true" className="h-7 w-7" />
            </div>
          )}
          {(isUploading || isUploaded) && (
            <span
              role="img"
              aria-label={
                isUploading
                  ? "Uploading profile picture"
                  : "Profile picture uploaded"
              }
              className={`absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full border-2 border-white shadow-sm ${isUploaded ? "bg-emerald-500 text-white" : "bg-white text-indigo-600"}`}
            >
              {isUploading ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin"
                />
              ) : (
                <Check aria-hidden="true" className="h-3.5 w-3.5" />
              )}
            </span>
          )}
        </div>
        <input
          id="avatarFile"
          name="avatarFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required={!uploadedToken}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "avatarFile-error" : undefined}
          onChange={onChange}
          className="block min-w-0 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>
      {(isUploading || isUploaded) && (
        <p role="status" aria-live="polite" className="text-xs text-slate-500">
          {isUploading
            ? "Uploading profile picture…"
            : "Profile picture uploaded."}
        </p>
      )}
      <p className="text-xs text-slate-500">
        JPG, PNG, WEBP, or GIF. Maximum 5 MB.
      </p>
      {error && (
        <p id="avatarFile-error" className="text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
