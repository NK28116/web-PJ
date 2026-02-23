import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomDynamicModal } from '../molecule/CustomDynamicModal';

interface Follower {
  id: string;
  name: string;
  nickname: string;
  avatar: string;
  isFollowing: boolean;
  followsMe: boolean;
}

type TabType = 'followers' | 'following';

const FollowerList: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('followers');
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState<Follower | null>(
    null
  );
  const [followers, setFollowers] = useState<Follower[]>([
    {
      id: '1',
      name: 'ユーザーネーム',
      nickname: 'ニックネーム',
      avatar: 'https://i.pravatar.cc/200?img=1',
      isFollowing: true,
      followsMe: true,
    },
    {
      id: '2',
      name: 'ユーザーネーム',
      nickname: 'ニックネーム',
      avatar: 'https://i.pravatar.cc/200?img=2',
      isFollowing: false,
      followsMe: true,
    },
    {
      id: '3',
      name: 'ユーザーネーム',
      nickname: 'ニックネーム',
      avatar: 'https://i.pravatar.cc/200?img=3',
      isFollowing: true,
      followsMe: false,
    },
    {
      id: '4',
      name: 'ユーザーネーム',
      nickname: 'ニックネーム',
      avatar: 'https://i.pravatar.cc/200?img=4',
      isFollowing: false,
      followsMe: true,
    },
    {
      id: '5',
      name: 'ユーザーネーム',
      nickname: 'ニックネーム',
      avatar: 'https://i.pravatar.cc/200?img=5',
      isFollowing: true,
      followsMe: false,
    },
  ]);

  const handleBackPress = () => {
    router.push('/(tabs)/profile');
  };

  const handleFollowToggle = (id: string) => {
    setFollowers((prev) =>
      prev.map((follower) =>
        follower.id === id
          ? { ...follower, isFollowing: !follower.isFollowing }
          : follower
      )
    );
  };

  const handleDeletePress = (follower: Follower) => {
    setSelectedFollower(follower);
    setModalVisible(true);
  };

  const executeDelete = () => {
    if (selectedFollower) {
      setFollowers((prev) => prev.filter((f) => f.id !== selectedFollower.id));
      setModalVisible(false);
      setSelectedFollower(null);
    }
  };

  const filteredFollowers = followers.filter((follower) => {
    const matchesSearch =
      follower.name.includes(searchText) ||
      follower.nickname.includes(searchText);

    if (activeTab === 'followers') {
      return matchesSearch && follower.followsMe;
    } else {
      return matchesSearch && follower.isFollowing;
    }
  });

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <SimpleLineIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'followers' ? 'フォロワー' : 'フォロー中'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 検索バー */}
      <View style={styles.searchContainer}>
        <SimpleLineIcons name="magnifier" size={16} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="検索"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* タブ */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
          onPress={() => setActiveTab('followers')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'followers' && styles.activeTabText,
            ]}
          >
            フォロー中
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setActiveTab('following')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'following' && styles.activeTabText,
            ]}
          >
            フォロワー
          </Text>
        </TouchableOpacity>
      </View>

      {/* フォロワーリスト */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
      >
        {filteredFollowers.map((follower) => (
          <View key={follower.id} style={styles.followerItem}>
            <Image source={{ uri: follower.avatar }} style={styles.avatar} />
            <View style={styles.followerInfo}>
              <Text style={styles.userName}>{follower.name}</Text>
              <Text style={styles.nickName}>{follower.nickname}</Text>
            </View>
            <View style={styles.actionButtons}>
              {activeTab === 'followers' && !follower.isFollowing && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePress(follower)}
                >
                  <Text style={styles.deleteButtonText}>削除</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.followButton,
                  follower.isFollowing && styles.followingButton,
                ]}
                onPress={() => handleFollowToggle(follower.id)}
              >
                <Text
                  style={[
                    styles.followButtonText,
                    follower.isFollowing && styles.followingButtonText,
                  ]}
                >
                  {follower.isFollowing ? 'フォロー中' : 'フォローバック'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 削除確認モーダル */}
      <CustomDynamicModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="フォロワーを削除"
      >
        <View style={styles.modalInnerContainer}>
          <Text style={styles.modalMessage}>
            {selectedFollower?.name}さんをフォロワーから削除しますか？
          </Text>
          <Text style={styles.modalSubMessage}>
            相手に通知されることはありません。
          </Text>

          <TouchableOpacity
            style={styles.modalDeleteButton}
            onPress={executeDelete}
          >
            <Text style={styles.modalDeleteButtonText}>削除</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCancelButtonText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </CustomDynamicModal>
    </View>
  );
};

export default FollowerList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: 'white',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FFD700',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
  },
  activeTabText: {
    color: '#FFD700',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  followerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  nickName: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  followingButton: {
    backgroundColor: '#333',
  },
  followButtonText: {
    color: 'black',
    fontSize: 12,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  modalInnerContainer: {
    paddingHorizontal: 24,
  },
  modalMessage: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubMessage: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalDeleteButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalDeleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
