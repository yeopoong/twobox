import { useState, useEffect } from 'react';
import { Copy, CheckCircle2, MapPin, Loader2, Info } from 'lucide-react';
import './index.css';

const API_BASE_URL = 'https://twobox.onrender.com';
const GOOGLE_MAPS_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJ17JclzpVwokR9e8rOOdoQEs';

type Lang = 'en' | 'ko' | 'es';

const DICT = {
  en: {
    loading: "Loading data...",
    invalidAccess: "Invalid access.",
    scanAgain: "Please scan the QR code again.",
    syncComplete: "Sync Complete!",
    syncSub: "Did you post your review on Google Maps?<br />Please check the kiosk tablet screen now!",
    copyTitle: "Copy Your Review",
    copySub: "This is the review you wrote on the kiosk.<br/>Please copy and leave it on Google Maps!",
    writeTitle: "Write Your Review",
    writeSub: "Please open Google Maps and write your honest review!",
    pasteTip: "When Google Maps opens, long-press the input field and select 'Paste'.",
    writeTip: "When Google Maps opens, tap the stars and write your review directly.",
    copied: "Copied!",
    copyBtn: "Copy Review Text",
    autoCopy: "Auto-copy Review & Open Google Maps!",
    openMapsBtn: "Open Google Maps & Write Review!",
    finalStep: "Did you post the review on Google Maps? Please click the button below!",
    finalBtn: "Yes, I have posted the review!",
    errorCopy: "An error occurred. Auto-copy might not be supported in your browser.",
    errorComm: "Communication error with the server. Please try again."
  },
  ko: {
    loading: "데이터를 불러오는 중입니다...",
    invalidAccess: "유효하지 않은 접근입니다.",
    scanAgain: "QR 코드를 다시 스캔해주세요.",
    syncComplete: "연동이 완료되었습니다!",
    syncSub: "구글 맵에 리뷰를 등록하셨나요?<br />이제 키오스크(태블릿) 화면을 확인해주세요!",
    copyTitle: "리뷰 텍스트 복사하기",
    copySub: "키오스크에서 작성하신 소중한 리뷰입니다.<br/>복사해서 구글 맵에 남겨주세요!",
    writeTitle: "리뷰 작성하기",
    writeSub: "아래 버튼을 눌러 구글 맵을 열고 솔직한 리뷰를 작성해주세요!",
    pasteTip: "구글 맵 리뷰 창이 열리면 입력 칸을 꾹 누르고 '붙여넣기'를 선택하세요.",
    writeTip: "구글 맵 리뷰 창이 열리면 별점을 선택하고 리뷰를 직접 입력해주세요.",
    copied: "복사 완료!",
    copyBtn: "리뷰 내용 복사하기",
    autoCopy: "리뷰 자동 복사 후 구글 맵 열기!",
    openMapsBtn: "구글 맵 열고 직접 리뷰 작성하기!",
    finalStep: "구글 맵에 리뷰를 등록하고 돌아오셨나요? 아래 버튼을 눌러주세요!",
    finalBtn: "네, 리뷰 등록을 완료했습니다!",
    errorCopy: "오류가 발생했습니다. 브라우저 환경에 따라 자동 복사가 지원되지 않을 수 있습니다.",
    errorComm: "서버와 통신 중 오류가 발생했습니다. 다시 시도해주세요."
  },
  es: {
    loading: "Cargando datos...",
    invalidAccess: "Acceso inválido.",
    scanAgain: "Por favor, escanee el código QR nuevamente.",
    syncComplete: "¡Sincronización completa!",
    syncSub: "¿Publicaste tu reseña en Google Maps?<br />¡Verifique la pantalla de la tableta quiosco ahora!",
    copyTitle: "Copia tu reseña",
    copySub: "Esta es la reseña que escribiste en el quiosco.<br/>¡Cópiala y déjala en Google Maps!",
    writeTitle: "Escribe tu reseña",
    writeSub: "¡Abre Google Maps y escribe tu reseña honesta!",
    pasteTip: "Cuando se abra Google Maps, mantenga presionado el campo de entrada y seleccione 'Pegar'.",
    writeTip: "Cuando se abra Google Maps, toque las estrellas y escriba su reseña directamente.",
    copied: "¡Copiado!",
    copyBtn: "Copiar texto de la reseña",
    autoCopy: "¡Copia automática y abre Google Maps!",
    openMapsBtn: "¡Abrir Google Maps y escribir reseña!",
    finalStep: "¿Publicaste la reseña en Google Maps? ¡Haz clic en el botón de abajo!",
    finalBtn: "¡Sí, he publicado la reseña!",
    errorCopy: "Ocurrió un error. Es posible que su navegador no admita la copia automática.",
    errorComm: "Error de comunicación con el servidor. Por favor, inténtelo de nuevo."
  }
};

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [hasOpenedMaps, setHasOpenedMaps] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang') as Lang;
  const lang: Lang = ['en', 'ko', 'es'].includes(langParam) ? langParam : 'en';
  const t = DICT[lang];

  useEffect(() => {
    const session = params.get('session');

    if (session) {
      setSessionId(session);
      fetchSessionData(session);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchSessionData = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReviewText(data.review_text || '');
      }
    } catch (e) {
      console.error('Failed to fetch session', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!reviewText) return;
    try {
      await navigator.clipboard.writeText(reviewText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleOpenMaps = async () => {
    if (!sessionId) return;

    try {
      if (reviewText) {
        await navigator.clipboard.writeText(reviewText);
        setIsCopied(true);
      }

      window.open(GOOGLE_MAPS_REVIEW_URL, '_blank');

      setHasOpenedMaps(true);

    } catch (e) {
      console.error('Failed to copy text', e);
      alert(t.errorCopy);
    }
  };

  const handleCompleteReview = async () => {
    if (!sessionId) return;
    setIsCompleting(true);
    try {
      await fetch(`${API_BASE_URL}/sessions/${sessionId}/complete`, {
        method: 'POST',
      });
      setIsDone(true);
    } catch (e) {
      console.error('Failed to complete session', e);
      alert(t.errorComm);
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="loader-container">
          <Loader2 size={48} className="animate-spin text-accent" />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="mobile-container">
        <div className="loader-container">
          <p>{t.invalidAccess}</p>
          <p className="text-secondary text-sm">{t.scanAgain}</p>
        </div>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="mobile-container" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <CheckCircle2 size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
        <h1>{t.syncComplete}</h1>
        <p className="subtitle" style={{ marginBottom: '2rem' }} dangerouslySetInnerHTML={{ __html: t.syncSub }}></p>
      </div>
    );
  }

  const hasText = reviewText.trim().length > 0;

  return (
    <div className="mobile-container">
      <div className="header">
        <div className="logo-container">
          <div className="logo-two">TWO</div>
          <div className="logo-box">BOX</div>
        </div>
        <h1>{hasText ? t.copyTitle : t.writeTitle}</h1>
        <p className="subtitle" dangerouslySetInnerHTML={{ __html: hasText ? t.copySub : t.writeSub }}></p>
      </div>

      <div className="info-box">
        <Info size={24} style={{ flexShrink: 0 }} />
        <div>
          <strong>Tip:</strong> {hasText ? t.pasteTip : t.writeTip}
        </div>
      </div>

      {hasText && (
        <div className="review-card">
          <div className="review-text">
            {reviewText}
          </div>

          <button
            className={`copy-btn ${isCopied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            {isCopied ? (
              <><CheckCircle2 size={18} /> {t.copied}</>
            ) : (
              <><Copy size={18} /> {t.copyBtn}</>
            )}
          </button>
        </div>
      )}

      <div className="action-area">
        {!hasOpenedMaps ? (
          <button
            className="primary-btn"
            onClick={handleOpenMaps}
          >
            <MapPin size={24} /> {hasText ? t.autoCopy : t.openMapsBtn}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="info-box" style={{ background: '#fef3c7', borderColor: '#fde68a', color: '#92400e', margin: 0 }}>
              <Info size={24} style={{ flexShrink: 0 }} />
              <div>
                <strong>Final:</strong> {t.finalStep}
              </div>
            </div>
            <button
              className="primary-btn"
              style={{ background: 'var(--success)' }}
              onClick={handleCompleteReview}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <><CheckCircle2 size={24} /> {t.finalBtn}</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
