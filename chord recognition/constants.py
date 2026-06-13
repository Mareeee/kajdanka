import re

HOP_LENGTH = 512
TARGET_SR = 44100
EPOCHS = 100
BATCH_SIZE = 1024
LEARNING_RATE = 0.001
CONTEXT_BEFORE = 32
CONTEXT_AFTER = 8
CONTEXT_TOTAL = CONTEXT_BEFORE + 1 + CONTEXT_AFTER
N_FEATURES = 12 * CONTEXT_TOTAL

PITCHES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
QUALITIES = ["maj", "min"]
IDX_TO_LABEL = [p + ("" if q == "maj" else "m") for q in QUALITIES for p in PITCHES] + ["N"]
LABEL_TO_IDX = {lab: i for i, lab in enumerate(IDX_TO_LABEL)}
N_CLASSES = len(IDX_TO_LABEL)

ENHARMONIC = {
    "B#": "C",  "Cb": "B",
    "E#": "F",  "Fb": "E",
    "Db": "C#", "D#": "Eb",
    "Gb": "F#", "G#": "Ab",
    "A#": "Bb",
}
ROOT_RE = re.compile(r"^([A-Ga-g])([#b]?)(.*)$")