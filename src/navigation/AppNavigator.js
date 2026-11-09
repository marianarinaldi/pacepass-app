import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import AddRaceScreen from '../screens/AddRaceScreen';
import RaceDetailScreen from '../screens/RaceDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddRace"
          component={AddRaceScreen}
          options={{ title: 'Nova corrida', presentation: 'modal' }}
        />
        <Stack.Screen
          name="RaceDetail"
          component={RaceDetailScreen}
          options={{ title: 'Detalhes da corrida' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
