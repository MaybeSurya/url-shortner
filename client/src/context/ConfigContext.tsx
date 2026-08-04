import React, { createContext, useContext } from 'react';

interface ConfigContextType {
  siteName: string;
  defaultDomain: string;
}

const ConfigContext = createContext<ConfigContextType>({
  siteName: "Surya's URL Shortening Service",
  defaultDomain: 'sury.cc',
});

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const siteName = import.meta.env.VITE_SITE_NAME || "Surya's URL Shortening Service";
  const defaultDomain = import.meta.env.VITE_DEFAULT_DOMAIN || 'sury.cc';

  return (
    <ConfigContext.Provider value={{ siteName, defaultDomain }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
