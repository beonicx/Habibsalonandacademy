"use client";
import { useState, useEffect, useCallback } from "react";
import { MessageSquare, ChevronLeft, ChevronRight, Trash2, Archive, Reply, X, Loader } from "lucide-react";
import { contacts } from "../../../lib/adminApi";

const STATUS_FILTERS = ["all", "new", "read", "replied", "archived"];

const statusStyle = {
  new: "bg-blue-100 text-blue-700",
  read: "bg-gray-100 text-gray-700",
  replied: "bg-green-100 text-green-700",
  archived: "bg-yellow-100 text-yellow-700",
};

export default function AdminContactsPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [expanded, setExpanded] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await contacts.getAll(params);
      if (res.success) {
        setMessages(res.data || []);
        setPagination(res.pagination || { pages: 1, total: 0 });
      } else { setError("Failed to load messages"); }
    } catch { setError("Failed to load messages"); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  function toggleExpand(id) {
    setExpanded(expanded === id ? null : id);
    setReplyText("");
  }

  async function handleReply(id) {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await contacts.reply(id, replyText.trim());
      setReplyText("");
      setExpanded(null);
      await load();
    } catch { setError("Failed to send reply"); }
    finally { setReplying(false); }
  }

  async function handleArchive(id) {
    try {
      await contacts.archive(id);
      await load();
    } catch { setError("Failed to archive"); }
  }

  async function handleDelete(id) {
    try {
      await contacts.delete(id);
      setDeleteConfirm(null);
      if (expanded === id) setExpanded(null);
      await load();
    } catch { setError("Failed to delete"); }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-600 mt-1">Contact form submissions and enquiries</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-[#C9956B] text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-[#C9956B]"}`}>
            {s}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader size={24} className="animate-spin text-[#C9956B]" /></div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare size={40} className="text-gray-500 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map(msg => (
              <div key={msg._id}>
                <div className="px-4 lg:px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(msg._id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-medium text-gray-900">{msg.name}</span>
                      <span className={`text-xs uppercase font-medium px-2 py-0.5 rounded-full ${statusStyle[msg.status] || statusStyle.new}`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-base text-gray-700 truncate">{msg.subject}</p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap hidden sm:block">
                    {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <div className="flex gap-1">
                    {msg.status !== "archived" && (
                      <button onClick={e => { e.stopPropagation(); handleArchive(msg._id); }}
                        className="p-1.5 text-gray-500 hover:text-yellow-600 rounded" title="Archive">
                        <Archive size={14} />
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); setDeleteConfirm(msg._id); }}
                      className="p-1.5 text-gray-500 hover:text-red-500 rounded" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {expanded === msg._id && (
                  <div className="px-4 lg:px-6 pb-4 bg-gray-50 border-t border-gray-100">
                    <div className="py-4 space-y-3 text-base">
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-600">
                        <span>Email: <span className="text-gray-800">{msg.email}</span></span>
                        {msg.phone && <span>Phone: <span className="text-gray-800">{msg.phone}</span></span>}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase mb-1">Message</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                      </div>

                      {msg.reply && (
                        <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                          <p className="text-xs font-medium text-green-700 mb-1">
                            Reply — {msg.repliedAt ? new Date(msg.repliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                          </p>
                          <p className="text-green-800 text-sm">{msg.reply}</p>
                        </div>
                      )}

                      {msg.status !== "replied" && msg.status !== "archived" && (
                        <div className="pt-2 space-y-2">
                          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3}
                            placeholder="Write your reply..."
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B] resize-none" />
                          <button onClick={() => handleReply(msg._id)} disabled={replying || !replyText.trim()}
                            className="inline-flex items-center gap-1.5 bg-[#C9956B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#A67050] disabled:opacity-50">
                            <Reply size={14} /> {replying ? "Sending..." : "Send Reply"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-600">{pagination.total} messages</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span className="text-gray-700">{page} / {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <Trash2 size={32} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Message?</h3>
            <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
