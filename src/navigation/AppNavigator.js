import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UpcomingRacesScreen from '../screens/UpcomingRacesScreen';
import AddRaceScreen from '../screens/AddRaceScreen';
import RaceDetailScreen from '../screens/RaceDetailScreen';
const Stack = createNativeStackNavigator();
export default function AppNavigator() { return <NavigationContainer><Stack.Navigator><Stack.Screen name="UpcomingRaces" component={UpcomingRacesScreen} options={{ title: 'PacePass' }} /><Stack.Screen name="AddRace" component={AddRaceScreen} options={{ title: 'Nova corrida' }} /><Stack.Screen name="RaceDetail" component={RaceDetailScreen} options={{ title: 'Detalhes' }} /></Stack.Navigator></NavigationContainer>; }
