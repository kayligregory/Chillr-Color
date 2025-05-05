// app/(tabs)/chillr.tsx (Updated for accessibility)
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, 
  Linking, AccessibilityInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AccessibleTripCard from '../../components/AccessibleTripCard';

// Sample data remains the same as in your original code
const SAMPLE_FLIGHTS = [
  // ... your existing flight data
];

const Chillr = () => {
  const [flights, setFlights] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    // Check if screen reader is enabled
    AccessibilityInfo.isScreenReaderEnabled().then(
      screenReaderEnabled => {
        setIsScreenReaderEnabled(screenReaderEnabled);
      }
    );

    // Listen for screen reader changes
    const screenReaderChangedSubscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      screenReaderEnabled => {
        setIsScreenReaderEnabled(screenReaderEnabled);
      }
    );

    // Use the sample data
    setFlights(SAMPLE_FLIGHTS);
    
    // Update current time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
      screenReaderChangedSubscription.remove();
    };
  }, []);

  const handleCheckIn = async (trip) => {
    try {
      // Open the check-in URL in a browser
      if (trip['Check In URL']) {
        await Linking.openURL(trip['Check In URL']);
        
        // Update the trip's checked-in status
        const updatedFlights = flights.map(f => 
          f['Confirmation Number'] === trip['Confirmation Number'] 
            ? {...f, "Checked In": "yes"} 
            : f
        );
        setFlights(updatedFlights);
        
        // Announce to screen reader
        AccessibilityInfo.announceForAccessibility('Check-in process started. Opening airline website.');
      }
    } catch (error) {
      console.error('Error opening check-in URL:', error);
      AccessibilityInfo.announceForAccessibility('Failed to open check-in website.');
    }
  };

  const handleGetDirections = (trip) => {
    const destination = `${trip['Departure destination']} ${trip['Terminal']}`;
    
    try {
      if (Platform.OS === 'ios') {
        Linking.openURL(`maps://app?daddr=${encodeURIComponent(destination)}`);
      } else if (Platform.OS === 'android') {
        Linking.openURL(`google.navigation:q=${encodeURIComponent(destination)}`);
      } else {
        // Web fallback
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`);
      }
      
      // Announce to screen reader
      AccessibilityInfo.announceForAccessibility('Opening maps with directions to your terminal.');
    } catch (error) {
      console.error('Error opening maps:', error);
      AccessibilityInfo.announceForAccessibility('Failed to open maps application.');
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="airplane-outline" size={48} color="#023E73" />
      <Text style={styles.emptyText}>No upcoming trips</Text>
      <Text style={styles.emptySubtext}>Your trips will appear here once added</Text>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#023E73" barStyle="light-content" />
      
      <View style={styles.headerContainer} accessible={true} accessibilityRole="header">
        <Text style={styles.header}>My Trips</Text>
        <View style={styles.iconContainer}>
          <Ionicons name="airplane" size={24} color="#FFFFFF" />
        </View>
      </View>
      
      {flights.length > 0 ? (
        <FlatList
          data={flights}
          keyExtractor={(item, index) => item['Confirmation Number'] || `trip-${index}`}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <AccessibleTripCard
              trip={item}
              currentTime={currentTime}
              onPress={() => navigation.navigate('TripDetails', { trip: item })}
              onCheckIn={() => handleCheckIn(item)}
              onGetDirections={() => handleGetDirections(item)}
            />
          )}
          initialNumToRender={3}
          showsVerticalScrollIndicator={true}
          accessibilityLabel="List of upcoming trips"
        />
      ) : (
        renderEmptyState()
      )}
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.helpButton}
          accessible={true}
          accessibilityLabel="Get help with your trips"
          accessibilityRole="button"
          accessibilityHint="Opens help options"
        >
          <Ionicons name="help-circle" size={28} color="#023E73" />
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F0F8FF', // Lighter background for better contrast
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#023E73', // Darker blue for better contrast
    paddingTop: 60, // Account for status bar
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A77C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#023E73',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#555555',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#E0E9F5',
  },
  helpText: {
    marginLeft: 8,
    color: '#023E73',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Chillr;