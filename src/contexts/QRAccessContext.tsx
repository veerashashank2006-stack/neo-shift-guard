import { createContext, useContext, useState, ReactNode } from 'react';

interface QRAccessContextType {
  isQRAuthenticated: boolean;
  setQRAuthenticated: (value: boolean) => void;
  resetQRAccess: () => void;
}

const QRAccessContext = createContext<QRAccessContextType | undefined>(undefined);

export function QRAccessProvider({ children }: { children: ReactNode }) {
  const [isQRAuthenticated, setIsQRAuthenticated] = useState(false);

  const setQRAuthenticated = (value: boolean) => {
    setIsQRAuthenticated(value);
  };

  const resetQRAccess = () => {
    setIsQRAuthenticated(false);
  };

  return (
    <QRAccessContext.Provider value={{ isQRAuthenticated, setQRAuthenticated, resetQRAccess }}>
      {children}
    </QRAccessContext.Provider>
  );
}

export function useQRAccess() {
  const context = useContext(QRAccessContext);
  if (context === undefined) {
    throw new Error('useQRAccess must be used within a QRAccessProvider');
  }
  return context;
}
