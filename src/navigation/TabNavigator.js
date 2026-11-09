import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import UpcomingRacesScreen from '../screens/UpcomingRacesScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

const tabIcons = {
  Upcoming: 'list-outline',
  Calendar: 'calendar-outline',
  History: 'time-outline',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Upcoming"
        component={UpcomingRacesScreen}
        options={{ title: 'Próximas', tabBarAccessibilityLabel: 'Aba Próximas' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'Calendário', tabBarAccessibilityLabel: 'Aba Calendário' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Histórico', tabBarAccessibilityLabel: 'Aba Histórico' }}
      />
    </Tab.Navigator>
  );
}
