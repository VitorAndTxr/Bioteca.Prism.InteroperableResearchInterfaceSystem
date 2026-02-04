/**
 * Quick Start Example - US-027 Design System Components
 *
 * This file demonstrates basic usage of the new design system.
 * Use this as a reference when building screens.
 *
 * To test this screen, add it to your navigation:
 * import QuickStartExample from '@/components/ui/examples/QuickStartExample';
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, Input, Card, Select, EmptyState } from '@/components/ui';
import { theme } from '@/theme';

export const QuickStartExample = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rate, setRate] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Form submitted:', { name, email, rate });
    }, 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Design System Demo</Text>
        <Text style={styles.subtitle}>US-027 Components</Text>
      </View>

      {/* Button Examples */}
      <Card variant="default" padded style={styles.section}>
        <Text style={styles.sectionTitle}>Buttons</Text>

        <Button
          title="Primary Button"
          variant="primary"
          size="lg"
          onPress={() => console.log('Primary')}
          style={styles.buttonSpacing}
        />

        <Button
          title="Secondary Button"
          variant="secondary"
          size="md"
          onPress={() => console.log('Secondary')}
          style={styles.buttonSpacing}
        />

        <Button
          title="Outline Button"
          variant="outline"
          size="md"
          onPress={() => console.log('Outline')}
          style={styles.buttonSpacing}
        />

        <Button
          title="Loading State"
          variant="primary"
          loading={loading}
          onPress={handleSubmit}
          style={styles.buttonSpacing}
        />
      </Card>

      {/* Input Examples */}
      <Card variant="default" padded style={styles.section}>
        <Text style={styles.sectionTitle}>Inputs</Text>

        <Input
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          style={styles.inputSpacing}
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          style={styles.inputSpacing}
        />

        <Input
          label="Notes (Multiline)"
          multiline
          placeholder="Enter notes here..."
          style={styles.inputSpacing}
        />
      </Card>

      {/* Select Example */}
      <Card variant="default" padded style={styles.section}>
        <Text style={styles.sectionTitle}>Select</Text>

        <Select
          label="Sampling Rate"
          value={rate}
          options={[
            { label: '10 Hz', value: 10 },
            { label: '30 Hz (Recommended)', value: 30 },
            { label: '50 Hz', value: 50 },
            { label: '100 Hz', value: 100 },
          ]}
          onValueChange={setRate}
        />
      </Card>

      {/* Card Variants */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Variants</Text>

        <Card variant="default" padded style={styles.cardSpacing}>
          <Text style={styles.cardText}>Default Card (Elevated)</Text>
        </Card>

        <Card variant="outlined" padded style={styles.cardSpacing}>
          <Text style={styles.cardText}>Outlined Card</Text>
        </Card>
      </View>

      {/* Empty State Example */}
      <Card variant="outlined" padded={false} style={styles.section}>
        <EmptyState
          title="No Data Available"
          message="This is how empty states look in the app"
          action={{
            label: 'Refresh',
            onPress: () => console.log('Refresh'),
          }}
        />
      </Card>

      {/* Typography Examples */}
      <Card variant="default" padded style={styles.section}>
        <Text style={styles.sectionTitle}>Typography</Text>
        <Text style={styles.typoTitle1}>Title 1 (36px)</Text>
        <Text style={styles.typoTitle2}>Title 2 (30px)</Text>
        <Text style={styles.typoTitle3}>Title 3 (24px)</Text>
        <Text style={styles.typoBody}>Body Text (16px)</Text>
        <Text style={styles.typoSmall}>Small Text (14px)</Text>
      </Card>

      {/* Color Palette */}
      <Card variant="default" padded style={styles.section}>
        <Text style={styles.sectionTitle}>Colors</Text>
        <View style={styles.colorGrid}>
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.secondary }]} />
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.success }]} />
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.warning }]} />
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.error }]} />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  title: {
    ...theme.typography.title2,
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.xs,
  },

  subtitle: {
    ...theme.typography.bodyBase,
    color: theme.colors.textMuted,
  },

  section: {
    margin: theme.spacing.lg,
  },

  sectionTitle: {
    ...theme.typography.title3,
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.md,
  },

  buttonSpacing: {
    marginBottom: theme.spacing.md,
  },

  inputSpacing: {
    marginBottom: theme.spacing.lg,
  },

  cardSpacing: {
    marginBottom: theme.spacing.md,
  },

  cardText: {
    ...theme.typography.bodyBase,
    color: theme.colors.textBody,
  },

  typoTitle1: {
    ...theme.typography.title1,
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.sm,
  },

  typoTitle2: {
    ...theme.typography.title2,
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.sm,
  },

  typoTitle3: {
    ...theme.typography.title3,
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.sm,
  },

  typoBody: {
    ...theme.typography.bodyBase,
    color: theme.colors.textBody,
    marginBottom: theme.spacing.sm,
  },

  typoSmall: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },

  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    ...theme.shadow.base,
  },
});

export default QuickStartExample;
