import React, { useState, useRef, useEffect, FC, FormEvent, Dispatch, SetStateAction, useCallback, Ref } from 'react';

// --- 型定義 ---
interface HistoryItem {
  id: string;
  theme: string;
  date: string;
  keywords: string[];
  summary: string;
}

interface AppConfig {
  apiKey: string;
  localEndpoint: string;
  pin: string;
  enableReminder: boolean;
  reminderInterval: number;
  enableKeywords: boolean;
  enableSummary: boolean;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

// --- アイコンコンポーネント ---
const PaperAirplaneIcon: FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"> <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /> </svg> );
const ArrowUturnLeftIcon: FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /> </svg> );
const TrashIcon: FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"> <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" /> </svg> );
const BookOpenIcon: FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /> </svg> );
const Cog6ToothIcon: FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 0 1 0 1.905c.008.379.137.752.43.992l1.004.827a1.125 1.125 0 0 1 .26 1.431l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.333.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.759 6.759 0 0 1 0-1.905c-.008-.379-.137-.752-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28c.09-.542.56-.94 1.11-.94Z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /> </svg> );
const XMarkIcon: FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /> </svg> );


const ToggleSwitch: FC<{ label: string; enabled: boolean; setEnabled: Dispatch<SetStateAction<boolean>> }> = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
        <span className="text-gray-300">{label}</span>
        <button onClick={() => setEnabled(!enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-cyan-600' : 'bg-gray-600'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

// --- ページコンポーネント ---

const PinEntryPage: FC<{ onSubmit: (e: FormEvent) => void; enteredPin: string; setEnteredPin: Dispatch<SetStateAction<string>>; pinError: string }> = ({ onSubmit, enteredPin, setEnteredPin, pinError }) => (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-2xl font-bold mb-4 text-cyan-400">暗証番号を入力</h1>
        <form onSubmit={onSubmit}>
          <input type="password" maxLength={4} value={enteredPin} onChange={(e) => setEnteredPin(e.target.value)} className="w-full px-4 py-3 text-center text-2xl tracking-[1rem] bg-gray-800 border border-gray-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500" autoFocus />
          {pinError && <p className="text-red-400 text-sm mb-4">{pinError}</p>}
          <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors" disabled={enteredPin.length !== 4}>ロック解除</button>
        </form>
      </div>
    </div>
);

const SettingsPage: FC<{ initialConfig: AppConfig; onSave: (config: AppConfig) => void; onBack: () => void }> = ({ initialConfig, onSave, onBack }) => {
    const [tempApiKey, setTempApiKey] = useState(initialConfig.apiKey);
    const [tempEndpoint, setTempEndpoint] = useState(initialConfig.localEndpoint);
    const [tempPin, setTempPin] = useState(initialConfig.pin);
    const [tempEnableReminder, setTempEnableReminder] = useState(initialConfig.enableReminder);
    const [tempReminderInterval, setTempReminderInterval] = useState(initialConfig.reminderInterval);
    const [tempEnableKeywords, setTempEnableKeywords] = useState(initialConfig.enableKeywords);
    const [tempEnableSummary, setTempEnableSummary] = useState(initialConfig.enableSummary);

    const handleSave = () => {
        onSave({ 
            apiKey: tempApiKey, 
            localEndpoint: tempEndpoint, 
            pin: tempPin,
            enableReminder: tempEnableReminder,
            reminderInterval: tempReminderInterval,
            enableKeywords: tempEnableKeywords,
            enableSummary: tempEnableSummary,
        });
    };

    return (
        <div className="flex flex-col h-full">
            <header className="bg-gray-800 p-4 flex items-center shadow-md z-10">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><ArrowUturnLeftIcon /></button>
                <h2 className="text-lg font-semibold mx-auto">設定</h2>
            </header>
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">接続設定</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">ローカルLLM ベースURL</label>
                            <input type="text" value={tempEndpoint} onChange={(e) => setTempEndpoint(e.target.value)} placeholder="例: http://localhost:1234" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">または Gemini APIキー</label>
                            <input type="password" value={tempApiKey} onChange={(e) => setTempApiKey(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">4桁の暗証番号 (任意)</label>
                            <input type="password" value={tempPin} onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ''))} maxLength={4} placeholder="設定しない場合は空" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    </div>
                </div>
                <hr className="border-gray-700" />
                 <div>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">機能設定</h3>
                    <div className="space-y-4">
                        <ToggleSwitch label="キーワード抽出を有効にする" enabled={tempEnableKeywords} setEnabled={setTempEnableKeywords} />
                        <ToggleSwitch label="会話のまとめを有効にする" enabled={tempEnableSummary} setEnabled={setTempEnableSummary} />
                    </div>
                </div>
                <hr className="border-gray-700" />
                <div>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">リマインダー設定</h3>
                    <div className="space-y-4">
                        <ToggleSwitch label="復習リマインダーを有効にする" enabled={tempEnableReminder} setEnabled={setTempEnableReminder} />
                        {tempEnableReminder && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">通知間隔</label>
                                <select value={tempReminderInterval} onChange={(e) => setTempReminderInterval(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    <option value={1}>1日後</option>
                                    <option value={3}>3日後</option>
                                    <option value={7}>7日後</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
                <button onClick={handleSave} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4">設定を保存</button>
            </main>
        </div>
    );
};

const ReminderBanner: FC<{ reminder: { theme: string }; onReview: (theme: string) => void; onClose: () => void; }> = ({ reminder, onReview, onClose }) => (
    <div className="bg-cyan-900/50 border border-cyan-700 p-4 rounded-lg m-4 animate-fade-in-down">
        <div className="flex items-center justify-between">
            <div>
                <p className="font-bold text-cyan-300">復習の時間です！</p>
                <p className="text-sm text-gray-300">「{reminder.theme}」について復習しませんか？</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => onReview(reminder.theme)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-lg text-sm">復習する</button>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><XMarkIcon /></button>
            </div>
        </div>
    </div>
);


const ThemePage: FC<{ onStartChat: (e: FormEvent) => void; theme: string; setTheme: Dispatch<SetStateAction<string>>; onGoToHistory: () => void; onGoToSettings: () => void; isLoading: boolean; reminder: { theme: string } | null; onReviewReminder: (theme: string) => void; onCloseReminder: () => void; }> = ({ onStartChat, theme, setTheme, onGoToHistory, onGoToSettings, isLoading, reminder, onReviewReminder, onCloseReminder }) => (
    <div className="flex flex-col items-center justify-center h-full p-4 relative">
        {reminder && <div className="absolute top-0 left-0 right-0 z-20"><ReminderBanner reminder={reminder} onReview={onReviewReminder} onClose={onCloseReminder} /></div>}
        <div className="w-full max-w-md text-center">
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={onGoToHistory} className="p-3 text-gray-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-gray-800"><BookOpenIcon /></button>
                <button onClick={onGoToSettings} className="p-3 text-gray-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-gray-800"><Cog6ToothIcon /></button>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-cyan-400">AI聞き役パートナー</h1>
            <p className="text-gray-400 mb-8">今日学んだことをAIに説明して、知識を定着させよう！</p>
            <form onSubmit={onStartChat} className="w-full space-y-4">
              <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="今日の学習テーマを入力" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-500" disabled={!theme.trim() || isLoading}>説明をはじめる</button>
            </form>
        </div>
    </div>
);

const ChatPage: FC<{ theme: string; messages: Message[]; isLoading: boolean; inputValue: string; setInputValue: Dispatch<SetStateAction<string>>; onSendMessage: () => void; onReturnToTheme: () => void; onDeleteMessage: (index: number) => void; keywords: string[]; summary: string; isSummarizing: boolean; enableKeywords: boolean; enableSummary: boolean; chatEndRef: Ref<HTMLDivElement>; }> = ({ theme, messages, isLoading, inputValue, setInputValue, onSendMessage, onReturnToTheme, onDeleteMessage, keywords, summary, isSummarizing, enableKeywords, enableSummary, chatEndRef }) => (
    <div className="flex flex-col h-full">
        <header className="bg-gray-800 p-4 flex flex-col shadow-md z-10">
          <div className="flex items-center justify-between w-full">
              <button onClick={onReturnToTheme} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><ArrowUturnLeftIcon /></button>
              <h2 className="text-lg font-semibold truncate px-4">テーマ：{theme}</h2>
              <div className="w-10"></div>
          </div>
          {enableKeywords && keywords.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {keywords.map((kw, index) => ( <span key={index} className="bg-cyan-800 text-cyan-200 text-xs font-medium px-2.5 py-1 rounded-full">{kw}</span> ))}
              </div>
          )}
        </header>
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4">
              {messages.map((msg, index) => (
              <div key={index} className={`group flex items-end gap-2 my-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'user' && ( <button onClick={() => onDeleteMessage(index)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"> <TrashIcon /> </button> )}
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
              </div>
              ))}
              {isLoading && ( <div className="flex justify-start"><div className="bg-gray-700 rounded-2xl rounded-bl-none px-4 py-2"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div></div></div></div> )}
              <div ref={chatEndRef} />
          </main>
          {enableSummary && (
              <aside className="w-1/3 max-w-sm bg-gray-800/50 border-l border-gray-700 overflow-y-auto p-4">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">会話のまとめ</h3>
                  {isSummarizing && !summary && <p className="text-gray-400 text-sm">会話の要点を生成中...</p>}
                  {summary ? ( <div className="text-gray-300 text-sm space-y-2 whitespace-pre-wrap">{summary}</div> ) : ( !isSummarizing && <p className="text-gray-500 text-sm">ここに会話のまとめが自動的に表示されます。</p> )}
              </aside>
          )}
        </div>
        <footer className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="flex items-center bg-gray-700 rounded-lg">
            <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSendMessage(); } }} placeholder="説明を入力してください..." rows={1} className="w-full bg-transparent p-3 focus:outline-none resize-none" style={{maxHeight: '100px'}} />
            <button onClick={onSendMessage} disabled={isLoading || !inputValue.trim()} className="p-3 text-cyan-400 disabled:text-gray-500 hover:text-cyan-300 transition-colors"><PaperAirplaneIcon /></button>
          </div>
        </footer>
    </div>
);

const HistoryListPage: FC<{ historyItems: HistoryItem[]; onBack: () => void; onViewDetail: (item: HistoryItem) => void; }> = ({ historyItems, onBack, onViewDetail }) => (
    <div className="flex flex-col h-full">
        <header className="bg-gray-800 p-4 flex items-center shadow-md z-10">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><ArrowUturnLeftIcon /></button>
            <h2 className="text-lg font-semibold mx-auto">学習履歴</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 space-y-3">
            {historyItems.length > 0 ? (
                historyItems.map(item => (
                    <div key={item.id} onClick={() => onViewDetail(item)} className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                        <h3 className="font-bold text-cyan-400 truncate">{item.theme}</h3>
                        <p className="text-sm text-gray-400 mb-2">{new Date(item.date).toLocaleDateString('ja-JP')}</p>
                        <div className="flex flex-wrap gap-2">
                            {item.keywords.slice(0, 3).map((kw, i) => ( <span key={i} className="bg-gray-700 text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">{kw}</span> ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 pt-10">
                    <p>学習履歴はまだありません。</p>
                    <p>最初の学習セッションを完了すると、ここに記録されます。</p>
                </div>
            )}
        </main>
    </div>
);

const HistoryDetailPage: FC<{ item: HistoryItem | null; onBack: () => void; }> = ({ item, onBack }) => (
    <div className="flex flex-col h-full">
        <header className="bg-gray-800 p-4 flex items-center shadow-md z-10">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><ArrowUturnLeftIcon /></button>
            <h2 className="text-lg font-semibold mx-auto truncate" title={item?.theme}>{item?.theme}</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
                <h3 className="text-sm text-gray-400">学習日</h3>
                <p className="text-lg">{item ? new Date(item.date).toLocaleString('ja-JP') : ''}</p>
            </div>
            <div>
                <h3 className="text-sm text-gray-400 mb-2">キーワード</h3>
                <div className="flex flex-wrap gap-2">
                    {item?.keywords?.length ?? 0 > 0 ? item?.keywords.map((kw, i) => ( <span key={i} className="bg-cyan-800 text-cyan-200 text-sm font-medium px-3 py-1 rounded-full">{kw}</span> )) : <p className="text-gray-500">キーワードはありません。</p>}
                </div>
            </div>
            <div>
                <h3 className="text-sm text-gray-400 mb-2">会話のまとめ</h3>
                <div className="bg-gray-800 p-4 rounded-lg whitespace-pre-wrap text-gray-300">
                    {item?.summary || <p className="text-gray-500">まとめはありません。</p>}
                </div>
            </div>
        </main>
    </div>
);

// --- メインコンポーネント ---
export default function Home() {
  const [currentPage, setCurrentPage] = useState('loading');
  const [theme, setTheme] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [config, setConfig] = useState<AppConfig>({ apiKey: '', localEndpoint: '', pin: '', enableReminder: true, reminderInterval: 1, enableKeywords: true, enableSummary: true });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [reminder, setReminder] = useState<{ theme: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const CONFIG_KEY = 'appConfig';
  const REMINDER_KEY = 'lastSessionForReminder';

  const getHistoryFromKV = useCallback(async (): Promise<HistoryItem[]> => {
    try {
        const res = await fetch('/api/history');
        if (!res.ok) {
            console.error('Failed to fetch history');
            return [];
        }
        return res.json();
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
  }, []);

  const saveHistoryToKV = async (newHistoryItem: HistoryItem) => {
    try {
        await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newHistoryItem),
        });
    } catch (error) {
        console.error('Error saving history:', error);
    }
  };

  const checkForReminder = useCallback((currentConfig: AppConfig) => {
    if (!currentConfig.enableReminder) return;
    const lastSession = localStorage.getItem(REMINDER_KEY);
    if (lastSession) {
        const { theme, date } = JSON.parse(lastSession);
        const lastDate = new Date(date);
        const reminderDate = new Date(lastDate);
        reminderDate.setDate(lastDate.getDate() + currentConfig.reminderInterval);
        if (new Date() > reminderDate) {
            setReminder({ theme });
        }
    }
  }, []);

  const loadSettingsAndGoToTheme = useCallback((loadedConfig: AppConfig) => {
    setConfig(loadedConfig);
    const loadHistory = async () => {
      const items = await getHistoryFromKV();
      setHistoryItems(items);
    };
    loadHistory();
    checkForReminder(loadedConfig);
    setCurrentPage('theme');
  }, [checkForReminder, getHistoryFromKV]);

  useEffect(() => {
    const loadConfig = () => {
      const savedConfigJSON = localStorage.getItem(CONFIG_KEY);
      const defaultConfig: AppConfig = { apiKey: '', localEndpoint: '', pin: '', enableReminder: true, reminderInterval: 1, enableKeywords: true, enableSummary: true };
      if (savedConfigJSON) {
        const loadedConfig = { ...defaultConfig, ...JSON.parse(savedConfigJSON) };
        if (loadedConfig.pin) {
          setCurrentPage('pinEntry');
        } else {
          loadSettingsAndGoToTheme(loadedConfig);
        }
      } else {
        // First time launch
        setConfig(defaultConfig);
        setCurrentPage('theme');
      }
    };
    setTimeout(loadConfig, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // This effect should run only once on mount

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveSettings = (newConfig: AppConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
    loadSettingsAndGoToTheme(newConfig);
  };
  
  const handlePinSubmit = (e: FormEvent) => {
    e.preventDefault();
    const savedConfigJSON = localStorage.getItem(CONFIG_KEY);
    if (!savedConfigJSON) return;
    const defaultConfig: AppConfig = { apiKey: '', localEndpoint: '', pin: '', enableReminder: true, reminderInterval: 1, enableKeywords: true, enableSummary: true };
    const savedConfig = {...defaultConfig, ...JSON.parse(savedConfigJSON)};
    if (enteredPin === savedConfig.pin) {
      setPinError('');
      loadSettingsAndGoToTheme(savedConfig);
    } else {
      setPinError('暗証番号が違います。');
      setEnteredPin('');
    }
  };

  const handleStartChat = (e: FormEvent) => {
    e.preventDefault();
    if (theme.trim()) {
      setMessages([{ role: 'assistant', content: `なるほど！「${theme}」について学習したんですね。どんなことでもいいので、私に説明してみてください。` }]);
      setKeywords([]);
      setSummary('');
      setCurrentPage('chat');
    }
  };

  const handleReturnToTheme = async () => {
    if (theme.trim() && messages.length > 1) {
      const newHistoryItem: HistoryItem = { id: `session_${Date.now()}`, theme, date: new Date().toISOString(), keywords, summary };
      await saveHistoryToKV(newHistoryItem);
      const currentHistory = await getHistoryFromKV();
      setHistoryItems(currentHistory);
      localStorage.setItem(REMINDER_KEY, JSON.stringify({ theme, date: new Date().toISOString() }));
    }
    setTheme(''); setMessages([]); setInputValue(''); setKeywords([]); setSummary('');
    setCurrentPage('theme');
  };
  
  const handleReviewReminder = (reminderTheme: string) => {
    setTheme(reminderTheme);
    setReminder(null);
    localStorage.removeItem(REMINDER_KEY);
  };

  const handleCloseReminder = () => {
    setReminder(null);
    localStorage.removeItem(REMINDER_KEY);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (config.enableKeywords) { extractKeywords(inputValue); }
    const userMessageCount = newMessages.filter(m => m.role === 'user').length;
    if (config.enableSummary && userMessageCount > 0 && userMessageCount % 3 === 0) { updateSummary(newMessages); }
    setInputValue(''); setIsLoading(true);
    try {
      const aiResponse = await callAI('chat', newMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("AI応答取得エラー:", error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setMessages(prev => [...prev, { role: 'assistant', content: `エラー: ${errorMessage}` }]);
    } finally { setIsLoading(false); }
  };

  const handleDeleteMessage = (indexToDelete: number) => {
    setMessages(prevMessages => prevMessages.filter((_, index) => index !== indexToDelete && index !== indexToDelete + 1));
  };

  const handleViewHistoryDetail = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setCurrentPage('historyDetail');
  };
  
  const systemPromptText = `あなたは、ユーザーの学習をサポートする、フレンドリーで聞き上手なパートナーです。あなたの役割は、専門的な知識で相手を評価したり、間違いを指摘したりすることではありません。相手が自分の言葉で説明を続けられるように、以下のルールに従って応答してください。 # ルール - 相手の説明に対して、まずは「うんうん」「なるほど！」「そうなんですね」といった短い相槌で肯定的に受け止めてください。 - 相手の説明を促すために、「それで、どうなるの？」「もう少し詳しく教えてくれる？」「具体的にはどんな感じ？」「面白いね！他には何かある？」といった、オープンで簡単な質問を投げかけてください。 - 応答は常に短く、1〜2文で簡潔にしてください。 - 決して難しい言葉や専門用語は使わないでください。 - ユーザーが「終わり」や「終了」といった言葉を使ったら、「お疲れ様！よく説明できたね！」といったポジティブな言葉で対話を締めくくってください。`;

  const callAI = async (task: 'chat' | 'keywords' | 'summary', data: Message[] | string): Promise<string> => {
    if (config.localEndpoint.trim()) {
      return callLocalLlm(task, data);
    } else if (config.apiKey.trim()) {
      return callGeminiApi(task, data);
    } else {
      throw new Error("接続設定を行ってください。");
    }
  };

  const extractKeywords = async (text: string) => {
    try {
      const newKeywordsText = await callAI('keywords', text);
      const newKeywords = newKeywordsText.split(',').map(k => k.trim()).filter(Boolean);
      setKeywords(prev => [...new Set([...prev, ...newKeywords])]);
    } catch (error) { console.error("キーワード抽出エラー:", error); }
  };

  const updateSummary = async (currentMessages: Message[]) => {
    setIsSummarizing(true);
    try {
      const newSummary = await callAI('summary', currentMessages);
      setSummary(newSummary);
    } catch (error) { console.error("まとめ生成エラー:", error); } 
    finally { setIsSummarizing(false); }
  };

  const callLocalLlm = async (task: 'chat' | 'keywords' | 'summary', data: Message[] | string): Promise<string> => {
    const baseUrl = config.localEndpoint.trim().replace(/\/$/, '');
    const fullUrl = `${baseUrl}/v1/chat/completions`;
    let messagesForApi;
    if (task === 'chat') { messagesForApi = [{ role: 'system', content: systemPromptText }, ...(data as Message[]).map((msg: Message) => ({ role: msg.role, content: msg.content }))]; } 
    else if (task === 'keywords') { messagesForApi = [{ role: 'system', content: 'You are a keyword extraction expert.' }, { role: 'user', content: `以下のテキストから重要なキーワードを3つ抽出してください。カンマ区切りのリスト形式で、キーワードのみを返してください。 テキスト：${data}` }]; } 
    else if (task === 'summary') { const conversationText = (data as Message[]).map((msg: Message) => `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`).join('\n'); messagesForApi = [{ role: 'system', content: 'You are a summarization expert.' }, { role: 'user', content: `以下の会話の要点を、箇条書きで簡潔にまとめてください。\n\n${conversationText}` }]; }
    const payload = { model: "local-model", messages: messagesForApi, stream: false };
    const response = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) { const errorBody = await response.json().catch(() => ({ error: 'サーバーから有効なJSONエラー応答がありません。' })); throw new Error(`ローカルLLMサーバーエラー: ${response.status} ${response.statusText}. ${errorBody.error || ''}`); }
    const result = await response.json();
    const aiText = result.choices?.[0]?.message?.content;
    if (aiText) return aiText.trim();
    throw new Error("ローカルLLMからのレスポンス形式が不明です。");
  };

  const callGeminiApi = async (task: 'chat' | 'keywords' | 'summary', data: Message[] | string): Promise<string> => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${config.apiKey.trim()}`;
    let contents;
    if (task === 'chat') { contents = [{ role: 'user', parts: [{ text: systemPromptText }] }, ...(data as Message[]).map((msg: Message) => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] }))]; } 
    else if (task === 'keywords') { contents = [{ role: 'user', parts: [{ text: `以下のテキストから重要なキーワードを3つ抽出してください。カンマ区切りのリスト形式で、キーワードのみを返してください。 テキスト：${data}` }] }]; } 
    else if (task === 'summary') { const conversationText = (data as Message[]).map((msg: Message) => `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`).join('\n'); contents = [{ role: 'user', parts: [{ text: `以下の会話の要点を、箇条書きで簡潔にまとめてください。\n\n${conversationText}` }] }]; }
    const payload = { contents };
    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) { const errorBody = await response.text(); throw new Error(`Gemini APIエラー: ${response.status}. ${errorBody}`); }
    const result = await response.json();
    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (aiText) return aiText;
    throw new Error("Gemini APIからのレスポンス形式が予期しないものです。");
  };

  const renderPage = () => {
    switch (currentPage) {
        case 'loading': return <div className="flex items-center justify-center h-full"></div>;
        case 'pinEntry': return <PinEntryPage onSubmit={handlePinSubmit} enteredPin={enteredPin} setEnteredPin={setEnteredPin} pinError={pinError} />;
        case 'settings': return <SettingsPage initialConfig={config} onSave={handleSaveSettings} onBack={() => setCurrentPage('theme')} />;
        case 'history': return <HistoryListPage historyItems={historyItems} onBack={() => setCurrentPage('theme')} onViewDetail={handleViewHistoryDetail} />;
        case 'historyDetail': return <HistoryDetailPage item={selectedHistoryItem} onBack={() => setCurrentPage('history')} />;
        case 'chat': return <ChatPage theme={theme} messages={messages} isLoading={isLoading} inputValue={inputValue} setInputValue={setInputValue} onSendMessage={handleSendMessage} onReturnToTheme={handleReturnToTheme} onDeleteMessage={handleDeleteMessage} keywords={keywords} summary={summary} isSummarizing={isSummarizing} enableKeywords={config.enableKeywords} enableSummary={config.enableSummary} chatEndRef={chatEndRef} />;
        case 'theme': default: return <ThemePage onStartChat={handleStartChat} theme={theme} setTheme={setTheme} onGoToHistory={() => setCurrentPage('history')} onGoToSettings={() => setCurrentPage('settings')} isLoading={isLoading} reminder={reminder} onReviewReminder={handleReviewReminder} onCloseReminder={handleCloseReminder} />;
    }
  };

  return (
    <div className="bg-gray-900 text-white font-sans flex flex-col h-full">
      {renderPage()}
    </div>
  );
}
```

この手順で、今度こそビルドが成功するはずです。お手数ですが、ご確認をお願いいたし