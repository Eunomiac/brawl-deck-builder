// MTG Brawl Deck Builder - Navigation Component
import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Tab[];
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  tabs
}) => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <a href="#" className="nav-brand">MTG Brawl Deck Builder</a>
        <ul className="nav-tabs">
          {tabs.map((tab) => (
            <li key={tab.id} className="nav-tab">
              <a
                href="#"
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onTabChange(tab.id);
                }}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
