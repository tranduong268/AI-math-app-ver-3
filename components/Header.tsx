

import React from 'react';
import { theme } from '../src/config/theme';

const Header: React.FC = () => {
  return (
    <header className={`${theme.colors.bg.header} ${theme.colors.text.header} p-4 md:p-6 rounded-xl shadow-2xl text-center`}>
      <p className={`${theme.fontSizes.headerSubtitle} ${theme.colors.text.headerWelcome}`}>🌟 Chào mừng bé đến với trò chơi 🌟</p>
      <h1 className={`${theme.fontSizes.headerTitle} ${theme.colors.text.headerBrand} font-bold tracking-tight mt-1`}>TOÁN HỌC THÔNG MINH 🧠</h1>
    </header>
  );
};

export default Header;