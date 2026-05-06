'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

interface Participant {
  id: string
  username: string | null
  displayName: string | null
  walletAddress: string | null
}

interface AdminConversation {
  id: string
  updatedAt: string
  participant1: Participant
  participant2: Participant
  messages: { content: string; createdAt: string }[]
  _count: { messages: number }
}

interface AdminMessage {
  id: string
  content: string
  createdAt: string
  flagged: boolean
  sender: { id: string; username: string | null; displayName: string | null }
}

function label(p: Participant) {
  return p.displayName ?? p.username ?? p.walletAddress?.slice(0, 10) ?? p.id.slice(0, 10)
}

function AdminMessagesPageInner() {
  const { privyUser } = useUser()
  const searchParams = useSearchParams()
  const userIdFilter = searchParams.get('userId') ?? ''
  const [conversations, setConversations] = useState<AdminConversation[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)

  const fetchConversations = useCallback(() => {
    if (!privyUser?.id) return
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      ...(search && { search }),
      ...(userIdFilter && { userId: userIdFilter }),
    })
    fetch(`/api/admin/messages?${params}`, { headers: { 'x-privy-user-id': privyUser.id } })
      .then((r) => r.json())
      .then((d) => {
        setConversations(d.conversations ?? [])
        setTotal(d.total ?? 0)
        setPages(d.pages ?? 1)
      })
      .finally(() => setLoading(false))
  }, [privyUser?.id, page, search, userIdFilter])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  async function openConversation(id: string) {
    if (!privyUser?.id) return
    setActiveId(id)
    setLoadingMsgs(true)
    const res = await fetch(`/api/admin/messages/${id}`, { headers: { 'x-privy-user-id': privyUser.id } })
    if (res.ok) {
      const data = await res.json()
      setMessages(data.messages ?? [])
    }
    setLoadingMsgs(false)
  }

  async function toggleFlag(messageId: string, current: boolean) {
    if (!privyUser?.id || !activeId) return
    await fetch(`/api/admin/messages/${activeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-privy-user-id': privyUser.id },
      body: JSON.stringify({ messageId, flagged: !current }),
    })
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, flagged: !current } : m))
  }

  const activeConv = conversations.find((c) => c.id === activeId)

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">Admin</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Messages <span className="text-lg text-white/25 font-normal">{total}</span>
          </h1>
          {userIdFilter && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
                Filtered by user
              </span>
              <a href="/admin/messages" className="text-[10px] text-white/25 font-mono hover:text-white/50 transition-colors">
                Clear filter
              </a>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
            placeholder="Search username, wallet, content..."
            className="w-64 bg-[#111114] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/30 transition-colors"
          />
          <button
            onClick={() => { setSearch(searchInput); setPage(1) }}
            className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:text-white hover:bg-white/10 transition-all"
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex gap-4" style={{ height: '580px' }}>

        {/* Conversation list */}
        <div className="w-80 shrink-0 bg-[#111114] border border-white/[0.07] rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/[0.07]">
            <span className="text-[10px] font-mono text-white/25 tracking-[1px] uppercase">Conversations</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col gap-1 p-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-xs text-white/25 font-mono">No conversations</div>
              </div>
            ) : (
              conversations.map((conv) => {
                const last = conv.messages[0]
                const isActive = activeId === conv.id
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    className={`w-full px-4 py-3 text-left transition-colors border-b border-white/[0.04] last:border-0 ${
                      isActive ? 'bg-violet-500/[0.06] border-l-2 border-l-violet-400' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium text-white truncate">
                        {label(conv.participant1)} — {label(conv.participant2)}
                      </span>
                      <span className="text-[10px] text-white/20 font-mono ml-2 shrink-0">{conv._count.messages}msg</span>
                    </div>
                    {last && (
                      <div className="text-[11px] text-white/30 truncate font-mono">{last.content}</div>
                    )}
                    <div className="text-[10px] text-white/15 font-mono mt-0.5">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                )
              })
            )}
          </div>
          {pages > 1 && (
            <div className="px-4 py-3 border-t border-white/[0.07] flex items-center justify-between">
              <span className="text-[10px] text-white/25 font-mono">{page}/{pages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-[10px] px-2 py-1 rounded border border-white/10 text-white/40 disabled:opacity-30"
                >Prev</button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="text-[10px] px-2 py-1 rounded border border-white/10 text-white/40 disabled:opacity-30"
                >Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Message thread */}
        <div className="flex-1 bg-[#111114] border border-white/[0.07] rounded-xl overflow-hidden flex flex-col">
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div className="text-xs text-white/25 font-mono">Select a conversation to audit</div>
            </div>
          ) : (
            <>
              {activeConv && (
                <div className="px-5 py-3 border-b border-white/[0.07]">
                  <div className="text-sm font-semibold text-white">
                    {label(activeConv.participant1)} &amp; {label(activeConv.participant2)}
                  </div>
                  <div className="text-[10px] text-white/25 font-mono mt-0.5">
                    {activeConv._count.messages} messages · last active {new Date(activeConv.updatedAt).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
                {loadingMsgs ? (
                  <div className="flex flex-col gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-8 rounded-lg bg-white/[0.03] animate-pulse" />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-xs text-white/20 font-mono">No messages</div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg group ${
                        msg.flagged ? 'bg-red-500/[0.06] border border-red-500/20' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-white/60">
                            {msg.sender.displayName ?? msg.sender.username ?? msg.sender.id.slice(0, 8)}
                          </span>
                          <span className="text-[10px] text-white/20 font-mono">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                          {msg.flagged && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/20">FLAGGED</span>
                          )}
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">{msg.content}</p>
                      </div>
                      <button
                        onClick={() => toggleFlag(msg.id, msg.flagged)}
                        className={`shrink-0 text-[10px] px-2 py-1 rounded border font-mono opacity-0 group-hover:opacity-100 transition-opacity ${
                          msg.flagged
                            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                            : 'border-white/10 text-white/30 hover:text-white/60'
                        }`}
                      >
                        {msg.flagged ? 'Unflag' : 'Flag'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </>
  )
}

export default function AdminMessagesPage() {
  return (
    <Suspense>
      <AdminMessagesPageInner />
    </Suspense>
  )
}
