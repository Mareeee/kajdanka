import os

from chord_recognition import (
    predvidi_akorde,
    prikupi_sve_podatke,
    ucitaj_kes,
    treniraj_i_sacuvaj,
)

MODEL_PATH = "test_model.pt"
KES_X = "D:/chord_kes/X_data.npy"
KES_Y = "D:/chord_kes/y_data.npy"

def osiguraj_model():
    if os.path.exists(MODEL_PATH):
        return

    if os.path.exists(KES_X) and os.path.exists(KES_Y):
        X, y = ucitaj_kes(KES_X, KES_Y)
    else:
        X, y = prikupi_sve_podatke(putanja_X=KES_X, putanja_y=KES_Y)

    treniraj_i_sacuvaj(X, y, MODEL_PATH)

def predvidi(putanja_audio: str) -> list[dict]:
    osiguraj_model()
    return predvidi_akorde(putanja_audio)