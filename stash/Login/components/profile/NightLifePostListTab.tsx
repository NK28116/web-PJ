import { StyleSheet, Text, View } from 'react-native';

const NightLifePostList: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>NightLifePostList</Text>
    </View>
  );
};

export default NightLifePostList;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
});
