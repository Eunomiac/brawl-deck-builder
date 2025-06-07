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
      <div className="container">
        <div className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
