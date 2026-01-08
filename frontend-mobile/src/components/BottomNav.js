import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Início' },
    { path: '/contas', icon: '💳', label: 'Contas' },
    { path: '/rendimentos', icon: '💰', label: 'Renda' },
    { path: '/dividas', icon: '🏦', label: 'Dívidas' },
    { path: '/mesada', icon: '👶', label: 'Mesada' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <div className="nav-icon">{item.icon}</div>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;