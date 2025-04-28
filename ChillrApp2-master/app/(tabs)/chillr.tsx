// app/(tabs)/chillr.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Sample data to use until CSV loading is fixed
const SAMPLE_FLIGHTS = [
  {
    "Flight Number": "AA101",
    "Confirmation Number": "ABC123",
    "Departure destination": "JFK",
    "Arrival destination": "LHR",
    "Departure Time": "2025-04-10T08:00:00Z",
    "Arrival Time": "2025-04-10T20:00:00Z",
    "Date of travel": "2025-04-10",
    "Date of return": "2025-04-20",
    "Points Earned": "1500",
    "Duration of flight": "12h",
    "Gate Number": "B12",
    "Class": "Economy",
    "Airline": "American Airlines",
    "Trip Name": "London Business Trip"
  },
  {
    "Flight Number": "BA202",
    "Confirmation Number": "XYZ789",
    "Departure destination": "LAX",
    "Arrival destination": "CDG",
    "Departure Time": "2025-04-11T12:30:00Z",
    "Arrival Time": "2025-04-11T22:00:00Z",
    "Date of travel": "2025-04-11",
    "Date of return": "2025-04-18",
    "Points Earned": "2000",
    "Duration of flight": "9.5h",
    "Gate Number": "C4",
    "Class": "Business",
    "Airline": "British Airways",
    "Trip Name": "Paris Vacation"
  },
  {
    "Flight Number": "DL303",
    "Confirmation Number": "LMN456",
    "Departure destination": "ATL",
    "Arrival destination": "SFO",
    "Departure Time": "2025-04-12T17:45:00Z",
    "Arrival Time": "2025-04-13T01:30:00Z",
    "Date of travel": "2025-04-12",
    "Date of return": "2025-04-22",
    "Points Earned": "1800",
    "Duration of flight": "7.75h",
    "Gate Number": "D9",
    "Class": "Premium Economy",
    "Airline": "Delta",
    "Trip Name": "San Francisco Conference"
  }
];

const Chillr = () => {
  const [flights, setFlights] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Use the sample data instead of trying to load the CSV for now
    setFlights(SAMPLE_FLIGHTS);
    
    // Uncomment this when CSV loading is properly set up
    // fetchCSV();
  }, []);

  /* 
  // Keep this function for when you want to implement CSV loading
  const fetchCSV = async () => {
    try {
      // Use a direct import approach
      const response = require('../../assets/data/full-flight-data.csv');
      // Process the data...
    } catch (error) {
      console.error('CSV Load Error:', error);
      // Fallback to sample data
      setFlights(SAMPLE_FLIGHTS);
    }
  };
  */

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
                <Text style={styles.checkInStatus}>
                  {trip['Checked In'] === 'yes' ? '✓ Checked In' : '⊙ Check-In Available'}
                </Text>
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