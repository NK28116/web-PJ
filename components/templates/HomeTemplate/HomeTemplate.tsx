import React, { useState, useCallback, useMemo } from 'react';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { useAuth } from '@/hooks/useAuth';
import {
  DashboardSection,
  DashboardStats,
  AccountLinkingSection,
  AccountLinkingState,
  ShopListSection,
  Shop,
} from '@/organisms/Home';

export interface HomeTemplateProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'review';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'review') => void;
  children?: React.ReactNode;
}

// Mock data for demonstration
const INITIAL_STATS: DashboardStats = {
  systemStatus: '-',
  aiReplyWaiting: null,
  newReviews: null,
  todayProfileViews: null,
  todaySearchCount: null,
  weekOverWeek: null,
  monthOverMonth: null,
};

const LINKED_STATS: DashboardStats = {
  systemStatus: '正常稼働中',
  aiReplyWaiting: 3,
  newReviews: 5,
  todayProfileViews: 128,
  todaySearchCount: 45,
  weekOverWeek: '+12%',
  monthOverMonth: '+8%',
};

export const HomeTemplate: React.FC<HomeTemplateProps> = ({
  className,
  activeTab = 'home',
  onTabChange,
}) => {
  const { user } = useAuth();

  // Account linking state management
  const [linkingState, setLinkingState] = useState<AccountLinkingState>({
    google: false,
    instagram: false,
  });

  // AI priority action (null when no action)
  const [aiPriorityAction] = useState<string | null>(null);

  // Dashboard stats - changes based on Google linking state
  const stats = linkingState.google ? LINKED_STATS : INITIAL_STATS;

  // Shops list using user info
  const shops: Shop[] = useMemo(() => [
    {
      id: user.wyzeId || '0001',
      email: user.email || 'wyzesystem○○@gmail.com',
      status: 'pending',
      logoText: 'w',
    },
  ], [user]);

  // Event handlers
  const handleToggleGoogle = useCallback(() => {
    setLinkingState((prev) => ({
      ...prev,
      google: !prev.google,
    }));
  }, []);

  const handleToggleInstagram = useCallback(() => {
    setLinkingState((prev) => ({
      ...prev,
      instagram: !prev.instagram,
    }));
  }, []);

  const handleRefresh = useCallback(() => {
    // Refresh logic will be implemented when API is ready
    console.log('Dashboard refresh requested');
  }, []);

  const handleAddAccount = useCallback(() => {
    // Add account logic will be implemented when API is ready
    console.log('Add account requested');
  }, []);

  const handleShopClick = useCallback((shopId: string) => {
    // Shop click logic will be implemented when navigation is ready
    console.log('Shop clicked:', shopId);
  }, []);

  return (
    <BaseTemplate
      className={className}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <div className="space-y-6 pt-6 pb-20">
        {/* Dashboard Section */}
        <DashboardSection
          isGoogleLinked={linkingState.google}
          aiPriorityAction={aiPriorityAction}
          stats={stats}
          onRefresh={handleRefresh}
        />

        {/* Account Linking Section */}
        <AccountLinkingSection
          linkingState={linkingState}
          onToggleGoogle={handleToggleGoogle}
          onToggleInstagram={handleToggleInstagram}
          onAddAccount={handleAddAccount}
        />

        {/* Shop List Section */}
        <ShopListSection
          shops={shops}
          onShopClick={handleShopClick}
        />
      </div>
    </BaseTemplate>
  );
};
