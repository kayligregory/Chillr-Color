// app/(tabs)/chillr.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Sample data to use until CSV loading is fixed
const SAMPLE_FLIGHTS = [
  {
    "Flight Number": "AA101",
    "Confirmation Number": "ABC123",
    "Departure destination": "JFK",
    "Arrival destination": "LHR",
    "Departure Time": "2025-04-30T08:00:00Z", // Updated to be close to current date for testing
    "Arrival Time": "2025-04-30T20:00:00Z",
    "Date of travel": "2025-04-30",
    "Date of return": "2025-05-10",
    "Points Earned": "1500",
    "Duration of flight": "12h",
    "Gate Number": "B12",
    "Terminal": "Terminal 4",
    "Class": "Economy",
    "Airline": "American Airlines",
    "Trip Name": "London Business Trip",
    "Check In URL": "https://www.aa.com/reservation/view/find-your-trip",
    "Checked In": "no"
  },
  {
    "Flight Number": "BA202",
    "Confirmation Number": "XYZ789",
    "Departure destination": "LAX",
    "Arrival destination": "CDG",
    "Departure Time": "2025-05-11T12:30:00Z",
    "Arrival Time": "2025-05-11T22:00:00Z",
    "Date of travel": "2025-05-11",
    "Date of return": "2025-05-18",
    "Points Earned": "2000",
    "Duration of flight": "9.5h",
    "Gate Number": "C4",
    "Terminal": "Terminal B",
    "Class": "Business",
    "Airline": "British Airways",
    "Trip Name": "Paris Vacation",
    "Check In URL": "https://www.britishairways.com/travel/olcilandingpageauthreq/public/en_gb",
    "Checked In": "yes"
  },
  {
    "Flight Number": "DL303",
    "Confirmation Number": "LMN456",
    "Departure destination": "ATL",
    "Arrival destination": "SFO",
    "Departure Time": "2025-05-12T17:45:00Z",
    "Arrival Time": "2025-05-13T01:30:00Z",
    "Date of travel": "2025-05-12",
    "Date of return": "2025-05-22",
    "Points Earned": "1800",
    "Duration of flight": "7.75h",
    "Gate Number": "D9",
    "Terminal": "Terminal S",
    "Class": "Premium Economy",
    "Airline": "Delta",
    "Trip Name": "San Francisco Conference",
    "Check In URL": "https://www.delta.com/mytrips/",
    "Checked In": "no"
  }
];

const Chillr = () => {
  const [flights, setFlights] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigation = useNavigation();

  useEffect(() => {
    // Use the sample data instead of trying to load the CSV for now
    setFlights(SAMPLE_FLIGHTS);
    
    // Update current time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  const handleCheckIn = async (trip) => {
    try {
      // Open the check-in URL in a browser
      if (trip['Check In URL']) {
        await Linking.openURL(trip['Check In URL']);
        
        // Update the trip's checked-in status (in a real app, this would be saved to a database)
        const updatedFlights = flights.map(f => 
          f['Confirmation Number'] === trip['Confirmation Number'] 
            ? {...f, "Checked In": "yes"} 
            : f
        );
        setFlights(updatedFlights);
      }
    } catch (error) {
      console.error('Error opening check-in URL:', error);
    }
  };

  const openMaps = (terminal, airport) => {
    const destination = `${airport} ${terminal}`;
    
    if (Platform.OS === 'ios') {
      Linking.openURL(`maps://app?daddr=${encodeURIComponent(destination)}`);
    } else if (Platform.OS === 'android') {
      Linking.openURL(`google.navigation:q=${encodeURIComponent(destination)}`);
    } else {
      // Web fallback
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`);
    }
  };

  const renderStatusButton = (trip) => {
    const status = getTimeStatus(trip['Departure Time']);
    const isCheckedIn = trip['Checked In'] === 'yes';
    
    if (status.isPast) {
      return (
        <Text style={[styles.checkInStatus, { backgroundColor: '#666' }]}>
          Flight Departed
        </Text>
      );
    }
    
    if (status.isBoarding) {
      return (
        <Text style={[styles.checkInStatus, { backgroundColor: '#FB8500' }]}>
          {getMinutesRemaining(trip['Departure Time'])}
        </Text>
      );
    }
    
    if (status.isTerminalInfo) {
      return (
        <TouchableOpacity
          onPress={() => openMaps(trip['Terminal'], trip['Departure destination'])}
          style={{ alignSelf: 'flex-end' }}
        >
          <Text style={[styles.checkInStatus, { backgroundColor: '#219EBC' }]}>
            {trip['Terminal']} → Directions
          </Text>
        </TouchableOpacity>
      );
    }
    
    if (status.isCheckInOpen && !isCheckedIn) {
      return (
        <TouchableOpacity
          onPress={() => handleCheckIn(trip)}
          style={{ alignSelf: 'flex-end' }}
        >
          <Text style={styles.checkInStatus}>
            ⊙ Check-In Available
          </Text>
        </TouchableOpacity>
      );
    }
    
    if (isCheckedIn) {
      return (
        <Text style={[styles.checkInStatus, { backgroundColor: '#28a745' }]}>
          ✓ Checked In
        </Text>
      );
    }
    
    return (
      <Text style={[styles.checkInStatus, { backgroundColor: '#6c757d' }]}>
        Check-In Opens {formatDate(new Date(new Date(trip['Departure Time']).getTime() - 24 * 60 * 60 * 1000))}
      </Text>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#023047" barStyle="light-content" />
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Chillr</Text>
          <View style={styles.iconContainer}>
            <Ionicons name="airplane" size={24} color="#FFB703" />
          </View>
        </View>
        <Text style={styles.subheader}>My Trips</Text>
        
        {flights.length > 0 ? (
          flights.map((trip, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate('TripDetails', { trip })}
              style={styles.tripCard}
            >
              <Text style={styles.tripName}>
                {trip['Trip Name'] || `Trip #${index + 1}`}
              </Text>
              <Text style={styles.flightInfo}>
                Departs: {formatDate(trip['Departure Time'])}
              </Text>
              <View style={styles.routeContainer}>
                <Text style={styles.routeText}>
                  {trip['Departure destination']} → {trip['Arrival destination']}
                </Text>
              </View>
              <Text style={styles.flightInfo}>Flight: {trip['Flight Number']}</Text>
              <Text style={styles.flightInfo}>Gate: {trip['Gate Number'] || 'TBA'}</Text>
              <View style={styles.statusContainer}>
                {renderStatusButton(trip)}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noTripsContainer}>
            <Text style={styles.noTripsText}>Loading your trips...</Text>
          </View>
        )}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 10,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#023047',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#023047',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subheader: {
    fontSize: 22,
    marginBottom: 20,
    color: '#023047',
    fontWeight: '600',
  },
  tripCard: {
    backgroundColor: '#219EBC',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 6,
    borderLeftColor: '#FB8500',
  },
  tripName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  flightInfo: {
    color: 'white',
    fontSize: 16,
    marginBottom: 6,
  },
  routeContainer: {
    backgroundColor: '#023047',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  routeText: {
    color: '#FFB703',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 6,
    alignItems: 'flex-end',
  },
  checkInStatus: {
    color: '#FFB703',
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: '#023047',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  noTripsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#023047',
    borderRadius: 16,
  },
  noTripsText: {
    fontSize: 18,
    color: '#8ECAE6',
  },
});

export default Chillr;