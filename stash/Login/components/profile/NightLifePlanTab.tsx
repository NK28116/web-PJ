import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { mockUser } from '../../const/mockUser';

interface Plan {
  id: string;
  title: string;
  description: string;
  duration: string;
  createdAt: string;
  shops: Array<{
    id: string;
    name: string;
    placeId: string;
  }>;
  images: string[];
}

interface NightLifePlanProps {
  user?: typeof mockUser;
}

const PlanList: React.FC<{ plans: Plan[] }> = ({ plans }) => {
  return (
    <View style={styles.planListContainer}>
      {plans.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={styles.planItem}
          onPress={() => router.push(`/plan/${plan.id}`)}
        >
          <View style={styles.divider} />
          <View style={styles.planContent}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planDescription} numberOfLines={2}>
              {plan.description}
            </Text>
            <Text style={styles.planDuration}>{plan.duration}</Text>
            <Text style={styles.planDate}>{plan.createdAt}</Text>
            {plan.shops.length > 0 && (
              <View style={styles.shopsContainer}>
                {plan.shops.slice(0, 3).map((shop) => (
                  <Text key={shop.id} style={styles.shopName}>
                    {shop.name}
                  </Text>
                ))}
              </View>
            )}
            {plan.images.length > 0 && (
              <View style={styles.imagesContainer}>
                {plan.images.slice(0, 4).map((image, index) => (
                  <View key={index} style={styles.imageThumbnail}>
                    <Text>{image}</Text>
                  </View>
                ))}
                {plan.images.length > 4 && (
                  <View style={styles.moreImagesOverlay}>
                    <Text style={styles.moreImagesText}>もっと見る</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={styles.divider} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const NightLifePlan: React.FC<NightLifePlanProps> = ({ user = mockUser }) => {
  const hasPlan = user.plan && user.plan.length > 0;

  if (!hasPlan) {
    return (
      <View style={styles.container}>
        <Text>画像</Text>
        <Text style={styles.emptyText}>
          PLANを作成して{'\n'}あなたの夜を記録しよう
        </Text>
        <Text style={styles.createButton} onPress={() => {}}>
          PLANを作成
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <PlanList plans={user.plan} />
    </View>
  );
};

export default NightLifePlan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  planListContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  planItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  planContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  planDuration: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  planDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  shopsContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  shopName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  imageThumbnail: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  moreImagesOverlay: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  createButton: {
    fontSize: 14,
    color: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
});
