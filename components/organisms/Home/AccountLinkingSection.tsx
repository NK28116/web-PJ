import React from 'react';
import { Text } from '@/atoms/Text';
import { Button } from '@/atoms/Button';
import { cn } from '@/utils/cn';

export interface AccountLinkingState {
  google: boolean;
  instagram: boolean;
}

export interface AccountLinkingSectionProps {
  className?: string;
  linkingState: AccountLinkingState;
  onToggleGoogle: () => void;
  onToggleInstagram: () => void;
  onAddAccount?: () => void;
}

export const AccountLinkingSection: React.FC<AccountLinkingSectionProps> = ({
  className,
  linkingState,
  onToggleGoogle,
  onToggleInstagram,
  onAddAccount,
}) => {
  return (
    <section className={cn('space-y-3', className)}>
      <div className="border border-gray-300 rounded-lg p-4 space-y-4 bg-transparent">
        <Text className="text-[15px] font-normal text-black pl-2">
          アカウント連携
        </Text>

        {/* Google Account Row */}
        <AccountRow
          icon={<GoogleIcon />}
          serviceName="Google"
          isLinked={linkingState.google}
          onToggle={onToggleGoogle}
        />

        {/* Instagram Account Row */}
        <AccountRow
          icon={<InstagramIcon />}
          serviceName="Instagram"
          isLinked={linkingState.instagram}
          onToggle={onToggleInstagram}
        />

        {/* Add Account Footer */}
        <div className="flex justify-end pt-2 border-t border-gray-200">
          <Button
            className="text-[10px] text-[#006355] font-bold"
            onClick={onAddAccount}
          >
            アカウントを追加
          </Button>
        </div>
      </div>
    </section>
  );
};

interface AccountRowProps {
  icon: React.ReactNode;
  serviceName: string;
  isLinked: boolean;
  onToggle: () => void;
}

const AccountRow: React.FC<AccountRowProps> = ({
  icon,
  serviceName,
  isLinked,
  onToggle,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Service Icon */}
        <div className="w-8 h-8 bg-white flex items-center justify-center">
          {icon}
        </div>
        <div className="flex flex-col">
          <Text className="text-[12px] text-black">{serviceName}</Text>
          <Text className="text-[10px] text-black">
            {isLinked ? '連携済み' : '未連携'}
          </Text>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        size="sm"
        className={cn(
          'text-[10px] h-8 px-4 rounded',
          isLinked
            ? 'bg-gray-400 hover:bg-gray-500 text-white'
            : 'bg-[#006355] hover:bg-[#004d42] text-white'
        )}
        onClick={onToggle}
      >
        {isLinked ? '解除する' : '連携する'}
      </Button>
    </div>
  );
};

const GoogleIcon: React.FC = () => (
  <span className="text-xl font-bold text-[#4285F4]">G</span>
);

const InstagramIcon: React.FC = () => (
  <span className="text-xl font-bold text-[#df42f4]">I</span>
);
