import * as blazeface from "@tensorflow-models/blazeface";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";

export interface FaceLocation {
  topLeft: [number, number];
  bottomRight: [number, number];
}

export interface DeepfakeHeuristicResult {
  is_face_image: boolean;
  faces_detected?: number;
  face_locations?: FaceLocation[];
  synthetic_score?: number;
  laplacian_variance?: number;
  landmark_asymmetry?: number;
  mobilenet_top_prediction?: string;
  mobilenet_confidence?: number;
  verdict?: "LIKELY_AUTHENTIC" | "UNCERTAIN" | "LIKELY_SYNTHETIC";
  processing_time_ms: number;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export class TFJSEngine {
  mobileNetModel: mobilenet.MobileNet | null = null;
  blazefaceModel: blazeface.BlazeFaceModel | null = null;
  isLoaded = false;
  status = "Idle";

  async loadModels() {
    if (this.isLoaded) return;
    this.status = "Loading MobileNet V2...";
    window.dispatchEvent(new CustomEvent("tfjs-status", { detail: this.status }));
    this.mobileNetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
    this.status = "Loading BlazeFace...";
    window.dispatchEvent(new CustomEvent("tfjs-status", { detail: this.status }));
    this.blazefaceModel = await blazeface.load();
    this.isLoaded = true;
    this.status = "Models Ready";
    console.info("AEGIS TF.js models loaded");
    window.dispatchEvent(new CustomEvent("tfjs-loaded"));
    window.dispatchEvent(new CustomEvent("tfjs-status", { detail: this.status }));
  }

  async classifyImage(imageElement: HTMLImageElement | HTMLCanvasElement) {
    await this.loadModels();
    return this.mobileNetModel!.classify(imageElement, 5);
  }

  async detectFaces(imageElement: HTMLImageElement | HTMLCanvasElement) {
    await this.loadModels();
    const predictions = await this.blazefaceModel!.estimateFaces(imageElement, false);
    return {
      faces_detected: predictions.length,
      face_locations: predictions.map((face) => ({
        topLeft: face.topLeft as [number, number],
        bottomRight: face.bottomRight as [number, number],
      })),
      landmarks: predictions.map((face) => face.landmarks as [number, number][]),
    };
  }

  async analyzeForDeepfake(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<DeepfakeHeuristicResult> {
    const start = performance.now();
    const faces = await this.detectFaces(imageElement);
    if (faces.faces_detected === 0) {
      return { is_face_image: false, processing_time_ms: Math.round(performance.now() - start) };
    }
    const predictions = await this.classifyImage(imageElement);
    const top = predictions[0];
    const metrics = tf.tidy(() => {
      const imageTensor = tf.browser.fromPixels(imageElement).toFloat().div(255);
      const [height, width] = imageTensor.shape;
      const input = imageTensor.reshape([1, height, width, 3]);
      const kernelValues = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
      const kernel = tf.tensor4d(
        [...kernelValues, ...kernelValues, ...kernelValues],
        [3, 3, 3, 1],
      );
      const laplacian = tf.conv2d(input as tf.Tensor4D, kernel as tf.Tensor4D, 1, "same").abs();
      const { variance } = tf.moments(laplacian);
      return { laplacianVariance: variance.dataSync()[0] };
    });
    const landmarks = faces.landmarks[0] ?? [];
    let asymmetry = 0;
    if (landmarks.length >= 6) {
      const leftEye = landmarks[0];
      const rightEye = landmarks[1];
      const nose = landmarks[2];
      const leftDelta = Math.abs(nose[0] - leftEye[0]);
      const rightDelta = Math.abs(rightEye[0] - nose[0]);
      asymmetry = Math.abs(leftDelta - rightDelta) / Math.max(leftDelta, rightDelta, 1);
    }
    const edgeUniformityScore = 1 - clamp01(metrics.laplacianVariance * 9);
    const syntheticScore = clamp01(edgeUniformityScore * 0.7 + asymmetry * 0.3);
    const verdict =
      syntheticScore > 0.6 ? "LIKELY_SYNTHETIC" : syntheticScore >= 0.3 ? "UNCERTAIN" : "LIKELY_AUTHENTIC";
    return {
      is_face_image: true,
      faces_detected: faces.faces_detected,
      face_locations: faces.face_locations,
      synthetic_score: Number(syntheticScore.toFixed(4)),
      laplacian_variance: Number(metrics.laplacianVariance.toFixed(6)),
      landmark_asymmetry: Number(asymmetry.toFixed(4)),
      mobilenet_top_prediction: top.className,
      mobilenet_confidence: Number(top.probability.toFixed(4)),
      verdict,
      processing_time_ms: Math.round(performance.now() - start),
    };
  }

  async computeImageFeatures(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<Float32Array> {
    await this.loadModels();
    const embedding = this.mobileNetModel!.infer(imageElement as never, true) as unknown as tf.Tensor;
    const data = new Float32Array(await embedding.data());
    embedding.dispose();
    return data;
  }
}

export const tfEngine = new TFJSEngine();
