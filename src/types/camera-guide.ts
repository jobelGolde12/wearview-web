export type BodyKeypoint = {
  x: number;
  y: number;
  confidence: number;
};

export type BodyPose = {
  nose: BodyKeypoint;
  leftShoulder: BodyKeypoint;
  rightShoulder: BodyKeypoint;
  leftHip: BodyKeypoint;
  rightHip: BodyKeypoint;
  leftElbow: BodyKeypoint;
  rightElbow: BodyKeypoint;
  leftWrist: BodyKeypoint;
  rightWrist: BodyKeypoint;
};

export type AlignmentZone = 'head' | 'shoulders' | 'torso' | 'chest';

export type AlignmentStatus = 'perfect' | 'close' | 'misaligned';

export type GuidanceDirection =
  | 'move-left'
  | 'move-right'
  | 'step-closer'
  | 'step-back'
  | 'tilt-up'
  | 'tilt-down'
  | 'center-torso'
  | 'align-shoulders'
  | 'raise-camera'
  | 'lower-camera'
  | 'none';

export type AlignmentFeedback = {
  direction: GuidanceDirection;
  message: string;
  zone: AlignmentZone | null;
};

export type FitValidationResult = {
  isAligned: boolean;
  confidence: number;
  shoulderAlignment: AlignmentStatus;
  torsoAlignment: AlignmentStatus;
  headAlignment: AlignmentStatus;
  chestAlignment: AlignmentStatus;
  feedback: AlignmentFeedback;
};

export type PoseDetectionState = {
  pose: BodyPose | null;
  isDetecting: boolean;
  lastDetectionTime: number;
  confidence: number;
};

export type CameraGuideState = {
  isGuidedMode: boolean;
  isFitDetected: boolean;
  fitConfidence: number;
  currentFeedback: AlignmentFeedback;
  validationResult: FitValidationResult | null;
  poseState: PoseDetectionState;
  setGuidedMode: (enabled: boolean) => void;
  updatePose: (pose: BodyPose | null, confidence: number) => void;
  updateValidation: (result: FitValidationResult) => void;
  resetGuideState: () => void;
};

export type PhotoTransform = {
  translateX: number;
  translateY: number;
  scale: number;
  rotation: number;
};

export type PhotoAdjustmentState = {
  photoUri: string | null;
  isAdjusting: boolean;
  transform: PhotoTransform;
  setPhotoUri: (uri: string | null) => void;
  setAdjusting: (adjusting: boolean) => void;
  updateTransform: (transform: Partial<PhotoTransform>) => void;
  resetTransform: () => void;
};
