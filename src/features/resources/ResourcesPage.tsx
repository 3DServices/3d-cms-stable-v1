/**
 * ResourcesPage — group a client's geofences, geofence groups and event rules
 * into resources, and choose which of the client's users can use them.
 *
 * What a resource does in OLIWA and the mobile app:
 *   - elements in no resource are visible to the client's whole team (as before);
 *   - elements in a resource are visible to the client's administrators and to
 *     the users it is shared with — nobody else on the team;
 *   - "View" lets a user see and use an element, "Manage" also lets them change it.
 *
 * Backend: navas-core-apis endpoints/resources.py (/resources/admin/...).
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError, getAllClients, listResources, getResourceCatalog, getResource,
  createResource, updateResource, deleteResource, setResourceItems, setResourceAccess,
} from "../../api";
import type {
  Client, ResourceSummary, ResourceCatalog, ResourceDetail,
  ResourceItemType, ResourceAccessLevel,
} from "../../api";
import { usePermissions } from "../../auth/PermissionsContext";
import { PermissionGate } from "../../auth/PermissionGate";
import { ErrorBanner, Field, INPUT_CLS, SELECT_CLS } from "../rbac/components/wizard/WizardShared";

const KIND_ORDER: ResourceItemType[] = ["geozone", "geozone_group", "event_rule"];
const KIND_TITLES: Record<ResourceItemType, string> = {
  geozone: "Geofences",
  geozone_group: "Geofence groups",
  event_rule: "Event rules",
};

type Tab = "Elements" | "Access";
type Grant = ResourceAccessLevel | "none";

function errorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.apiMessage ?? err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

const itemKey = (kind: ResourceItemType, uid: string) => `${kind}:${uid}`;

export function ResourcesPage() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("can_create_resource_template");
  const canEdit = hasPermission("can_edit_resource_template");
  const canShare = canEdit || hasPermission("can_share_resource_template");

  const [clients, setClients] = useState<Client[]>([]);
  const [clientUid, setClientUid] = useState("");
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [catalog, setCatalog] = useState<ResourceCatalog | null>(null);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [detail, setDetail] = useState<ResourceDetail | null>(null);
  const [tab, setTab] = useState<Tab>("Elements");

  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editor, setEditor] = useState<{ mode: "create" | "edit"; name: string; description: string } | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Draft selections for the two tabs, reset whenever the resource reloads.
  const [draftItems, setDraftItems] = useState<Set<string>>(new Set());
  const [draftGrants, setDraftGrants] = useState<Record<string, Grant>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAllClients()
      .then(res => { if (!cancelled) setClients(res.data ?? []); })
      .catch(err => { if (!cancelled) setError(errorText(err, "Couldn't load clients.")); })
      .finally(() => { if (!cancelled) setLoadingClients(false); });
    return () => { cancelled = true; };
  }, []);

  const loadClient = useCallback(async (uid: string, keepSelection?: string | null) => {
    if (!uid) return;
    setLoadingList(true);
    setError(null);
    try {
      const [list, cat] = await Promise.all([listResources(uid), getResourceCatalog(uid)]);
      setResources(list.data ?? []);
      setCatalog(cat.data ?? null);
      const still = keepSelection && (list.data ?? []).some(r => r.resource_uid === keepSelection);
      setSelectedUid(still ? keepSelection! : (list.data ?? [])[0]?.resource_uid ?? null);
    } catch (err) {
      setResources([]);
      setCatalog(null);
      setSelectedUid(null);
      setError(errorText(err, "Couldn't load this client's resources."));
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    setDetail(null);
    setSelectedUid(null);
    setNotice(null);
    if (clientUid) loadClient(clientUid);
  }, [clientUid, loadClient]);

  const loadDetail = useCallback(async (uid: string) => {
    setLoadingDetail(true);
    try {
      const res = await getResource(uid);
      const d = res.data;
      setDetail(d);
      const items = new Set<string>();
      KIND_ORDER.forEach(kind => (d.items[kind] ?? []).forEach(i => items.add(itemKey(kind, i.uid))));
      setDraftItems(items);
      const grants: Record<string, Grant> = {};
      d.access.forEach(a => { grants[a.account_uid] = a.access_level; });
      setDraftGrants(grants);
    } catch (err) {
      setDetail(null);
      setError(errorText(err, "Couldn't load the resource."));
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    setSearch("");
    if (selectedUid) loadDetail(selectedUid);
    else setDetail(null);
  }, [selectedUid, loadDetail]);

  const client = clients.find(c => c.client_uid === clientUid);

  const savedItems = useMemo(() => {
    const s = new Set<string>();
    if (detail) KIND_ORDER.forEach(kind => (detail.items[kind] ?? []).forEach(i => s.add(itemKey(kind, i.uid))));
    return s;
  }, [detail]);
  const itemsDirty = savedItems.size !== draftItems.size || [...draftItems].some(k => !savedItems.has(k));

  const savedGrants = useMemo(() => {
    const g: Record<string, Grant> = {};
    detail?.access.forEach(a => { g[a.account_uid] = a.access_level; });
    return g;
  }, [detail]);
  const grantsDirty = (catalog?.users ?? []).some(u => (draftGrants[u.account_uid] ?? "none") !== (savedGrants[u.account_uid] ?? "none"));

  // ── Actions ────────────────────────────────────────────────────────────────

  const openCreate = () => { setEditorError(null); setEditor({ mode: "create", name: "", description: "" }); };
  const openEdit = () => {
    if (!detail) return;
    setEditorError(null);
    setEditor({ mode: "edit", name: detail.resource_name, description: detail.resource_description });
  };

  const saveEditor = async () => {
    if (!editor) return;
    const name = editor.name.trim();
    if (name.length < 2) { setEditorError("Give the resource a name of at least 2 characters."); return; }
    setSaving(true);
    setEditorError(null);
    try {
      if (editor.mode === "create") {
        const res = await createResource({ client_uid: clientUid, resource_name: name, resource_description: editor.description.trim() });
        await loadClient(clientUid, res.data.resource_uid);
        setNotice(`Created "${name}". Now choose its elements and who can use it.`);
      } else if (detail) {
        await updateResource(detail.resource_uid, { resource_name: name, resource_description: editor.description.trim() });
        await loadClient(clientUid, detail.resource_uid);
        await loadDetail(detail.resource_uid);
        setNotice("Resource updated.");
      }
      setEditor(null);
    } catch (err) {
      setEditorError(errorText(err, "Couldn't save the resource."));
    } finally {
      setSaving(false);
    }
  };

  const removeResource = async () => {
    if (!detail) return;
    const ok = window.confirm(
      `Delete "${detail.resource_name}"?\n\nIts geofences, groups and rules are not deleted — ` +
      `they become visible to all of ${client?.client_name ?? "the client"}'s users again.`);
    if (!ok) return;
    setSaving(true);
    try {
      await deleteResource(detail.resource_uid);
      setNotice(`Deleted "${detail.resource_name}".`);
      await loadClient(clientUid, null);
    } catch (err) {
      setError(errorText(err, "Couldn't delete the resource."));
    } finally {
      setSaving(false);
    }
  };

  const saveItems = async () => {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      const items = [...draftItems].map(k => {
        const [kind, ...rest] = k.split(":");
        return { item_type: kind as ResourceItemType, item_uid: rest.join(":") };
      });
      const res = await setResourceItems(detail.resource_uid, items);
      const moved = res.data.moved ?? [];
      await loadClient(clientUid, detail.resource_uid);
      await loadDetail(detail.resource_uid);
      setNotice(moved.length
        ? `Saved. ${moved.length} element${moved.length === 1 ? " was" : "s were"} moved here from ${[...new Set(moved.map(m => `"${m.from_resource}"`))].join(", ")}.`
        : "Elements saved.");
    } catch (err) {
      setError(errorText(err, "Couldn't save the elements."));
    } finally {
      setSaving(false);
    }
  };

  const saveGrants = async () => {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      const access = Object.entries(draftGrants)
        .filter(([, level]) => level !== "none")
        .map(([account_uid, level]) => ({ account_uid, access_level: level as ResourceAccessLevel }));
      await setResourceAccess(detail.resource_uid, access);
      await loadClient(clientUid, detail.resource_uid);
      await loadDetail(detail.resource_uid);
      setNotice(`Access saved — shared with ${access.length} user${access.length === 1 ? "" : "s"}.`);
    } catch (err) {
      setError(errorText(err, "Couldn't save access."));
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = (kind: ResourceItemType, uid: string) => {
    setDraftItems(prev => {
      const next = new Set(prev);
      const k = itemKey(kind, uid);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const q = search.trim().toLowerCase();
  // Inputs are locked while a save or reload is in flight, so an edit can't be
  // overwritten by the reload that follows a save.
  const busy = saving || loadingDetail;

  return (
    <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden relative">
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-3 p-3">

          {error && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
              <span className="text-[12px] text-[#EF4444] font-black">{error}</span>
              <button onClick={() => setError(null)} className="text-[#EF4444] text-[14px] font-black bg-transparent border-none cursor-pointer hover:opacity-70">X</button>
            </div>
          )}
          {notice && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
              <span className="text-[12px] text-[#065F46] font-black">{notice}</span>
              <button onClick={() => setNotice(null)} className="text-[#065F46] text-[14px] font-black bg-transparent border-none cursor-pointer hover:opacity-70">X</button>
            </div>
          )}

          {/* Header */}
          <div className="bg-white border border-[#E9EDEF] rounded-xl px-4 py-3">
            <div className="text-[11px] text-[#667781] mb-0.5">Governance &#9656; Resources</div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-black text-[16px] text-[#111B21]">Resources</div>
                <div className="text-[11px] text-[#667781] mt-0.5 max-w-[640px]">
                  Group a client's geofences, geofence groups and event rules, and choose which of its users can use them in OLIWA and the mobile app.
                  Elements in no resource stay visible to the client's whole team; the client's administrators always see everything.
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={clientUid}
                  onChange={e => setClientUid(e.target.value)}
                  disabled={loadingClients}
                  className={`${SELECT_CLS} w-[260px]`}
                  aria-label="Client"
                >
                  <option value="">{loadingClients ? "Loading clients..." : "Choose a client..."}</option>
                  {clients.map(c => <option key={c.client_uid} value={c.client_uid}>{c.client_name}</option>)}
                </select>
                {canCreate && (
                  <button
                    onClick={openCreate}
                    disabled={!clientUid}
                    className="h-9 px-4 rounded-lg bg-[#25D366] text-[#075E54] text-[12px] font-black border-none cursor-pointer hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    + New resource
                  </button>
                )}
              </div>
            </div>
          </div>

          {!clientUid ? (
            <EmptyCard title="Choose a client" text="Resources belong to one client. Pick the client whose geofences and rules you want to organise." />
          ) : loadingList && !catalog ? (
            <EmptyCard title="Loading..." text={`Loading ${client?.client_name ?? "the client"}'s resources.`} />
          ) : (
            <div className="grid grid-cols-[300px_1fr] gap-3 items-start">

              {/* Resource list */}
              <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E9EDEF] flex items-center justify-between">
                  <span className="font-black text-[13px] text-[#111B21]">{client?.client_name}</span>
                  <span className="text-[11px] font-black text-[#667781]">{resources.length} resource{resources.length === 1 ? "" : "s"}</span>
                </div>
                {resources.length === 0 ? (
                  <div className="px-4 py-6 text-[12px] text-[#667781]">
                    No resources yet. Everything this client has is visible to all of its users.
                    {canCreate && <> Use <b>+ New resource</b> to start.</>}
                  </div>
                ) : resources.map(r => (
                  <button
                    key={r.resource_uid}
                    onClick={() => setSelectedUid(r.resource_uid)}
                    className={`w-full text-left px-4 py-3 border-b border-[#F0F2F5] last:border-b-0 cursor-pointer border-x-0 border-t-0 transition-colors ${selectedUid === r.resource_uid ? "bg-[#EAF7F3]" : "bg-white hover:bg-[#F8FAFC]"}`}
                  >
                    <div className="font-black text-[12px] text-[#111B21] truncate">{r.resource_name}</div>
                    {r.resource_description && <div className="text-[11px] text-[#667781] truncate">{r.resource_description}</div>}
                    <div className="flex gap-2 mt-1">
                      <Badge>{r.item_count} element{r.item_count === 1 ? "" : "s"}</Badge>
                      <Badge>{r.user_count} user{r.user_count === 1 ? "" : "s"}</Badge>
                    </div>
                  </button>
                ))}
              </div>

              {/* Detail */}
              {!selectedUid ? (
                <EmptyCard title="No resource selected" text="Select a resource on the left, or create one." />
              ) : !detail || detail.resource_uid !== selectedUid ? (
                <EmptyCard title="Loading..." text="Loading the resource." />
              ) : (
                <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-[#075E54] flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-black text-[15px] text-white truncate">{detail.resource_name}</div>
                      <div className="text-[11px] text-white/75">{detail.resource_description || "No description"}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <PermissionGate permission="can_edit_resource_template">
                        <button onClick={openEdit} className="h-7 px-3 rounded-full text-[11px] font-black border-none cursor-pointer bg-white text-[#075E54] hover:brightness-95">Rename</button>
                        <button onClick={removeResource} disabled={saving} className="h-7 px-3 rounded-full text-[11px] font-black border-none cursor-pointer bg-[#EF4444] text-white hover:brightness-105 disabled:opacity-50">Delete</button>
                      </PermissionGate>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 border-b border-[#E9EDEF] flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                      {(["Elements", "Access"] as Tab[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setTab(t)}
                          className={`h-8 px-3 rounded-full text-[11px] font-black border-none cursor-pointer transition-all ${tab === t ? "bg-[#128C7E] text-white" : "bg-[#F0F2F5] text-[#667781] hover:bg-[#E9EDEF]"}`}
                        >
                          {t === "Elements" ? `Elements (${draftItems.size})` : `Access (${Object.values(draftGrants).filter(v => v !== "none").length})`}
                        </button>
                      ))}
                    </div>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder={tab === "Elements" ? "Search geofences, groups, rules..." : "Search users..."}
                      className="h-8 w-[240px] px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-[#F8FAFC] outline-none focus:border-[#128C7E]"
                    />
                  </div>

                  {tab === "Elements" ? (
                    <div className="p-4 flex flex-col gap-3">
                      {KIND_ORDER.map(kind => {
                        const all = catalog?.elements[kind] ?? [];
                        const shown = all.filter(e => !q || String(e.name ?? e.uid).toLowerCase().includes(q));
                        const inHere = all.filter(e => draftItems.has(itemKey(kind, e.uid))).length;
                        return (
                          <div key={kind} className="border border-[#E9EDEF] rounded-xl overflow-hidden">
                            <div className="px-4 py-2 bg-[#F8FAFC] border-b border-[#E9EDEF] flex items-center justify-between">
                              <span className="font-black text-[12px] text-[#111B21]">{KIND_TITLES[kind]}</span>
                              <span className="text-[11px] text-[#667781] font-black">{inHere} of {all.length} in this resource</span>
                            </div>
                            {shown.length === 0 ? (
                              <div className="px-4 py-3 text-[11px] text-[#667781]">
                                {all.length === 0 ? `${client?.client_name ?? "This client"} has no ${KIND_TITLES[kind].toLowerCase()}.` : "Nothing matches the search."}
                              </div>
                            ) : (
                              <div className="max-h-[260px] overflow-y-auto">
                                {shown.map(e => {
                                  const checked = draftItems.has(itemKey(kind, e.uid));
                                  const elsewhere = e.resource_uid && e.resource_uid !== detail.resource_uid ? e.resource_name : null;
                                  return (
                                    <label key={e.uid} className={`flex items-center gap-3 px-4 py-2 border-b border-[#F0F2F5] last:border-b-0 ${canEdit ? "cursor-pointer hover:bg-[#F8FAFC]" : "cursor-default"}`}>
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        disabled={!canEdit || busy}
                                        onChange={() => toggleItem(kind, e.uid)}
                                        className="accent-[#128C7E] w-4 h-4"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <div className="text-[12px] font-black text-[#111B21] truncate">{e.name || e.uid}</div>
                                        <div className="text-[10px] text-[#667781] truncate">
                                          Created by {e.owner_name ?? (e.owner_uid === clientUid ? "the account" : e.owner_uid)}
                                        </div>
                                      </div>
                                      {elsewhere && (
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${checked ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#F0F2F5] text-[#667781]"}`}>
                                          {checked ? `moves from "${elsewhere}"` : `in "${elsewhere}"`}
                                        </span>
                                      )}
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {canEdit && (
                        <SaveBar dirty={itemsDirty} saving={saving} onSave={saveItems} onReset={() => setDraftItems(new Set(savedItems))}
                          hint="An element is in one resource at a time. Unticked elements go back to being visible to the whole team." />
                      )}
                    </div>
                  ) : (
                    <div className="p-4 flex flex-col gap-3">
                      <div className="border border-[#E9EDEF] rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-[#F8FAFC] border-b border-[#E9EDEF]">
                            <tr className="text-[11px] font-black text-[#667781]">
                              <th className="px-4 py-2">User</th>
                              <th className="px-4 py-2">Role</th>
                              <th className="px-4 py-2 w-[220px]">Access to this resource</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(catalog?.users ?? [])
                              .filter(u => !q || [u.display_name, u.username, u.email].some(v => String(v ?? "").toLowerCase().includes(q)))
                              .map(u => (
                                <tr key={u.account_uid} className="border-b border-[#F0F2F5] last:border-b-0">
                                  <td className="px-4 py-2">
                                    <div className="text-[12px] font-black text-[#111B21]">{u.display_name || u.username || u.account_uid}</div>
                                    <div className="text-[10px] text-[#667781]">{u.username}{u.email ? ` · ${u.email}` : ""}{u.status && u.status !== "active" ? ` · ${u.status}` : ""}</div>
                                  </td>
                                  <td className="px-4 py-2 text-[11px] text-[#667781]">{u.role ?? "—"}</td>
                                  <td className="px-4 py-2">
                                    {u.sees_everything ? (
                                      <span className="text-[10px] font-black px-2 py-1 rounded-full bg-[#EAF7F3] text-[#075E54]">Account admin — sees everything</span>
                                    ) : (
                                      <select
                                        value={draftGrants[u.account_uid] ?? "none"}
                                        disabled={!canShare || busy}
                                        onChange={e => setDraftGrants(prev => ({ ...prev, [u.account_uid]: e.target.value as Grant }))}
                                        className={SELECT_CLS}
                                        aria-label={`Access for ${u.display_name ?? u.username ?? u.account_uid}`}
                                      >
                                        <option value="none">No access</option>
                                        <option value="view">View — see and use</option>
                                        <option value="manage">Manage — also change</option>
                                      </select>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            {(catalog?.users ?? []).length === 0 && (
                              <tr><td colSpan={3} className="px-4 py-4 text-[12px] text-[#667781]">This client has no users yet.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      {canShare && (
                        <SaveBar dirty={grantsDirty} saving={saving} onSave={saveGrants}
                          onReset={() => setDraftGrants({ ...savedGrants })}
                          hint="Users with no access don't see this resource's elements at all. Creators always keep what they made." />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {editor && (
        <div className="fixed inset-0 bg-black/35 z-50 grid place-items-center" onClick={() => !saving && setEditor(null)}>
          <div className="w-[440px] bg-white rounded-2xl overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 bg-[#075E54]">
              <div className="font-black text-[14px] text-white">{editor.mode === "create" ? "New resource" : "Rename resource"}</div>
              <div className="text-[11px] text-white/75">{client?.client_name}</div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {editorError && <ErrorBanner message={editorError} />}
              <Field label="Name" required>
                <input
                  autoFocus
                  value={editor.name}
                  maxLength={120}
                  onChange={e => setEditor({ ...editor, name: e.target.value })}
                  onKeyDown={e => { if (e.key === "Enter") saveEditor(); }}
                  placeholder="e.g. Kampala depots"
                  className={INPUT_CLS}
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={editor.description}
                  onChange={e => setEditor({ ...editor, description: e.target.value })}
                  rows={3}
                  placeholder="What these elements are for"
                  className={`${INPUT_CLS} h-auto py-2 resize-none`}
                />
              </Field>
            </div>
            <div className="px-5 py-3 border-t border-[#E9EDEF] flex justify-end gap-2">
              <button onClick={() => setEditor(null)} disabled={saving} className="h-9 px-4 rounded-lg bg-white border border-[#E9EDEF] text-[12px] font-black text-[#111B21] cursor-pointer hover:bg-[#F8FAFC]">Cancel</button>
              <button onClick={saveEditor} disabled={saving} className="h-9 px-4 rounded-lg bg-[#128C7E] text-white text-[12px] font-black border-none cursor-pointer hover:bg-[#0D7466] disabled:opacity-50">
                {saving ? "Saving..." : editor.mode === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#F0F2F5] text-[#667781]">{children}</span>;
}

function EmptyCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white border border-[#E9EDEF] rounded-xl px-6 py-10 text-center">
      <div className="font-black text-[14px] text-[#111B21]">{title}</div>
      <div className="text-[12px] text-[#667781] mt-1">{text}</div>
    </div>
  );
}

function SaveBar({ dirty, saving, onSave, onReset, hint }: {
  dirty: boolean; saving: boolean; onSave: () => void; onReset: () => void; hint: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-[#667781]">{hint}</span>
      <div className="flex gap-2 shrink-0">
        <button onClick={onReset} disabled={!dirty || saving} className="h-9 px-4 rounded-lg bg-white border border-[#E9EDEF] text-[12px] font-black text-[#111B21] cursor-pointer hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed">Undo changes</button>
        <button onClick={onSave} disabled={!dirty || saving} className="h-9 px-4 rounded-lg bg-[#128C7E] text-white text-[12px] font-black border-none cursor-pointer hover:bg-[#0D7466] disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
