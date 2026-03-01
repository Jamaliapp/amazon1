import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blink } from '@/lib/blink';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Container, Button } from '@/components/ui';

const { width, height } = Dimensions.get('window');

export default function WallpaperDetailScreen() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
    });
    return unsubscribe;
  }, []);

  const { data: wallpaper, isLoading } = useQuery({
    queryKey: ['wallpaper', id],
    queryFn: async () => {
      return await blink.db.table('wallpapers').get(id as string);
    },
    enabled: !!id,
  });

  const { data: isFavorited } = useQuery({
    queryKey: ['isFavorited', id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      return await blink.db.table('favorites').exists({
        where: { userId: user.id, wallpaperId: id as string }
      });
    },
    enabled: !!id && !!user,
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to favorite wallpapers.');
        return;
      }
      if (isFavorited) {
        await blink.db.table('favorites').deleteMany({
          where: { userId: user.id, wallpaperId: id as string }
        });
      } else {
        await blink.db.table('favorites').create({
          id: `fav_${id}_${user.id}`,
          userId: user.id,
          wallpaperId: id as string,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['isFavorited', id] });
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const handleDownload = () => {
    if (Platform.OS === 'web') {
      window.open(wallpaper?.url, '_blank');
    } else {
      Alert.alert('Download started', 'The wallpaper is being saved to your gallery.');
    }
  };

  if (isLoading || !wallpaper) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Container safeArea edges={['top', 'bottom']} style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: wallpaper.url }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
        
        {/* Top Controls */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <BlurView intensity={20} tint="dark" style={styles.iconButton}>
              <Ionicons name="chevron-back" size={24} color={colors.white} />
            </BlurView>
          </Pressable>
          
          <Pressable 
            onPress={() => favoriteMutation.mutate()}
            disabled={favoriteMutation.isPending}
          >
            <BlurView intensity={20} tint="dark" style={styles.iconButton}>
              <Ionicons 
                name={isFavorited ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorited ? colors.primary : colors.white} 
              />
            </BlurView>
          </Pressable>
        </View>

        {/* Bottom Details Overlay */}
        <BlurView intensity={40} tint="dark" style={styles.detailsOverlay}>
          <View style={styles.detailsContent}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{wallpaper.title}</Text>
              <Text style={styles.subtitle}>{wallpaper.category} Collection</Text>
            </View>
            <Button 
              variant="primary" 
              onPress={handleDownload}
              leftIcon={<Ionicons name="download-outline" size={20} color={colors.white} />}
              style={styles.downloadButton}
            >
              Download
            </Button>
          </View>
        </BlurView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  detailsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: spacing.xxl + spacing.lg,
    overflow: 'hidden',
  },
  detailsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
  downloadButton: {
    paddingHorizontal: spacing.lg,
  },
});
