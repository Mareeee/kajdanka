import os

from chord_recognition import (
    predict_chords,
    collect_all_data,
    load_cache,
    train_and_save,
)

SELECTED_MODEL = "CNN"
MODEL_PATH = "models/CNN_model.pt"
CACHE_X_TRAIN, CACHE_Y_TRAIN = r"D:\chord_kes\X_train.npy", r"D:\chord_kes\y_train.npy"
CACHE_X_VAL, CACHE_Y_VAL = r"D:\chord_kes\X_val.npy", r"D:\chord_kes\y_val.npy"


def initialize():
    if os.path.exists(MODEL_PATH):
        return
    
    if (os.path.exists(CACHE_X_TRAIN) and os.path.exists(CACHE_Y_TRAIN) and
        os.path.exists(CACHE_X_VAL) and os.path.exists(CACHE_Y_VAL)):
        X_tr, y_tr, X_va, y_va = load_cache(CACHE_X_TRAIN, CACHE_Y_TRAIN, CACHE_X_VAL, CACHE_Y_VAL)
    else:
        X_tr, y_tr, X_va, y_va = collect_all_data(
                path_X_train=CACHE_X_TRAIN, path_y_train=CACHE_Y_TRAIN,
                path_X_val=CACHE_X_VAL, path_y_val=CACHE_Y_VAL
            )

    train_and_save(X_tr, y_tr, X_va, y_va, MODEL_PATH, SELECTED_MODEL)


def predict(audio_path: str) -> list[dict]:
    initialize()
    return predict_chords(audio_path, MODEL_PATH, SELECTED_MODEL)