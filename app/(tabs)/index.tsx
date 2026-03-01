import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { blink } from '@/lib/blink';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Container } from '@/components/ui';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

export default function GalleryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { category } = useLocalSearchParams();

  const { data: wallpapers, isLoading, refetch } = useQuery({
    queryKey: ['wallpapers', category],
    queryFn: async () => {
      const options: any = {
        orderBy: { createdAt: 'desc' }
      };
      if (category) {
        options.where = { category };
      }
      return await blink.db.table('wallpapers').list(options);
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <Container safeArea edges={['bottom']} style={styles.container}>
      <FlatList
        data={wallpapers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>
                {category ? `${category} Collection` : 'Kuromi & Cinnamoroll'}
              </Text>
              {category && (
                <Pressable onPress={() => router.setParams({ category: '' })}>
                  <Text style={styles.clearFilter}>Clear</Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.headerSubtitle}>Adorable aesthetic wallpapers for you</Text>
          </View>
        )}
        ListEmptyComponent={() => !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No wallpapers found</Text>
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
  columnWrapper: {
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h1,
    color: colors.primary,
    fontFamily: 'Manrope-Bold',
    flex: 1,
  },
  clearFilter: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginLeft: spacing.md,
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
  categoryBadge: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  categoryText: {
    ...typography.tiny,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    marginTop: spacing.xxxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
