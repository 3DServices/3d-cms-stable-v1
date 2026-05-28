/**
 * EditGeofenceDrawer — Slide-in drawer for editing an existing geofence.
 *
 * Allows renaming, changing description, and updating polygon points
 * (if the user has been editing vertices on the map).
 */
import React, { useState, useCallback, useEffect } from "react";
import { updateGeozone } from "../../../api/services/geozones.service";
import { useGuardedMutation } from "../../../auth/guards";
import type { ParsedGeozone, LatLng } from "../../../api/types";
import { serializeGeozonePoints } from "../../../api/types/geozones.types";

interface EditGeofenceDrawerProps {
  open: boolean;
  geozone: ParsedGeozone | null;
  /** Updated path if user dragged vertices on the map. */
  editedPath?: LatLng[] | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditGeofenceDrawer({
  open,
  geozone,
  editedPath,
  onClose,
  onUpdated,
}: EditGeofenceDrawerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Populate form when geozone changes
  useEffect(() => {
    if (open && geozone) {
      setName(geozone.geozone_name);
      setDescription(geozone.geozone_description);
      setError(null);
    }
  }, [open, geozone]);

  const updateMutation = useGuardedMutation(
    "can_edit_geofence",
    useCallback(async () => {
      if (!geozone) return;
      if (name.trim().length < 5) {
        setError("Name must be at least 5 characters.");
        return;
      }
      if (description.trim().length < 6) {
        setError("Description must be at least 6 characters.");
        return;
      }
      setError(null);

      const pathToSave = editedPath && editedPath.length >= 3 ? editedPath : geozone.path;

      const res = await updateGeozone(geozone.geozone_uid, {
        new_geozone_name: name.trim(),
        new_geozone_decription: description.trim(),
        new_geozone_points: serializeGeozonePoints(pathToSave),
      });

      if (res.status === "success") {
        onUpdated?.();
        onClose();
      } else {
        setError(res.message || "Failed to update geofence.");
      }
    }, [geozone, name, description, editedPath, onUpdated, onClose]),
  );

  if (!open || !geozone) return null;

  const currentPath = editedPath && editedPath.length >= 3 ? editedPath : geozone.path;
  const pathChanged = editedPath && editedPath.length >= 3;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-[400px] max-w-full bg-white h-full flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9EDEF] shrink-0">
          <div>
            <div className="font-black text-[15px] text-[#111B21]">Edit Geofence</div>
            <div className="text-[11px] text-[#667781] mt-0.5">
              {geozone.geozone_name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#F0F2F5] border border-[#E9EDEF] text-[#667781] font-black text-[13px] cursor-pointer grid place-items-center"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-5 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#667781] mb-1">
              Geofence Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] outline-none focus:border-[#128C7E]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#667781] mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] outline-none focus:border-[#128C7E] resize-none"
            />
          </div>

          {/* Polygon status */}
          <div className="bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl p-3">
            <div className="text-[11px] font-extrabold text-[#667781] mb-1">Polygon</div>
            <div className="text-[11px] text-[#111B21]">
              {currentPath.length} coordinate points
            </div>
            {pathChanged && (
              <div className="mt-1 text-[10px] font-extrabold text-[#128C7E]">
                Vertices updated on map — changes will be saved
              </div>
            )}
            <div className="mt-1 text-[10px] text-[#667781]">
              Tip: Click "Edit on Map" in the list card, then drag vertices to reshape.
            </div>
          </div>

          {error && (
            <div className="text-[11px] text-[#B00020] bg-[#FFF5F5] border border-[#FFD6D6] rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-3 border-t border-[#E9EDEF] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 rounded-lg border border-[#E9EDEF] bg-white text-[12px] font-extrabold text-[#667781] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => updateMutation.invoke()}
            disabled={updateMutation.state === "loading"}
            className="flex-1 h-9 rounded-lg border-0 bg-[#128C7E] text-white text-[12px] font-extrabold cursor-pointer hover:bg-[#0D7466] disabled:opacity-50"
          >
            {updateMutation.state === "loading" ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
