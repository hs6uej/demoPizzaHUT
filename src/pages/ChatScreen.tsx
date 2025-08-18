import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pizza, Send, Shield, Volume2, ExternalLink } from 'lucide-react';

// ---------------- Types ----------------
type Sender = 'bot' | 'user';

export type Intent =
  | 'GREET'
  | 'PROMO'
  | 'PROMO_B1G1'
  | 'PROMO_TERMS'
  | 'MENU'
  | 'RECOMMEND'
  | 'SIZE'
  | 'CRUST'
  | 'VEGETARIAN'
  | 'SPICY'
  | 'ALLERGEN'
  | 'HALAL'
  | 'ORDER'
  | 'MIN_ORDER'
  | 'HOURS'
  | 'DELIVERY_AREA'
  | 'DELIVERY_FEE'
  | 'DELIVERY_ETA'
  | 'TRACK_ORDER'
  | 'CANCEL_ORDER'
  | 'MODIFY_ORDER'
  | 'PAYMENT'
  | 'WALLET'
  | 'TAX_INVOICE'
  | 'BRANCH'
  | 'CONTACT'
  | 'COMPLAINT'
  | 'THANKS'
  | 'UNKNOWN';

export interface BotReply {
  intent: Intent;
  reply: string;
  matchedKeyword?: string | null;
}

interface Message {
  id: number;
  text: string;
  sender: Sender;
  showQuickReply?: boolean;
}

// --------------- Utils: normalize & match ---------------
const toArabicDigits = (s: string) =>
  s.replace(/[๐-๙]/g, (d) => String('๐๑๒๓๔๕๖๗๘๙'.indexOf(d)));

const stripEmojisAndSymbols = (s: string) =>
  s.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Symbol}\p{Mark}]/gu, '');

const normalize = (input: string) => {
  let s = (input || '').toLowerCase().trim();
  s = toArabicDigits(s);
  s = stripEmojisAndSymbols(s);
  s = s
    .replace(/[‐-‒–—―]/g, '-') // dashes
    .replace(/[“”«»„]/g, '"') // quotes
    .replace(/[‘’‹›]/g, "'") // apostrophes
    .replace(/\s+/g, ' '); // collapse spaces
  return s;
};

const removeSpaces = (s: string) => s.replace(/\s+/g, '');

const includesAny = (msg: string, phrases: string[]) => {
  const m = normalize(msg);
  const mNoSpace = removeSpaces(m);
  for (const p of phrases) {
    const n = normalize(p);
    if (!n) continue;
    const nNoSpace = removeSpaces(n);
    if (m.includes(n) || mNoSpace.includes(nNoSpace)) return p; // คืนคำที่แมตช์
  }
  return null;
};

// --------------- Keyword buckets ---------------
const KW = {
  greet: ['สวัสดี', 'หวัดดี', 'ดีครับ', 'ดีค่ะ', 'hello', 'hi', 'hey', 'ฮัลโหล', 'ทัก', 'ทักทาย'],

  promo: [
    'โปร',
    'โปรโมชั่น',
    'โปรโมชัน',
    'promotion',
    'promo',
    'discount',
    'ส่วนลด',
    'ลดราคา',
    'โค้ด',
    'code',
    'คูปอง',
    'coupon',
    'voucher',
    'วอยเชอร์',
  ],
  b1g1: ['ซื้อ 1 แถม 1', 'ซื้อ1แถม1', 'buy 1 get 1', 'buy1get1', 'b1g1', '1แถม1', 'โปร1แถม1'],
  termsPromo: [
    'เงื่อนไขโปร',
    'ใช้โค้ดยังไง',
    'หมดเขตเมื่อไร',
    'โปรหมดเมื่อไหร่',
    'เงื่อนไขโปรโมชั่น',
    'วิธีใช้โค้ด',
  ],

  menu: [
    'เมนู',
    'menu',
    'มีอะไรบ้าง',
    'รายการอาหาร',
    'พิซซ่ามีหน้าอะไร',
    'pizza menu',
    'หน้าอะไรแนะนำ',
    'หน้าไหนอร่อย',
    'เมนูแนะนำ',
  ],
  recommend: ['แนะนำ', 'recommend', 'ตัวไหนดี', 'เลือกไม่ถูก', 'suggest', 'หน้าฮิต', 'เมนูฮิต'],
  size: ['ขนาด', 'size', 'ไซส์', 'เล็ก กลาง ใหญ่', 's m l', 'ไซซ์', 'ขนาดพิซซ่า'],
  crust: ['ขอบชีส', 'ชีสขอบ', 'stuffed crust', 'crust', 'ขอบหนา', 'ขอบบาง', 'ขอบพิซซ่า'],
  vegetarian: ['มังสวิรัติ', 'vegetarian', 'vegan', 'วีแกน', 'เจ', 'ไม่กินเนื้อ', 'ผักล้วน'],
  spicy: ['เผ็ด', 'spicy', 'เผ็ดไหม', 'ระดับความเผ็ด', 'เผ็ดแค่ไหน'],
  allergen: ['แพ้', 'allergen', 'ถั่ว', 'นม', 'กลูเตน', 'gluten', 'lactose', 'แพ้อาหาร', 'อาหารปลอด'],
  halal: ['ฮาลาล', 'halal'],

  order: ['สั่ง', 'order', 'วิธีสั่ง', 'สั่งยังไง', 'กดสั่ง', 'เริ่มสั่ง', 'สั่งพิซซ่า', 'ทำรายการ'],
  minOrder: ['ขั้นต่ำ', 'min order', 'ขั้นต่ำเท่าไหร่', 'ยอดขั้นต่ำ', 'สั่งขั้นต่ำกี่บาท'],

  hours: ['เปิดกี่โมง', 'ปิดกี่โมง', 'เวลาเปิด', 'เวลาปิด', 'เวลา', 'เปิด-ปิด', 'opening hours', 'close กี่โมง'],

  deliveryArea: ['ส่งที่ไหน', 'พื้นที่จัดส่ง', 'ส่งได้ที่ไหน', 'deliver', 'ครอบคลุม', 'ส่งต่างจังหวัดไหม', 'ส่งในพื้นที่'],
  deliveryFee: ['ค่าส่ง', 'ค่าจัดส่ง', 'ค่าส่งเท่าไหร่', 'delivery fee', 'ค่าส่งแพงไหม'],
  eta: ['กี่นาที', 'นานไหม', 'นานแค่ไหน', 'ใช้เวลาส่ง', 'delivery time', 'ถึงเมื่อไหร่', 'ประมาณกี่นาที'],

  track: ['ติดตาม', 'track', 'สถานะออเดอร์', 'order status', 'ตามของ', 'ของถึงไหน', 'เช็กสถานะ'],
  cancel: ['ยกเลิก', 'cancel', 'ขอยกเลิก', 'ยกเลิกออเดอร์', 'ยกเลิกคำสั่งซื้อ'],
  modify: ['แก้ไขออเดอร์', 'เปลี่ยนที่อยู่', 'เปลี่ยนเมนู', 'แก้ไขคำสั่งซื้อ', 'เปลี่ยนแปลงออเดอร์'],

  pay: ['ชำระเงิน', 'จ่ายยังไง', 'payment', 'ชำระยังไง', 'วิธีจ่าย', 'จ่ายเงิน', 'ช่องทางจ่าย', 'ชำระค่าบริการ'],
  wallet: ['wallet', 'ทรูวอลเล็ท', 'true money', 'truemoney', 'promptpay', 'line pay', 'อีวอลเล็ท', 'อีวอเลท'],
  tax: ['ใบกำกับภาษี', 'ใบเสร็จ', 'vat', 'e-tax', 'ใบกำกับ', 'ออกใบกำกับ'],

  branch: ['สาขา', 'ใกล้ฉัน', 'ใกล้บ้าน', 'branch', 'สาขาใกล้ฉัน', 'ค้นหาสาขา', 'map สาขา'],
  contact: ['เบอร์โทร', 'โทร', 'call', 'contact', 'ติดต่อ', 'หมายเลข', 'คอลเซ็นเตอร์', 'คอลเซนเตอร์', 'call center'],
  complaint: ['ร้องเรียน', 'ไม่พอใจ', 'feedback', 'คอมเพลน', 'แจ้งปัญหา', 'ติชม'],
  thanks: ['ขอบคุณ', 'thanks', 'thank you', 'thank', 'ซาบซึ้ง', 'ขอบใจ'],
} as const;

// --------------- Intent resolver (priority-based) ---------------
function resolveIntent(message: string): { intent: Intent; matchedKeyword?: string | null } {
  const checks: Array<[Intent, readonly string[]]> = [
    ['PROMO_B1G1', KW.b1g1],
    ['PROMO_TERMS', KW.termsPromo],
    ['PROMO', KW.promo],
    ['GREET', KW.greet],
    ['MENU', KW.menu],
    ['RECOMMEND', KW.recommend],
    ['SIZE', KW.size],
    ['CRUST', KW.crust],
    ['VEGETARIAN', KW.vegetarian],
    ['SPICY', KW.spicy],
    ['ALLERGEN', KW.allergen],
    ['HALAL', KW.halal],
    ['ORDER', KW.order],
    ['MIN_ORDER', KW.minOrder],
    ['HOURS', KW.hours],
    ['DELIVERY_AREA', KW.deliveryArea],
    ['DELIVERY_FEE', KW.deliveryFee],
    ['DELIVERY_ETA', KW.eta],
    ['TRACK_ORDER', KW.track],
    ['CANCEL_ORDER', KW.cancel],
    ['MODIFY_ORDER', KW.modify],
    ['PAYMENT', KW.pay],
    ['WALLET', KW.wallet],
    ['TAX_INVOICE', KW.tax],
    ['BRANCH', KW.branch],
    ['CONTACT', KW.contact],
    ['COMPLAINT', KW.complaint],
    ['THANKS', KW.thanks],
  ];

  for (const [intent, bucket] of checks) {
    const hit = includesAny(message, bucket as string[]);
    if (hit) return { intent, matchedKeyword: hit };
  }
  return { intent: 'UNKNOWN', matchedKeyword: null };
}

// --------------- Reply bank ---------------
function replyForIntent(intent: Intent): string {
  switch (intent) {
    case 'GREET':
      return 'สวัสดีค่ะ 😊 ยินดีต้อนรับสู่ Pizza 1150 ค่ะ ต้องการสั่งพิซซ่าหรือสอบถามโปรโมชั่นไหมคะ?';
    case 'PROMO':
      return 'ตอนนี้ Pizza 1150 มีโปร **ซื้อ 1 แถม 1** และคูปองส่วนลดสำหรับเมนูที่ร่วมรายการค่ะ 🎉 หากมีโค้ดส่วนลด ใส่ตอนชำระเงินได้เลยค่ะ';
    case 'PROMO_B1G1':
      return 'โปรซื้อ 1 แถม 1 ใช้ได้กับพิซซ่าขนาด/หน้าที่ร่วมรายการ ตรวจสอบได้ในหน้า "เริ่มสั่งพิซซ่า" ค่ะ 🎉';
    case 'PROMO_TERMS':
      return 'เงื่อนไขโปรและวันหมดเขตขึ้นกับแคมเปญค่ะ ตรวจสอบรายละเอียดในหน้าโปรโมชันก่อนชำระเงินได้เลยนะคะ 😊';
    case 'MENU':
      return 'เมนูฮิต: ฮาวายเอี้ยน, เปปเปอโรนี, มีทเลิฟเวอร์, ซีฟู้ด + ของทานเล่น (ไก่วิงส์, นักเก็ต, ชีสสติ๊ก) และเครื่องดื่มค่ะ 🍕🥤';
    case 'RECOMMEND':
      return 'แนะนำ “มีทเลิฟเวอร์” สายเนื้อ และ “ซีฟู้ดเดอลุกซ์” สายทะเลค่ะ ถ้าชอบชีส เลือกขอบชีสได้เลย 🧀';
    case 'SIZE':
      return 'มี 3 ขนาด: เล็ก, กลาง, ใหญ่ เลือกตามจำนวนคนและความอิ่มที่ต้องการได้เลยค่ะ 😋';
    case 'CRUST':
      return 'ขอบพิซซ่า: ธรรมดา, ชีส และชีสพิเศษ (เฉพาะบางเมนู) เลือกได้ตอนสั่งซื้อค่ะ 🧀';
    case 'VEGETARIAN':
      return 'มีตัวเลือกไม่ใส่เนื้อสัตว์/ผักล้วนได้ค่ะ โปรดแจ้งข้อจำกัดอาหารตอนสั่ง เราจะช่วยแนะนำเมนูให้ปลอดภัยนะคะ 🥦';
    case 'SPICY':
      return 'มีเมนูเผ็ดเล็กน้อยถึงปานกลาง เช่น สไปซี่เปปเปอโรนีค่ะ หากไม่ทานเผ็ดแจ้งตอนสั่งได้ค่ะ 🌶️';
    case 'ALLERGEN':
      return 'หากแพ้อาหาร โปรดระบุตอนสั่ง เราจะช่วยแนะนำเมนูที่เหมาะสมให้ค่ะ ความปลอดภัยมาก่อนเสมอ ✅';
    case 'HALAL':
      return 'บางสาขามีวัตถุดิบที่ได้รับการรับรองฮาลาลค่ะ แนะนำเช็คสาขาและแจ้งความต้องการตอนสั่งเพื่อความถูกต้อง ☪️';
    case 'ORDER':
      return 'กดปุ่ม "สั่งเลย!" เพื่อเลือกหน้า ขนาด ขอบ และชำระเงินได้เลยค่ะ 📲';
    case 'MIN_ORDER':
      return 'ไม่มีขั้นต่ำสำหรับยอดสั่งซื้อค่ะ แต่มีค่าจัดส่งขึ้นกับพื้นที่บริการนะคะ 🚚';
    case 'HOURS':
      return 'Pizza 1150 เปิดทุกวัน **10:00–23:00 น.** (อาจต่างตามสาขาเล็กน้อย) 🕙';
    case 'DELIVERY_AREA':
      return 'มีบริการจัดส่งหลายพื้นที่ค่ะ กรอกที่อยู่ในหน้าสั่งซื้อเพื่อเช็คพื้นที่และค่าส่งได้เลย 🗺️';
    case 'DELIVERY_FEE':
      return 'ค่าส่งขึ้นกับระยะทางและแคมเปญช่วงนั้น ๆ ระบบจะแสดงก่อนยืนยันออเดอร์ค่ะ ✅';
    case 'DELIVERY_ETA':
      return 'โดยทั่วไปจัดส่ง **ประมาณ 30–45 นาที** ขึ้นกับสภาพการจราจรและจำนวนออเดอร์ค่ะ 🚦';
    case 'TRACK_ORDER':
      return 'ติดตามสถานะได้จากลิงก์ในใบสั่งซื้อ หรือหน้า “ประวัติการสั่งซื้อ” ในระบบค่ะ 🔎';
    case 'CANCEL_ORDER':
      return 'ต้องการยกเลิก โปรดติดต่อ 1150 โดยเร็วที่สุดพร้อมเลขออเดอร์ ภายในไม่กี่นาทีหลังสั่งจะสะดวกที่สุดค่ะ 📞';
    case 'MODIFY_ORDER':
      return 'หลังยืนยันแล้วอาจแก้ไขได้จำกัดค่ะ โทร 1150 พร้อมเลขออเดอร์เพื่อขอความช่วยเหลือจากเจ้าหน้าที่นะคะ';
    case 'PAYMENT':
      return 'รองรับเงินสดปลายทาง, บัตรเครดิต/เดบิต, โอนผ่านแอป และ e-Wallet (PromptPay, TrueMoney, LINE Pay) ค่ะ 💳💵';
    case 'WALLET':
      return 'จ่ายผ่าน e-Wallet ได้ค่ะ เลือกวิธีชำระในขั้นตอนเช็คเอาต์ ระบบจะพาไปยืนยันการชำระเงินอัตโนมัติ ✅';
    case 'TAX_INVOICE':
      return 'ขอใบกำกับภาษี/ใบเสร็จได้ในขั้นตอนชำระเงิน โดยกรอกข้อมูลบริษัทและเลขผู้เสียภาษีให้ครบถ้วนค่ะ 🧾';
    case 'BRANCH':
      return 'เช็คสาขาใกล้คุณได้ในหน้า “ค้นหาสาขา” หรือระบุพิกัดตอนสั่ง ระบบจะแนะนำสาขาที่บริการได้เร็วที่สุดค่ะ 📍';
    case 'CONTACT':
      return 'ติดต่อ Pizza 1150 ได้ที่ **1150** ในเวลาทำการค่ะ ☎️';
    case 'COMPLAINT':
      return 'ขออภัยในความไม่สะดวกค่ะ 🙏 กรุณาแจ้งเลขออเดอร์และรายละเอียดปัญหา ผ่านแชทนี้หรือโทร 1150 เพื่อให้เราช่วยดูแลค่ะ';
    case 'THANKS':
      return 'ขอบคุณที่ใช้บริการ Pizza 1150 ค่ะ 🍕😊';
    default:
      return 'ขออภัยค่ะ Pizza 1150 ยังไม่เข้าใจคำถามนี้ 🙏 กรุณากดปุ่ม "สั่งเลย!" เพื่อทำรายการนะคะ';
  }
}

// --------------- Bot engine (public) ---------------
export function getBotResponse(message: string): BotReply {
  const { intent, matchedKeyword } = resolveIntent(message);
  return {
    intent,
    reply: replyForIntent(intent),
    matchedKeyword,
  };
}

// --------------- Component ---------------
const ChatScreen: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: 'สวัสดีค่ะ Pizza 1150 ยินดีให้บริการค่ะ 🍕',
        showQuickReply: true,
      },
    ]);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userId = Date.now();
    const botId = userId + 1;

    const userMessage: Message = {
      id: userId,
      sender: 'user',
      text: trimmed,
    };

    const { reply } = getBotResponse(trimmed);

    const botReply: Message = {
      id: botId,
      sender: 'bot',
      text: reply,
      showQuickReply: true,
    };

    setMessages((prev) => [...prev, userMessage, botReply]);
    setInput('');
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartOrder = () => {
    navigate('/login');
  };
  
  const shouldShowQuickReply = messages.length > 0 && messages[messages.length - 1].sender === 'bot' && messages[messages.length - 1].showQuickReply;

  return (
    <div className="flex flex-col h-full bg-[#7994A0]">
      {/* Header */}
      <div className="bg-[#405664] text-white p-3 flex items-center justify-between shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <Shield size={24} />
          <h1 className="font-bold">Pizza Hut 1150</h1>
        </div>
        <div className="flex items-center gap-4">
          <Volume2 size={20} />
          <ExternalLink size={20} />
        </div>
      </div>

      {/* Message Area */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 ${
                msg.sender === 'user' ? 'bg-[#90E348] text-black' : 'bg-white text-black'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reply Button */}
      {shouldShowQuickReply && (
        <div className="fixed bottom-20 right-4 z-10">
          <button
            onClick={handleStartOrder}
            className="bg-red-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg flex items-center justify-center gap-2 text-sm hover:bg-red-700 transition-colors"
            aria-label="เริ่มสั่งพิซซ่า"
          >
            <Pizza size={16} />
            สั่งเลย!
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white p-2 flex items-center gap-2 border-t flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์ข้อความ..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none"
          aria-label="ช่องกรอกข้อความ"
        />
        <button
          onClick={handleSendMessage}
          className="bg-red-600 text-white rounded-full p-2"
          aria-label="ส่งข้อความ"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;