// app/(tabs)/_layout.tsx
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Chillr from './chillr';
import Explore from './explore';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Chillr') {
            iconName = focused ? 'airplane' : 'airplane-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FB8500',
        tabBarInactiveTintColor: '#8ECAE6',
        tabBarStyle: {
          paddingVertical: 5,
          height: 60,
          backgroundColor: '#023047',
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 13,
        }
      })}
    >
      <Tab.Screen name="Chillr" component={Chillr} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen 
        name="TripDetails" 
        component={require('./tripDetails').default}
        options={{ 
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />
    </Tab.Navigator>
  );
}