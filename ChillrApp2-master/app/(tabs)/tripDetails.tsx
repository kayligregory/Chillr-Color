// app/(tabs)/tripDetails.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const TripDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { trip } = route.params || {};

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
            <Text style={styles.label}>Gate:</Text>
            <Text style={styles.value}>{trip['Gate Number'] || 'TBA'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Class:</Text>
            <Text style={styles.value}>{trip['Class'] || 'Not specified'}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>
              {trip['Checked In'] === 'yes' ? 'View Boarding Pass' : 'Check In'}
            </Text>
          </TouchableOpacity>
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