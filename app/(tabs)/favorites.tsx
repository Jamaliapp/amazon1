import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { blink } from '@/lib/blink';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Container, Button } from '@/components/ui';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

export default function FavoritesScreen() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setAuthLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  const { data: favorites, isLoading, refetch } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const favs = await blink.db.table('favorites').list({
        where: { userId: user.id },
      });
      if (favs.length === 0) return [];

      const wallpaperIds = favs.map((f: any) => f.wallpaperId);
      return await blink.db.table('wallpapers').list({
        where: { id: { in: wallpaperIds } }
      });
    },
    enabled: !!user,
  });

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/wallpaper/${item.id}`)}
    >
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
      </View>
    </Pressable>
  );

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <Container safeArea style={styles.centeredContainer}>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Sign in for Favorites</Text>
          <Text style={styles.authSubtitle}>Save your favorite butterfly wallpapers to access them anytime.</Text>
          <Button
            variant="primary"
            onPress={() => blink.auth.signInWithGoogle()}
            style={styles.authButton}
          >
            Sign in with Google
          </Button>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea edges={['bottom']} style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Favorites</Text>
            <Text style={styles.headerSubtitle}>Wallpapers you loved</Text>
          </View>
        )}
        ListEmptyComponent={() => !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>You haven't favorited any wallpapers yet</Text>
            <Button
              variant="outline"
              onPress={() => router.push('/(tabs)')}
              style={{ marginTop: spacing.md }}
            >
              Explore Wallpapers
            </Button>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
    width: COLUMN_WIDTH,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: COLUMN_WIDTH * 1.5,
    backgroundColor: colors.backgroundSecondary,
  },
  cardInfo: {
    padding: spacing.sm,
  },
  cardTitle: {
    ...typography.captionBold,
    color: colors.text,
  },
  emptyState: {
    marginTop: spacing.xxxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  authContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  authTitle: {
    ...typography.h1,
    color: colors.primary,
    textAlign: 'center',
  },
  authSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  authButton: {
    width: '100%',
    maxWidth: 300,
  },
});
