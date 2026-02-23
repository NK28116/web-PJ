import { useUser } from '@/src/contexts/UserContext';
import Entypo from '@expo/vector-icons/Entypo';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileAreaProps {
  user?: {
    name: string;
    nickname: string;
    nightLifeCharacter?: string;
    characterImgUrl?: string;
    bio?: string;
    area?: string;
    posts: number;
    followers: number;
    followings: number;
    type?: {
      energy: number;
      purpose: number;
      atmosphere: number;
      alcohol: number;
      music: number;
    };
  };
}

const Stat: React.FC<{
  label: string;
  value: string | number | undefined;
  onPress?: () => void;
}> = ({ label, value, onPress }) => (
  <TouchableOpacity
    style={styles.statBox}
    onPress={onPress}
    disabled={!onPress}
  >
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value ? value : '---'}</Text>
  </TouchableOpacity>
);

const ProfileArea: React.FC<ProfileAreaProps> = () => {
  const router = useRouter();
  const { user } = useUser();

  const handleEditPress = () => {
    router.push('/(tabs)/profile/edit');
  };

  const handleFollowersPress = () => {
    router.push('/(tabs)/profile/followers');
  };

  const handleSharePress = () => {
    //現状は Linking.createURL('/u/<uid>')
    // を埋め込んでおり、ExpoのスキームやWebでも動く形です。
   // 将来、独自ドメインのURLを使う場合は shareUrl の生成部分を
   // https://your.domain/u/${uid} に差し替えればOKです。
    //中央ロゴを入れたい場合は logo={require('.../assets/xxx.png')}' を有効化してください。
    if (!user?.uid) return;
    router.push(`/u/${user.uid}`);
  };

  return (
    <View style={styles.container}>
      {/* アバター・統計 */}
      <View style={styles.topRow}>
        <Image
          source={{
            uri: user.characterImgUrl, // ダミー画像
          }}
          style={styles.avatar}
        />
        {/*プロフィールのシェア*/}
        <TouchableOpacity onPress={handleSharePress}>
          <Entypo name="paper-plane" size={24} color="white" />
        </TouchableOpacity>
        {/*プロフィールの編集*/}
        <TouchableOpacity onPress={handleEditPress}>
          <SimpleLineIcons name="note" size={24} color="white" />
        </TouchableOpacity>

        {/* ニックネーム */}
        <Text style={styles.name}>{user.nickName}</Text>

        {/* ナイトライフキャラクター */}
        <View style={styles.nightLifeCharacterContainer}>
          <Image
            source={require('../../../public/nightLifeCharcterIcons/partyMonster.png')}
            style={styles.nightLifeCharacterIcon}
          />
          <Text style={styles.nightLifeCharacter}>
            {user.nightLifeCharacter}
          </Text>
        </View>

        {/* 自己紹介 */}
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

        <View style={styles.stats}>
          <Stat label="投稿" value={user.posts} />
          <Stat
            label="フォロワー"
            value={user.followers}
            onPress={handleFollowersPress}
          />
          <Stat
            label="フォロー中"
            value={user.followings}
            onPress={handleFollowersPress}
          />
          <Stat label="エリア" value={user.area} />
        </View>
      </View>

      {/* ナイトライフタイプ（棒グラフ風） 
      {user.type && (
        <View style={styles.typeContainer}>
          {Object.entries(user.type).map(([key, value]) => (
            <View key={key} style={styles.typeRow}>
              <Text style={styles.typeLabel}>{key}</Text>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${value}%` }]} />
              </View>
            </View>
          ))}
        </View>
      )}
      */}
    </View>
  );
};

export default ProfileArea;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#0F0F0F',
    flex: 1,
    flexDirection: 'column',
  },
  topRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginRight: 20,
  },
  stats: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: '#b71d1d',
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  nightLifeCharacterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nightLifeCharacterIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
    resizeMode: 'contain',
  },
  nightLifeCharacter: {
    color: '#ccc',
    fontSize: 14,
  },
  bio: {
    color: '#ddd',
    fontSize: 13,
    marginBottom: 6,
  },
});
