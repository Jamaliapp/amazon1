import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Container } from '@/components/ui';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'cat_1', name: 'Kuromi', image: 'https://www.wallpaperflare.com/sanrio-kuromi-wallpaper-ywlsv/download/1024x768' },
  { id: 'cat_2', name: 'Cinnamoroll', image: 'https://www.wallpaperflare.com/sanrio-cinnamoroll-wallpaper-yzske/download/1024x768' },
  { id: 'cat_3', name: 'Aesthetic', image: 'https://www.pxfuel.com/en/desktop-wallpaper-jjyxe/download/736x1307' },
  { id: 'cat_4', name: 'Sanrio Friends', image: 'https://www.wallpaperflare.com/anime-sanrio-kitty-kuromi-cinnamoroll-my-melody-pom-pom-purin-wallpaper-yydby/download/1680x1050' },
];

export default function CategoriesScreen() {
  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(tabs)?category=${item.name}`)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.overlay}>
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
    </Pressable>
  );

  return (
    <Container safeArea edges={['bottom']} style={styles.container}>
      <FlatList
        data={CATEGORIES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Browse Collections</Text>
            <Text style={styles.headerSubtitle}>Find the perfect mood for your device</Text>
          </View>
        )}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.primary,
    fontFamily: 'Manrope-Bold',
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    width: '100%',
    height: 120,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...typography.h2,
    color: colors.white,
    fontFamily: 'Manrope-Bold',
  },
});
