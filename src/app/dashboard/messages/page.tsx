'use client'

import { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/shared/navbar/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'
import { useUser } from '@/hooks/useUser'

interface Participant {
  id: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
}

interface Message {
  id: string
  content: string
  createdAt: string
  isRead: boolean
  sender: Participant
}

interface Conversation {
  id: string
  updatedAt: string
  participant1: Participant
  participant2: Participant
  messages: Message[]
  unread: number
}

function Avatar({ user, size = 8 }: { user: Participant; size?: number }) {
  const initials = (user.displayName ?? user.username ?? '?').slice(0, 2).toUpperCase()
  return (
    <div className={`w-${size} h-${size} rounded-full bg-lime-400/20 overflow-hidden relative flex items-center justify-center text-xs font-bold text-lime-400 shrink-0`}>
      {user.avatarUrl ? (
        <Image src={user.avatarUrl} alt="" fill className="object-cover" unoptimized />
      ) : initials}
    </div>
  )
}

function MessagesPageInner() {
  const { privyUser, dbUser, ready, authenticated } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeId = searchParams.get('c')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (ready && !authenticated) router.push('/')
  }, [ready, authenticated, router])

  const fetchConversations = useCallback(async () => {
    if (!privyUser?.id) return
    setLoadingConvs(true)
    try {
      const res = await fetch('/api/messages', { headers: { 'x-privy-user-id': privyUser.id } })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations ?? [])
      }
    } finally {
      setLoadingConvs(false)
    }
  }, [privyUser?.id])

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!privyUser?.id) return
    setLoadingMsgs(true)
    const res = await fetch(`/api/messages/${conversationId}`, {
      headers: { 'x-privy-user-id': privyUser.id },
    })
    if (!res.ok) { setLoadingMsgs(false); return }
    const data = await res.json()
    setMessages(data.messages ?? [])
    setActiveConv(data.conversation)
    setLoadingMsgs(false)
    // clear unread badge locally
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c))
    )
  }, [privyUser?.id])

  // initial load
  useEffect(() => { fetchConversations() }, [fetchConversations])

  // load messages when active conversation changes
  useEffect(() => {
    if (activeId) fetchMessages(activeId)
    else { setMessages([]); setActiveConv(null) }
  }, [activeId, fetchMessages])

  // scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 10-second polling
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      fetchConversations()
      if (activeId) fetchMessages(activeId)
    }, 10000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [activeId, fetchConversations, fetchMessages])

  async function sendMessage() {
    if (!input.trim() || !activeId || !privyUser?.id) return
    setSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-privy-user-id': privyUser.id },
      body: JSON.stringify({ conversationId: activeId, content: input.trim() }),
    })
    if (res.ok) {
      setInput('')
      await fetchMessages(activeId)
      await fetchConversations()
    }
    setSending(false)
  }

  function selectConv(id: string) {
    router.push(`/dashboard/messages?c=${id}`, { scroll: false })
  }

  function getOther(conv: Conversation): Participant {
    return conv.participant1.id === dbUser?.id ? conv.participant2 : conv.participant1
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-xs text-white/25 font-mono tracking-widest animate-pulse">LOADING...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 pt-10 pb-24 flex gap-8">
        <Sidebar />

        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <div className="text-xs text-white/25 font-mono tracking-[2px] uppercase mb-2">Dashboard</div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Messages</h1>
          </div>

          <div className="bg-[#111114] border border-white/[0.07] rounded-xl overflow-hidden flex" style={{ height: '600px' }}>

            {/* LEFT — conversation list */}
            <div className="w-72 shrink-0 border-r border-white/[0.07] flex flex-col">
              <div className="px-4 py-3 border-b border-white/[0.07]">
                <span className="text-[10px] font-mono text-white/25 tracking-[1px] uppercase">Conversations</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loadingConvs ? (
                  <div className="flex flex-col gap-1 p-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-14 rounded-lg bg-white/[0.03] animate-pulse" />
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="text-2xl mb-3 opacity-20">◎</div>
                    <div className="text-xs text-white/25 font-mono">No conversations yet</div>
                    <div className="text-[11px] text-white/15 font-mono mt-1">Message a seller from a listing page</div>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const other = getOther(conv)
                    const last = conv.messages[0]
                    const isActive = activeId === conv.id
                    return (
                      <button
                        key={conv.id}
                        onClick={() => selectConv(conv.id)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                          isActive ? 'bg-lime-400/[0.06] border-r-2 border-lime-400' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <Avatar user={other} size={8} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-sm font-medium text-white truncate">
                              {other.displayName ?? other.username ?? 'Unknown'}
                            </span>
                            {conv.unread > 0 && (
                              <span className="ml-2 shrink-0 w-4 h-4 rounded-full bg-lime-400 text-black text-[10px] font-bold flex items-center justify-center">
                                {conv.unread > 9 ? '9+' : conv.unread}
                              </span>
                            )}
                          </div>
                          {last && (
                            <div className="text-[11px] text-white/30 truncate font-mono">
                              {last.sender.id === dbUser?.id ? 'You: ' : ''}{last.content}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* RIGHT — message thread */}
            <div className="flex-1 flex flex-col min-w-0">
              {!activeId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                  <div className="text-3xl mb-4 opacity-10">◎</div>
                  <div className="text-sm text-white/25 font-mono">Select a conversation</div>
                </div>
              ) : (
                <>
                  {/* thread header */}
                  {activeConv && (
                    <div className="px-5 py-3 border-b border-white/[0.07] flex items-center gap-3">
                      <Avatar user={getOther(activeConv)} size={8} />
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {getOther(activeConv).displayName ?? getOther(activeConv).username}
                        </div>
                        {getOther(activeConv).username && (
                          <div className="text-[10px] text-white/25 font-mono">@{getOther(activeConv).username}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                    {loadingMsgs ? (
                      <div className="flex flex-col gap-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={`h-8 rounded-xl bg-white/[0.03] animate-pulse ${i % 2 === 0 ? 'w-2/3' : 'w-1/2 self-end'}`} />
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-xs text-white/20 font-mono">No messages yet — say hello</div>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const mine = msg.sender.id === dbUser?.id
                        return (
                          <div key={msg.id} className={`flex gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
                            {!mine && <Avatar user={msg.sender} size={7} />}
                            <div
                              className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                mine
                                  ? 'bg-lime-400 text-black rounded-tr-sm'
                                  : 'bg-white/[0.06] text-white/80 rounded-tl-sm'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* input */}
                  <div className="px-4 py-3 border-t border-white/[0.07] flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/30 transition-colors"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || sending}
                      className="px-4 py-2.5 rounded-lg bg-lime-400 text-black font-semibold text-sm hover:bg-lime-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sending ? '...' : 'Send'}
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesPageInner />
    </Suspense>
  )
}
