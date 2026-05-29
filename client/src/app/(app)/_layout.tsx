import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#858585',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 8,
          borderTopRightRadius: 5,
          borderTopLeftRadius: 5
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      {/* Home Screen */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Transactions Screen */}
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Add Expense Screen - Centered with special styling */}
      <Tabs.Screen
        name="expenses/add-expense"
        options={{
          title: "Add Expenses",
          headerShown: false,
          tabBarIcon: () => (
            <View
              style={{
                backgroundColor: '#2563EB',
                borderRadius: 30,
                width: 52,
                height: 52,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -20,
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Ionicons name="add" size={28} color="#ffffff" />
            </View>
          ),
          tabBarLabel: "Add",
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#8e8e93',
        }}
      />

      {/* Categories Screen */}
      <Tabs.Screen
        name="category/categories"
        options={{
          title: "Categories",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Profile Screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden screens (not shown in tab bar) */}
      <Tabs.Screen
        name="expenses/edit-expense"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="category/add-category"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  )
}