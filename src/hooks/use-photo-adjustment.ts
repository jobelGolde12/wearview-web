import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';

import { usePhotoAdjustmentStore } from '@/store/use-photo-adjustment-store';

const MIN_SCALE = 0.3;
const MAX_SCALE = 4;
const ROTATION_SENSITIVITY = 0.005;

export function usePhotoAdjustment() {
  const photoUri = usePhotoAdjustmentStore((state) => state.photoUri);
  const isAdjusting = usePhotoAdjustmentStore((state) => state.isAdjusting);
  const setPhotoUri = usePhotoAdjustmentStore((state) => state.setPhotoUri);
  const updateTransform = usePhotoAdjustmentStore((state) => state.updateTransform);
  const resetTransform = usePhotoAdjustmentStore((state) => state.resetTransform);

  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const [hasInteracted, setHasInteracted] = useState(false);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      translationX.value = 0;
      translationY.value = 0;
      scale.value = 1;
      rotation.value = 0;
      setHasInteracted(false);
    }
  }, [setPhotoUri, translationX, translationY, scale, rotation]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      if (!hasInteracted) {
        runOnJS(setHasInteracted)(true);
      }
    })
    .onUpdate((event) => {
      translationX.value = event.translationX;
      translationY.value = event.translationY;
    })
    .onEnd(() => {
      runOnJS(updateTransform)({
        translateX: translationX.value,
        translateY: translationY.value,
      });
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = Math.min(Math.max(scale.value * event.scale, MIN_SCALE), MAX_SCALE);
      scale.value = newScale;
    })
    .onEnd(() => {
      runOnJS(updateTransform)({ scale: scale.value });
    });

  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = rotation.value + event.rotation * ROTATION_SENSITIVITY;
    })
    .onEnd(() => {
      runOnJS(updateTransform)({ rotation: rotation.value });
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);

  const confirmAndSave = useCallback(() => {
    if (!photoUri) return;
    setPhotoUri(null);
    Alert.alert('Photo saved', 'Your fitted photo has been processed.');
  }, [photoUri, setPhotoUri]);

  const cancelAdjustment = useCallback(() => {
    setPhotoUri(null);
    resetTransform();
    setHasInteracted(false);
  }, [setPhotoUri, resetTransform]);

  const resetPhoto = useCallback(() => {
    translationX.value = 0;
    translationY.value = 0;
    scale.value = 1;
    rotation.value = 0;
    runOnJS(resetTransform)();
    runOnJS(setHasInteracted)(false);
  }, [translationX, translationY, scale, rotation, resetTransform]);

  return {
    photoUri,
    isAdjusting,
    hasInteracted,
    translationX,
    translationY,
    scale,
    rotation,
    composedGesture,
    pickImage,
    confirmAndSave,
    cancelAdjustment,
    resetPhoto,
  };
}
