"""
AEGIS v2 intentionally runs browser ML through TensorFlow.js hosted models:
MobileNet V2 and BlazeFace. This placeholder records the offline export slot
for future custom detector exports without faking a trained deepfake model.
"""

if __name__ == "__main__":
    print("AEGIS v2 uses real TensorFlow.js hosted models; no offline export required.")
