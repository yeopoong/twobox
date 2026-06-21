import { useState, useEffect, useRef } from 'react';
import { Star, Loader2, Gift, Mic, MicOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './index.css';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const API_BASE_URL = 'http://localhost:8000';
const WS_BASE_URL = 'ws://localhost:8000';
const MOBILE_APP_URL = 'http://localhost:3001';

type Lang = 'en' | 'ko' | 'es';

const DICT = {
  en: {
    title: "How was your Twobox Chicken? 🍗",
    subtitle: "Leave an honest review for a 100% winning roulette spin!",
    placeholder: "You can write your review directly on your phone later! (Optional: You can also write it here or use voice input)",
    micNotSupported: "Your browser does not support voice recognition. (Chrome is recommended)",
    stopMic: "Stop Voice Recognition",
    startMic: "Input by Voice",
    submitBtn: "Submit Review & Spin the Wheel",
    error: "An error occurred. Please try again.",
    qrTitle: "Almost there! 🎉",
    qrSubtitle: "Scan the QR code below to post your review on Google Maps. The roulette will spin immediately after!",
    qrLink: "Direct link for PC testing (opens in new tab):",
    waiting: "Waiting for smartphone sync...",
    rouletteTitle: "Google Review Verified! 🚀",
    rouletteSub: "Spinning the lucky roulette!",
    resultTitle: "Congratulations!",
    resultPrize: (p: string) => `You won: [${p}]!`,
    resultSub: "Please show this screen to the counter staff to claim your prize!",
    restart: "Return to Start",
    prizes: ['Free Americano', 'Cheese Sticks', '$1 Off', 'Free Soda', 'Better Luck Next Time', '$3 Off'],
    speechLang: 'en-US'
  },
  ko: {
    title: "투박스 치킨(Twobox Chicken), 어떠셨나요? 🍗",
    subtitle: "솔직한 리뷰를 남겨주시면 100% 당첨 룰렛 기회를 드립니다!",
    placeholder: "리뷰 내용은 스마트폰에서 편하게 쓰셔도 됩니다! (선택: 키오스크에서 미리 쓰거나 음성으로 입력 가능)",
    micNotSupported: "현재 브라우저는 음성 인식을 지원하지 않습니다. (Chrome 브라우저를 권장합니다)",
    stopMic: "음성 인식 중지",
    startMic: "음성으로 입력하기",
    submitBtn: "리뷰 완료하고 이벤트 참여하기",
    error: "오류가 발생했습니다. 다시 시도해주세요.",
    qrTitle: "거의 다 왔습니다! 🎉",
    qrSubtitle: "아래 QR코드를 스마트폰으로 스캔하여 구글 맵에 방금 쓰신 리뷰를 등록해주세요. 등록 즉시 룰렛이 돌아갑니다!",
    qrLink: "PC 테스트용 다이렉트 링크 (클릭 시 새 창 열림):",
    waiting: "스마트폰 연동 대기중...",
    rouletteTitle: "구글 리뷰 인증 완료! 🚀",
    rouletteSub: "행운의 룰렛이 돌아갑니다!",
    resultTitle: "축하합니다!",
    resultPrize: (p: string) => `[${p}] 당첨!`,
    resultSub: "카운터 직원에게 이 화면을 보여주시고 상품을 받아가세요!",
    restart: "처음으로 돌아가기",
    prizes: ['아메리카노 무료', '치즈스틱', '1,000원 할인', '콜라/사이다', '다음 기회에', '3,000원 할인'],
    speechLang: 'ko-KR'
  },
  es: {
    title: "¿Qué tal su Twobox Chicken? 🍗",
    subtitle: "¡Deje una reseña honesta para obtener un giro de ruleta 100% ganador!",
    placeholder: "¡Puede escribir su reseña directamente en su teléfono más tarde! (Opcional: también puede escribirla aquí o usar la entrada de voz)",
    micNotSupported: "Su navegador no admite el reconocimiento de voz. (Se recomienda Chrome)",
    stopMic: "Detener reconocimiento de voz",
    startMic: "Entrada por voz",
    submitBtn: "Enviar reseña y girar la ruleta",
    error: "Ocurrió un error. Por favor, inténtelo de nuevo.",
    qrTitle: "¡Casi listo! 🎉",
    qrSubtitle: "Escanee el código QR a continuación para publicar su reseña en Google Maps. ¡La ruleta girará inmediatamente después!",
    qrLink: "Enlace directo para pruebas en PC (se abre en una nueva pestaña):",
    waiting: "Esperando sincronización del teléfono inteligente...",
    rouletteTitle: "¡Revisión de Google verificada! 🚀",
    rouletteSub: "¡Girando la ruleta de la suerte!",
    resultTitle: "¡Felicidades!",
    resultPrize: (p: string) => `¡Has ganado: [${p}]!`,
    resultSub: "¡Muestre esta pantalla al personal del mostrador para reclamar su premio!",
    restart: "Volver al inicio",
    prizes: ['Americano gratis', 'Palitos de queso', '$1 de descuento', 'Refresco gratis', 'Mejor suerte la próxima vez', '$3 de descuento'],
    speechLang: 'es-ES'
  }
};

function App() {
  const [lang, setLang] = useState<Lang>('en');
  const t = DICT[lang];

  const [step, setStep] = useState<'review' | 'qr' | 'roulette' | 'result'>('review');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spinDegree, setSpinDegree] = useState(0);
  const [prize, setPrize] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Update speech recognition language when lang changes
  useEffect(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = t.speechLang;
    }
  }, [lang, t.speechLang, isListening]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = t.speechLang;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setReviewText((prev) => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(t.micNotSupported);
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = t.speechLang;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review_text: reviewText })
      });
      const data = await res.json();
      setSessionId(data.id);
      setStep('qr');
    } catch (e) {
      console.error(e);
      alert(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (step === 'qr' && sessionId) {
      const ws = new WebSocket(`${WS_BASE_URL}/ws/${sessionId}`);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'SESSION_COMPLETED') {
          setStep('roulette');
        }
      };

      return () => ws.close();
    }
  }, [step, sessionId]);

  useEffect(() => {
    if (step === 'roulette') {
      const timer = setTimeout(() => {
        const extraSpins = 5 * 360; 
        const randomPrizeIndex = Math.floor(Math.random() * 4); 
        const segmentDegree = 360 / t.prizes.length;
        
        const baseStop = 360 - (randomPrizeIndex * segmentDegree) - (segmentDegree / 2);
        const finalDegree = extraSpins + baseStop;
        
        setSpinDegree(finalDegree);
        
        setTimeout(() => {
          setPrize(t.prizes[randomPrizeIndex]);
          setStep('result');
        }, 5500);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step]); 

  return (
    <div className="kiosk-container" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '1rem', zIndex: 10 }}>
        <button onClick={() => setLang('en')} style={{ background: lang === 'en' ? 'var(--accent)' : 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>🇺🇸 EN</button>
        <button onClick={() => setLang('ko')} style={{ background: lang === 'ko' ? 'var(--accent)' : 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>🇰🇷 KO</button>
        <button onClick={() => setLang('es')} style={{ background: lang === 'es' ? 'var(--accent)' : 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>🇪🇸 ES</button>
      </div>

      {step === 'review' && (
        <div className="glass-panel">
          <div className="logo-container">
            <div className="logo-two">TWO</div>
            <div className="logo-box">BOX</div>
          </div>
          <h1 style={{ fontSize: '1.5rem', marginTop: '1rem' }}>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
          
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={48}
                className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
              />
            ))}
          </div>

          <div style={{ position: 'relative', width: '100%', marginBottom: '2rem' }}>
            <textarea
              className="review-textarea"
              style={{ marginBottom: 0 }}
              placeholder={t.placeholder}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button
              onClick={toggleListening}
              style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: isListening ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                color: isListening ? '#ef4444' : 'var(--text-secondary)',
                transition: 'all 0.3s'
              }}
              title={isListening ? t.stopMic : t.startMic}
            >
              {isListening ? <MicOff size={24} style={{ animation: 'pulse 2s infinite' }} /> : <Mic size={24} />}
            </button>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleSubmitReview}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : t.submitBtn}
          </button>
        </div>
      )}

      {step === 'qr' && (
        <div className="glass-panel" style={{ maxWidth: '600px' }}>
          <h1>{t.qrTitle}</h1>
          <p className="subtitle">{t.qrSubtitle}</p>
          
          <div className="qr-container">
            <QRCodeSVG 
              value={`${MOBILE_APP_URL}/?session=${sessionId}&lang=${lang}`}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>

          <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t.qrLink}</p>
            <a 
              href={`${MOBILE_APP_URL}/?session=${sessionId}&lang=${lang}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'underline', wordBreak: 'break-all' }}
            >
              {`${MOBILE_APP_URL}/?session=${sessionId}&lang=${lang}`}
            </a>
          </div>

          <p className="waiting-text" style={{ marginTop: '2rem' }}>
            <Loader2 className="waiting-icon" /> {t.waiting}
          </p>
        </div>
      )}

      {step === 'roulette' && (
        <div className="glass-panel" style={{ maxWidth: '600px' }}>
          <h1>{t.rouletteTitle}</h1>
          <p className="subtitle">{t.rouletteSub}</p>
          
          <div className="roulette-container">
            <div className="roulette-pointer"></div>
            <div className="roulette-center"></div>
            <div 
              className="roulette-wheel"
              style={{ transform: `rotate(${spinDegree}deg)` }}
            >
            </div>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div className="glass-panel">
          <Gift size={64} color="var(--warning)" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
          <h1>{t.resultTitle}</h1>
          <p className="subtitle" style={{ fontSize: '2rem', color: 'white', fontWeight: 700 }}>
            {t.resultPrize(prize)}
          </p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {t.resultSub}
          </p>
          <button 
            className="btn-primary" 
            onClick={() => {
              setStep('review');
              setRating(0);
              setReviewText('');
            }}
          >
            {t.restart}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
