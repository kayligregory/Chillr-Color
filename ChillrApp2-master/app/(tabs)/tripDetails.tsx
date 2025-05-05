// app/(tabs)/tripDetails.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

const TripDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { trip } = route.params || {};
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(trip?.['Checked In'] === 'yes');

  useEffect(() => {
    // Update current time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No trip data available.</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Return to Trips</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const getTimeStatus = (departureTime) => {
    const departureDate = new Date(departureTime);
    const timeDiff = departureDate.getTime() - currentTime.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return {
      hoursToDeparture: hoursDiff,
      isCheckInOpen: hoursDiff <= 24 && hoursDiff > 0,
      isTerminalInfo: hoursDiff <= 12 && hoursDiff > 2,
      isBoarding: hoursDiff <= 2 && hoursDiff > 0,
      isPast: hoursDiff <= 0
    };
  };

  const getMinutesRemaining = (departureTime) => {
    const departureDate = new Date(departureTime);
    const timeDiff = departureDate.getTime() - currentTime.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesDiff <= 0) return "Boarding closed";
    
    const hours = Math.floor(minutesDiff / 60);
    const minutes = minutesDiff % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m to boarding`;
    } else {
      return `${minutes}m to boarding`;
    }
  };

  const handleCheckIn = async () => {
    try {
      // Open the check-in URL in a browser
      if (trip['Check In URL']) {
        await Linking.openURL(trip['Check In URL']);
        setIsCheckedIn(true);
      }
    } catch (error) {
      console.error('Error opening check-in URL:', error);
    }
  };

  const openMaps = () => {
    const destination = `${trip['Departure destination']} ${trip['Terminal'] || 'Airport'}`;
    
    if (Platform.OS === 'ios') {
      Linking.openURL(`maps://app?daddr=${encodeURIComponent(destination)}`);
    } else if (Platform.OS === 'android') {
      Linking.openURL(`google.navigation:q=${encodeURIComponent(destination)}`);
    } else {
      // Web fallback
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`);
    }
  };

  const renderActionButton = () => {
    const status = getTimeStatus(trip['Departure Time']);
    
    if (status.isPast) {
      return (
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#6c757d' }]} disabled>
          <Text style={styles.actionButtonText}>Flight Departed</Text>
        </TouchableOpacity>
      );
    }
    
    if (status.isBoarding) {
      return (
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FB8500' }]} disabled>
          <Text style={styles.actionButtonText}>{getMinutesRemaining(trip['Departure Time'])}</Text>
        </TouchableOpacity>
      );
    }
    
    if (status.isTerminalInfo) {
      return (
        <TouchableOpacity style={styles.actionButton} onPress={openMaps}>
          <Text style={styles.actionButtonText}>Navigate to {trip['Terminal'] || 'Terminal'}</Text>
        </TouchableOpacity>
      );
    }
    
    if (status.isCheckInOpen && !isCheckedIn) {
      return (
        <TouchableOpacity style={styles.actionButton} onPress={handleCheckIn}>
          <Text style={styles.actionButtonText}>Check In Now</Text>
        </TouchableOpacity>
      );
    }
    
    if (isCheckedIn) {
      return (
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#28a745' }]}>
          <Text style={styles.actionButtonText}>View Boarding Pass</Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#6c757d' }]} disabled>
        <Text style={styles.actionButtonText}>
          Check-In Opens {formatDate(new Date(new Date(trip['Departure Time']).getTime() - 24 * 60 * 60 * 1000))}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#023047" barStyle="light-content" />
      <ScrollView style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFB703" />
          <Text style={styles.backButtonText}>Back to Trips</Text>
        </TouchableOpacity>

        <Text style={styles.header}>{trip['Trip Name'] || 'Trip Details'}</Text>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Flight Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Flight Number:</Text>
            <Text style={styles.value}>{trip['Flight Number']}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Airline:</Text>
            <Text style={styles.value}>{trip['Airline'] || 'Not specified'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Route:</Text>
            <Text style={styles.value}>
              {trip['Departure destination'] || '?'} → {trip['Arrival destination'] || '?'}
            </Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Departure:</Text>
            <Text style={styles.value}>{formatDate(trip['Departure Time'])}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Arrival:</Text>
            <Text style={styles.value}>{formatDate(trip['Arrival Time'])}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{trip['Duration of flight'] || 'Not specified'}</Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>At the Airport</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Terminal:</Text>
            <Text style={styles.value}>{trip['Terminal'] || 'TBA'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Gate:</Text>
            <Text style={styles.value}>{trip['Gate Number'] || 'TBA'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Class:</Text>
            <Text style={styles.value}>{trip['Class'] || 'Not specified'}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtonContainer}>
          {renderActionButton()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#8ECAE6',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#8ECAE6',
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#023047',
  },
  backButton: {
    marginTop: 50,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFB703',
    fontWeight: '500',
    marginLeft: 5,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#023047',
  },
  card: {
    backgroundColor: '#219EBC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actionButtonContainer: {
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: '#FB8500',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TripDetails;