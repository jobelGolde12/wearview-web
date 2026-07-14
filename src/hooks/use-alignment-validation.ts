import { useCallback } from 'react';
import { Dimensions } from 'react-native';

import type {
  AlignmentFeedback,
  AlignmentStatus,
  BodyPose,
  FitValidationResult,
} from '@/types/camera-guide';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GUIDE_CONFIG = {
  headZone: {
    centerX: 0.5,
    centerY: 0.26,
    radiusX: 0.12,
    radiusY: 0.12,
  },
  shoulderZone: {
    centerX: 0.5,
    centerY: 0.38,
    width: 0.42,
    height: 0.12,
  },
  torsoZone: {
    centerX: 0.5,
    centerY: 0.58,
    width: 0.36,
    height: 0.3,
  },
  chestZone: {
    centerX: 0.5,
    centerY: 0.50,
    width: 0.3,
    height: 0.14,
  },
};

const CONFIDENCE_THRESHOLD = 0.65;

function normalizeCoord(value: number, dimension: number): number {
  return value / dimension;
}

function checkZoneAlignment(
  pointX: number,
  pointY: number,
  zone: { centerX: number; centerY: number; radiusX?: number; radiusY?: number; width?: number; height?: number },
): AlignmentStatus {
  const nx = normalizeCoord(pointX, SCREEN_WIDTH);
  const ny = normalizeCoord(pointY, SCREEN_HEIGHT);

  const dx = Math.abs(nx - zone.centerX);
  const dy = Math.abs(ny - zone.centerY);

  const toleranceX = zone.radiusX ?? (zone.width ?? 0) / 2;
  const toleranceY = zone.radiusY ?? (zone.height ?? 0) / 2;

  const maxDeviation = Math.max(dx / toleranceX, dy / toleranceY);

  if (maxDeviation <= 0.5) return 'perfect';
  if (maxDeviation <= 1.0) return 'close';
  return 'misaligned';
}

function determineGuidance(
  pose: BodyPose,
  shoulderStatus: AlignmentStatus,
  torsoStatus: AlignmentStatus,
  headStatus: AlignmentStatus,
  chestStatus: AlignmentStatus,
): AlignmentFeedback {
  const noseX = normalizeCoord(pose.nose.x, SCREEN_WIDTH);
  const noseY = normalizeCoord(pose.nose.y, SCREEN_HEIGHT);
  const shoulderMidX = (normalizeCoord(pose.leftShoulder.x, SCREEN_WIDTH) + normalizeCoord(pose.rightShoulder.x, SCREEN_WIDTH)) / 2;
  const shoulderMidY = (normalizeCoord(pose.leftShoulder.y, SCREEN_HEIGHT) + normalizeCoord(pose.rightShoulder.y, SCREEN_HEIGHT)) / 2;

  if (headStatus === 'misaligned') {
    if (noseY < GUIDE_CONFIG.headZone.centerY - GUIDE_CONFIG.headZone.radiusY) {
      return { direction: 'tilt-down', message: 'Lower camera slightly', zone: 'head' };
    }
    if (noseY > GUIDE_CONFIG.headZone.centerY + GUIDE_CONFIG.headZone.radiusY) {
      return { direction: 'tilt-up', message: 'Raise camera slightly', zone: 'head' };
    }
    if (noseX < GUIDE_CONFIG.headZone.centerX - GUIDE_CONFIG.headZone.radiusX) {
      return { direction: 'move-right', message: 'Move right', zone: 'head' };
    }
    return { direction: 'move-left', message: 'Move left', zone: 'head' };
  }

  if (shoulderStatus === 'misaligned') {
    if (shoulderMidX < GUIDE_CONFIG.shoulderZone.centerX - 0.05) {
      return { direction: 'move-right', message: 'Align shoulders', zone: 'shoulders' };
    }
    if (shoulderMidX > GUIDE_CONFIG.shoulderZone.centerX + 0.05) {
      return { direction: 'move-left', message: 'Align shoulders', zone: 'shoulders' };
    }
    if (shoulderMidY < GUIDE_CONFIG.shoulderZone.centerY - 0.05) {
      return { direction: 'step-closer', message: 'Move closer', zone: 'shoulders' };
    }
    return { direction: 'step-back', message: 'Step back', zone: 'shoulders' };
  }

  if (torsoStatus === 'misaligned') {
    const torsoCenterX = (normalizeCoord(pose.leftHip.x, SCREEN_WIDTH) + normalizeCoord(pose.rightHip.x, SCREEN_WIDTH)) / 2;
    if (torsoCenterX < GUIDE_CONFIG.torsoZone.centerX - 0.05) {
      return { direction: 'move-right', message: 'Center your torso', zone: 'torso' };
    }
    if (torsoCenterX > GUIDE_CONFIG.torsoZone.centerX + 0.05) {
      return { direction: 'move-left', message: 'Center your torso', zone: 'torso' };
    }
    return { direction: 'step-closer', message: 'Move closer', zone: 'torso' };
  }

  if (chestStatus === 'misaligned') {
    return { direction: 'align-shoulders', message: 'Align shoulders', zone: 'chest' };
  }

  return { direction: 'none', message: 'Perfect fit detected', zone: null };
}

export function useAlignmentValidation() {
  const validate = useCallback((pose: BodyPose | null, detectionConfidence: number): FitValidationResult | null => {
    if (!pose || detectionConfidence < CONFIDENCE_THRESHOLD) {
      return null;
    }

    const headStatus = checkZoneAlignment(pose.nose.x, pose.nose.y, GUIDE_CONFIG.headZone);
    const shoulderStatus = checkZoneAlignment(
      (pose.leftShoulder.x + pose.rightShoulder.x) / 2,
      (pose.leftShoulder.y + pose.rightShoulder.y) / 2,
      GUIDE_CONFIG.shoulderZone,
    );
    const torsoStatus = checkZoneAlignment(
      (pose.leftHip.x + pose.rightHip.x) / 2,
      (pose.leftHip.y + pose.rightHip.y) / 2,
      GUIDE_CONFIG.torsoZone,
    );
    const chestStatus = checkZoneAlignment(
      (pose.leftShoulder.x + pose.rightShoulder.x) / 2,
      (pose.leftShoulder.y + pose.rightShoulder.y) / 2 + SCREEN_HEIGHT * 0.08,
      GUIDE_CONFIG.chestZone,
    );

    const feedback = determineGuidance(pose, shoulderStatus, torsoStatus, headStatus, chestStatus);

    const allAligned =
      headStatus !== 'misaligned' &&
      shoulderStatus !== 'misaligned' &&
      torsoStatus !== 'misaligned' &&
      chestStatus !== 'misaligned';

    const confidence =
      (headStatus === 'perfect' ? 0.3 : headStatus === 'close' ? 0.15 : 0) +
      (shoulderStatus === 'perfect' ? 0.3 : shoulderStatus === 'close' ? 0.15 : 0) +
      (torsoStatus === 'perfect' ? 0.25 : torsoStatus === 'close' ? 0.12 : 0) +
      (chestStatus === 'perfect' ? 0.15 : chestStatus === 'close' ? 0.08 : 0);

    return {
      isAligned: allAligned && confidence >= 0.75,
      confidence,
      shoulderAlignment: shoulderStatus,
      torsoAlignment: torsoStatus,
      headAlignment: headStatus,
      chestAlignment: chestStatus,
      feedback,
    };
  }, []);

  return { validate };
}
