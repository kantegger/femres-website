import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

export default function ModalPortal({ children }: ModalPortalProps) {
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const portalRoot = document.getElementById('modal-root');
    if (!portalRoot) {
      const div = document.createElement('div');
      div.id = 'modal-root';
      document.body.appendChild(div);
      portalRef.current = div;
    } else {
      portalRef.current = portalRoot as HTMLDivElement;
    }

    return () => {
      if (portalRef.current && portalRef.current.parentElement) {
        portalRef.current.parentElement.removeChild(portalRef.current);
      }
    };
  }, []);

  if (!portalRef.current) return null;

  return createPortal(children, portalRef.current);
}