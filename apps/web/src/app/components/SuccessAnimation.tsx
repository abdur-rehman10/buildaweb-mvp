import { useEffect, useState } from 'react';
import { CheckCircle, PartyPopper } from 'lucide-react';

interface SuccessAnimationProps {
  message: string;
  onComplete?: () => void;
  showConfetti?: boolean;
}

export function SuccessAnimation({ message, onComplete, showConfetti = false }: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 300);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="fixed inset-0 flex items-center justify-center z-50 animate-in fade-in duration-300">
        <div className="bg-black/50 absolute inset-0" />
        <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mb-4 animate-in zoom-in duration-500">
              <CheckCircle className="h-10 w-10 text-success animate-in zoom-in duration-700" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Success!</h3>
            <p className="text-muted-foreground">{message}</p>
          </div>
        </div>
      </div>
    </>
  );
}

// Confetti animation
function Confetti() {
  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
  const pieces = 50;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: pieces }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: '10px',
            height: '10px',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// Inline success message
export function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3 animate-in slide-in-from-top duration-300">
      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
      <p className="text-sm text-success font-medium">{message}</p>
    </div>
  );
}

// Success checkmark animation
export function CheckmarkAnimation() {
  return (
    <div className="inline-flex items-center justify-center">
      <svg
        className="checkmark"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52 52"
        width="52"
        height="52"
      >
        <circle
          className="checkmark-circle"
          cx="26"
          cy="26"
          r="25"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          className="checkmark-check"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
        />
      </svg>
    </div>
  );
}

// Add to global CSS
const styles = `
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.animate-confetti {
  animation: confetti ease-in forwards;
}

.checkmark {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #22c55e;
  stroke-miterlimit: 10;
  box-shadow: inset 0px 0px 0px #22c55e;
  animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #22c55e;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes scale {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0px 0px 0px 30px #22c55e;
  }
}
`;
