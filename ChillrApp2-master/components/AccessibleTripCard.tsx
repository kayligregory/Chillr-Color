// components/AccessibleTripCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AccessibilityInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AccessibleTripCard = ({ trip, onPress, onCheckIn, currentTime }) => {
  const [expanded, setExpanded] = useState(false);
  
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

  const renderStatusButton = () => {
    const status = getTimeStatus(trip['Departure Time']);
    const isCheckedIn = trip['Checked In'] === 'yes';
    
    if (status.isPast) {
      return (
        <View 
          style={[styles.statusBadge, { backgroundColor: '#555555' }]}
          accessible={true}
          accessibilityLabel="Flight departed"
          accessibilityRole="text"
        >
          <Text style={styles.statusText}>Flight Departed</Text>
        </View>
      );
    }
    
    if (status.isBoarding) {
      const boardingTime = getMinutesRemaining(trip['Departure Time']);
      return (
        <View 
          style={[styles.statusBadge, { backgroundColor: '#E86200' }]}
          accessible={true}
          accessibilityLabel={`Boarding soon. ${boardingTime}`}
          accessibilityRole="text"
        >
          <Text style={styles.statusText}>{boardingTime}</Text>
        </View>
      );
    }
    
    if (status.isTerminalInfo) {
      return (
        <TouchableOpacity
          onPress={() => onGetDirections(trip)}
          style={[styles.statusBadge, { backgroundColor: '#0A77C7' }]}
          accessible={true}
          accessibilityLabel={`Get directions to ${trip['Terminal'] || 'terminal'}`}
          accessibilityRole="button"
          accessibilityHint="Opens maps application with directions to your terminal"
        >
          <Ionicons name="navigate" size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.statusText}>{trip['Terminal']} → Directions</Text>
        </TouchableOpacity>
      );
    }
    
    if (status.isCheckInOpen && !isCheckedIn) {
      return (
        <TouchableOpacity
          onPress={() => onCheckIn(trip)}
          style={[styles.statusBadge, { backgroundColor: '#023E73' }]}
          accessible={true}
          accessibilityLabel="Check in now for your flight"
          accessibilityRole="button"
          accessibilityHint="Opens airline website to complete check-in"
        >
          <Ionicons name="checkbox-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.statusText}>Check-In Available</Text>
        </TouchableOpacity>
      );
    }
    
    if (isCheckedIn) {
      return (
        <View 
          style={[styles.statusBadge, { backgroundColor: '#35A167' }]}
          accessible={true}
          accessibilityLabel="You are checked in for this flight"
          accessibilityRole="text"
        >
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.statusText}>Checked In</Text>
        </View>
      );
    }
    
    return (
      <View 
        style={[styles.statusBadge, { backgroundColor: '#6c757d' }]}
        accessible={true}
        accessibilityLabel={`Check in opens ${formatDate(new Date(new Date(trip['Departure Time']).getTime() - 24 * 60 * 60 * 1000))}`}
        accessibilityRole="text"
      >
        <Text style={styles.statusText}>
          Check-In Opens {formatDate(new Date(new Date(trip['Departure Time']).getTime() - 24 * 60 * 60 * 1000))}
        </Text>
      </View>
    );
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
  
  const onGetDirections = (trip) => {
    // Implementation for directions
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
    // Announce the change to screen readers
    const message = expanded ? "Details collapsed" : "Details expanded";
    AccessibilityInfo.announceForAccessibility(message);
  };

  return (
    <View style={styles.container}>
      {/* Main card that's always visible */}
      <TouchableOpacity 
        style={styles.mainCard}
        onPress={onPress}
        accessible={true}
        accessibilityLabel={`Trip to ${trip['Arrival destination']} on ${formatDate(trip['Departure Time'])}`}
        accessibilityRole="button"
        accessibilityHint="View trip details"
      >
        <View style={styles.headerRow}>
          <Text style={styles.tripName} numberOfLines={1}>
            {trip['Trip Name'] || `Trip to ${trip['Arrival destination']}`}
          </Text>
          
          <TouchableOpacity 
            onPress={toggleExpanded}
            style={styles.expandButton}
            accessible={true}
            accessibilityLabel={expanded ? "Collapse details" : "Expand details"}
            accessibilityRole="button"
          >
            <Ionicons 
              name={expanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#023E73" 
            />
          </TouchableOpacity>
        </View>
      
        <View style={styles.routeContainer}>
          <Text style={styles.routeText}>
            {trip['Departure destination']} → {trip['Arrival destination']}
          </Text>
        </View>
        
        <Text style={styles.departureTime}>
          Departs: {formatDate(trip['Departure Time'])}
        </Text>

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          {renderStatusButton()}
        </View>
      </TouchableOpacity>
      
      {/* Expandable details section */}
      {expanded && (
        <View style={styles.expandedDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Flight:</Text>
            <Text style={styles.detailValue}>{trip['Flight Number']}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gate:</Text>
            <Text style={styles.detailValue}>{trip['Gate Number'] || 'TBA'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Terminal:</Text>
            <Text style={styles.detailValue}>{trip['Terminal'] || 'TBA'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Airline:</Text>
            <Text style={styles.detailValue}>{trip['Airline']}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  mainCard: {
    backgroundColor: '#0A77C7',
    padding: 16,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  expandButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeContainer: {
    backgroundColor: '#023E73',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  routeText: {
    color: '#FFB703',
    fontSize: 18,
    fontWeight: '600',
  },
  departureTime: {
    color: '#FFFFFF',
    fontSize: 16,
    marginVertical: 8,
  },
  statusContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#023E73',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minHeight: 48,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 6,
  },
  expandedDetails: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    color: '#023E73',
    fontSize: 16,
    fontWeight: '500',
  },
  detailValue: {
    color: '#111111',
    fontSize: 16,
  },
});

export default AccessibleTripCard;