import { ThumbnailList } from '@/src/components/thumbnailArray/ThumbnailList';
import { mockUser } from '@/src/const/mockUser';
import { StyleSheet, Text, View } from 'react-native';
import ProfileRadarChart from './ProfileRadarCharts';

const NightLifeCollection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Type</Text>
      <ProfileRadarChart />
      <Text style={styles.nickName}>{mockUser.nickName}</Text>

      <Text style={styles.title}>My Plan</Text>
      <Text style={styles.title}>{mockUser.plan.length}</Text>
      <button onClick={() => {}}>もっと見る</button>

      <Text style={styles.title}>ドリコレ</Text>
      <Text style={styles.title}>{mockUser.DrinkCollection.length}</Text>
      <button onClick={() => {}}>もっと見る</button>

      <Text style={styles.title}>お気に入り店舗</Text>
      <button onClick={() => {}}>追加する</button>
      <ThumbnailList user={mockUser.favoritePlace} />
    </View>
  );
};

export default NightLifeCollection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1de6a3ff',
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c53333ff',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  nickName: {
    fontSize: 16,
    fontWeight: '600',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
