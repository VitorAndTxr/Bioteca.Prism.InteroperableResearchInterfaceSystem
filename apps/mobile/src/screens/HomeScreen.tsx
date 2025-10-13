import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to IRIS</Text>
      <Text style={styles.subtitle}>Interoperable Research Interface System</Text>

      <View style={styles.featuresContainer}>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate('StreamConfig')}
        >
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={styles.featureTitle}>sEMG Streaming</Text>
          <Text style={styles.featureDescription}>
            Connect to NeuroEstimulator device and visualize real-time biosignal data
          </Text>
        </TouchableOpacity>

        <View style={[styles.featureCard, styles.featureCardDisabled]}>
          <Text style={styles.featureIcon}>⚡</Text>
          <Text style={styles.featureTitle}>FES Sessions</Text>
          <Text style={styles.featureDescription}>
            Coming soon: Manage functional electrical stimulation sessions
          </Text>
        </View>

        <View style={[styles.featureCard, styles.featureCardDisabled]}>
          <Text style={styles.featureIcon}>📁</Text>
          <Text style={styles.featureTitle}>Data Management</Text>
          <Text style={styles.featureDescription}>
            Coming soon: Export and submit data to Research Nodes
          </Text>
        </View>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 400,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureCardDisabled: {
    opacity: 0.5,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
