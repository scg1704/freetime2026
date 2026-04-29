// source/fulltimer/pages/MessagesPage.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Send, CheckCheck, Check } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { backHandlers } from '../../shared/components/Layout';

const PRIMARY = '#7D27BE';

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const INITIAL_CHATS = [
  {
    id: 1,
    name: 'Jose Pelaez',
    avatar: 'https://picsum.photos/seed/jose/200',
    task: 'Reparación de Grifo',
    online: true,
    messages: [
      { id: 1, from: 'them', text: 'Hola, vi tu publicación de la reparación del grifo.', time: '10:02', status: 'read' },
      { id: 2, from: 'them', text: '¿Sigue disponible la tarea?',                          time: '10:03', status: 'read' },
      { id: 3, from: 'me',   text: 'Sí, claro. ¿Cuándo podrías venir?',                   time: '10:05', status: 'read' },
      { id: 4, from: 'them', text: 'Podría el martes en la mañana, entre 8 y 10 am.',     time: '10:06', status: 'read' },
      { id: 5, from: 'me',   text: 'Perfecto, el martes a las 9 me queda bien.',           time: '10:08', status: 'read' },
      { id: 6, from: 'them', text: '¡Listo! Nos vemos el martes entonces 👍',              time: '10:09', status: 'read' },
    ],
  },
  {
    id: 2,
    name: 'María González',
    avatar: 'https://picsum.photos/seed/maria/200',
    task: 'Limpieza Apartamento',
    online: false,
    messages: [
      { id: 1, from: 'them', text: 'Buenos días, ¿el apartamento es de cuántas habitaciones?', time: '09:15', status: 'read' },
      { id: 2, from: 'me',   text: 'Son 2 habitaciones y 1 baño.',                              time: '09:20', status: 'read' },
      { id: 3, from: 'them', text: '¿Incluye cocina y áreas comunes?',                          time: '09:21', status: 'read' },
      { id: 4, from: 'me',   text: 'Sí, todo incluido.',                                        time: '09:22', status: 'read' },
      { id: 5, from: 'them', text: 'Ok, puedo hacerlo el sábado por $70.000.',                  time: '09:25', status: 'delivered' },
    ],
  },
  {
    id: 3,
    name: 'Carlos Martínez',
    avatar: 'https://picsum.photos/seed/carlos/200',
    task: 'Paseo de Perro',
    online: true,
    messages: [
      { id: 1, from: 'me',   text: 'Hola Carlos, ¿puedes pasear a mi perro mañana?',  time: 'Ayer', status: 'read' },
      { id: 2, from: 'them', text: 'Claro que sí, ¿a qué hora?',                      time: 'Ayer', status: 'read' },
      { id: 3, from: 'me',   text: 'A las 7 am si puedes.',                            time: 'Ayer', status: 'read' },
      { id: 4, from: 'them', text: '¡Perfecto! Ahí estaré.',                           time: 'Ayer', status: 'read' },
    ],
  },
  {
    id: 4,
    name: 'Laura Pérez',
    avatar: 'https://picsum.photos/seed/laura/200',
    task: 'Tutoría de Matemáticas',
    online: false,
    messages: [
      { id: 1, from: 'them', text: '¿El estudiante es de qué nivel?',                   time: 'Lun', status: 'read' },
      { id: 2, from: 'me',   text: 'Tercer semestre de ingeniería, cálculo diferencial.', time: 'Lun', status: 'read' },
      { id: 3, from: 'them', text: 'Perfecto, eso lo manejo bien.',                      time: 'Lun', status: 'read' },
    ],
  },
];

// ─── ChatView fuera del componente principal para evitar re-montajes ─────────
function ChatView({ chat, liveMessages, inputText, setInputText, onSend, onKeyDown }) {
  const scrollRef = useRef(null);

  // Efecto para controlar el scroll
  useEffect(() => {
    if (scrollRef.current) {
      // Usamos 'instant' para que al cambiar de chat no se vea el efecto de bajada
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'instant', 
      });
    }
  }, [chat.id]); // Solo se dispara INSTANTÁNEO al cambiar de chat

  useEffect(() => {
    if (scrollRef.current) {
      // Para mensajes nuevos mientras ya estás en el chat, puedes usar 'smooth' 
      // o dejarlo en 'instant' si prefieres que no haya animación en absoluto.
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [liveMessages]); // Se dispara cuando llega un mensaje nuevo

  return (
    <div className="flex flex-col h-full">
      {/* Header del chat */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-100"
        style={{ background: '#fafafa' }}
      >
        {/* ... (Contenido del header igual que antes) ... */}
        <div className="relative shrink-0">
          <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-2xl object-cover" />
          {chat.online && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm truncate" style={{ color: '#111827' }}>{chat.name}</h3>
          <p className="text-xs truncate" style={{ color: '#6b7280' }}>
            {chat.online ? 'En línea' : 'Desconectado'} · {chat.task}
          </p>
        </div>
      </div>

      {/* Contenedor de Mensajes: Ajustado para empujar hacia abajo */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col" // Añadido: flex flex-col
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Este div vacío con flex-1 empuja los mensajes hacia el fondo */}
        <div className="flex-1" /> 

        <div className="space-y-2"> {/* Contenedor interno para mantener el espaciado */}
          {liveMessages.map((msg, i) => {
            const isMe = msg.from === 'me';
            const showTime = i === 0 || liveMessages[i - 1].time !== msg.time;

            return (
              <div key={msg.id}>
                {showTime && i !== 0 && (
                  <div className="flex justify-center my-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ color: '#9ca3af', background: '#f9fafb' }}>
                      {msg.time}
                    </span>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-snug"
                    style={{
                      background:   isMe ? PRIMARY : '#f3f4f6',
                      color:         isMe ? '#fff'  : '#111827',
                      borderBottomRightRadius: isMe ? 6 : undefined,
                      borderBottomLeftRadius:  !isMe ? 6 : undefined,
                    }}
                  >
                    {msg.text}
                    {isMe && (
                      <span className="ml-2 inline-flex items-center opacity-70" style={{ verticalAlign: 'middle' }}>
                        {msg.status === 'sent'      && <Check className="w-3 h-3" />}
                        {msg.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                        {msg.status === 'read'      && <CheckCheck className="w-3 h-3 text-blue-300" />}
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input de mensaje */}
      {/* ... (Contenido del input igual que antes) ... */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-100 flex items-end gap-3" style={{ background: '#fafafa' }}>
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escribe un mensaje…"
          rows={1}
          className="flex-1 resize-none px-4 py-2.5 rounded-2xl text-sm font-medium outline-none transition-all"
          style={{
            background: '#fff',
            border: '2px solid #e5e7eb',
            color: '#111827',
            maxHeight: 96,
            lineHeight: '1.4',
            fontFamily: 'inherit',
          }}
          onFocus={e   => (e.target.style.borderColor = PRIMARY)}
          onBlur={e    => (e.target.style.borderColor = '#e5e7eb')}
        />
        <button
          onClick={onSend}
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          style={{
            background: inputText.trim() ? PRIMARY : '#e5e7eb',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function MessagesPage() {
  const { user } = useAuth();
  const [chats,       setChats]       = useState(INITIAL_CHATS);
  const [activeChat,  setActiveChat]  = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText,   setInputText]   = useState('');

  // Registra en Layout el handler de "volver a lista" cuando hay chat abierto en móvil
  useEffect(() => {
    if (activeChat) {
      backHandlers.current = () => setActiveChat(null);
    } else {
      backHandlers.current = null;
    }
    return () => { backHandlers.current = null; };
  }, [activeChat]);

  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.task.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lastMsg = (chat) => chat.messages[chat.messages.length - 1];

  // Mensajes en vivo del chat activo
  const liveMessages = activeChat
    ? (chats.find(c => c.id === activeChat.id)?.messages ?? activeChat.messages)
    : [];

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !activeChat) return;

    const newMsg = {
      id: Date.now(),
      from: 'me',
      text,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setChats(prev => prev.map(c =>
      c.id === activeChat.id ? { ...c, messages: [...c.messages, newMsg] } : c
    ));
    setInputText('');

    // Respuesta automática después de 1.2s
    setTimeout(() => {
      const replies = [
        '¡Entendido! Gracias por la información.',
        'Perfecto, nos coordinamos entonces.',
        'Ok, confirmo para esa fecha.',
        '¿Hay algo más que deba saber?',
        '¡Listo! Ahí estaré puntual.',
      ];
      const reply = {
        id: Date.now() + 1,
        from: 'them',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };
      setChats(prev => prev.map(c =>
        c.id === activeChat.id ? { ...c, messages: [...c.messages, reply] } : c
      ));
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>

      {/* Columna izquierda decorativa */}
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      {/* Contenido central */}
      <div className="flex-1 min-w-0 flex h-full overflow-hidden">

        {/* ── Panel izquierdo: lista de chats ── */}
        <div
          className={`flex flex-col border-r border-gray-100 ${activeChat ? 'hidden md:flex' : 'flex'}`}
          style={{ width: activeChat ? undefined : '100%', minWidth: 0, flex: activeChat ? '0 0 300px' : '1' }}
        >
          {/* Header lista */}
          <div className="shrink-0 px-5 py-4 border-b border-gray-100">
            <h1 className="text-2xl font-black tracking-tight text-center" style={{ color: '#111827' }}>
              Mensajes
            </h1>

            {/* Buscador */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar conversación…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm font-medium outline-none transition-all"
                style={{ background: '#f9fafb', border: '2px solid #f3f4f6', color: '#111827', fontFamily: 'inherit' }}
                onFocus={e => (e.target.style.borderColor = PRIMARY)}
                onBlur={e  => (e.target.style.borderColor = '#f3f4f6')}
              />
            </div>
          </div>

          {/* Lista chats */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {filteredChats.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>Sin conversaciones</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const last     = lastMsg(chat);
                const isActive = activeChat?.id === chat.id;
                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChat(chat)}
                    className="w-full flex items-center gap-3 px-5 py-4 transition-all cursor-pointer text-left"
                    style={{
                      background: isActive ? '#f3e8ff' : 'transparent',
                      borderLeft: isActive ? `3px solid ${PRIMARY}` : '3px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#fafafa'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="relative shrink-0">
                      <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-2xl object-cover" />
                      {chat.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm truncate" style={{ color: '#111827' }}>{chat.name}</span>
                        <span className="text-[10px] font-medium shrink-0" style={{ color: '#9ca3af' }}>{last?.time}</span>
                      </div>
                      <p className="text-xs font-semibold truncate mt-0.5" style={{ color: '#6b7280' }}>
                        {chat.task}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#9ca3af' }}>
                        {last?.from === 'me' ? 'Tú: ' : ''}{last?.text}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Panel derecho: chat activo ── */}
        <AnimatePresence mode="wait"> {/* mode="wait" ayuda a que la transición sea más limpia */}
        {activeChat ? (
            <motion.div
            key={activeChat.id}
            // Cambiamos 'x: 20' por un efecto de opacidad puro
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} // Un poco más rápido para que se sienta instantáneo
            className="flex-1 flex flex-col min-w-0 h-full overflow-hidden"
            >
            <ChatView
                chat={activeChat}
                liveMessages={liveMessages}
                inputText={inputText}
                setInputText={setInputText}
                onSend={handleSend}
                onKeyDown={handleKeyDown}
            />
            </motion.div>
        ) : (
            <div className="hidden md:flex flex-1 items-center justify-center h-full">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center" style={{ background: '#f3e8ff' }}>
                <Send className="w-7 h-7" style={{ color: PRIMARY }} />
                </div>
                <p className="font-bold text-sm" style={{ color: '#4b5563' }}>Selecciona una conversación</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>Tus mensajes con FreeTimers aparecen aquí</p>
            </div>
            </div>
        )}
        </AnimatePresence>
      </div>

      {/* Columna derecha decorativa */}
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}