import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from './Icons';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'am' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-theme-card border border-theme hover:bg-theme-muted transition-colors"
            title="Switch Language"
        >
            <Icons.Globe size={16} className="text-theme-primary" />
            <span className="text-sm font-medium">
                {i18n.language === 'en' ? 'English' : 'አማርኛ'}
            </span>
        </button>
    );
};
