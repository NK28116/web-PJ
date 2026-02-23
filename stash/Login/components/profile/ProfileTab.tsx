type TabType = "character" | "plan" | "post" | "drink";

interface ProfileTabProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "character", label: "キャラクター" },
    { id: "plan", label: "プラン" },
    { id: "post", label: "投稿" },
    { id: "drink", label: "ドリンク" }
  ];

  return (
    <div>
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as TabType)}
            className={`flex-1 py-2 ${
              activeTab === tab.id 
                ? "border-b-2 border-blue-500 font-bold" 
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTab;
