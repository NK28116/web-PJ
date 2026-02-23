import { StyleSheet, Text, View } from 'react-native';

const DrinkCollection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>DrinkCollection</Text>
    </View>
  );
};

export default DrinkCollection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
