"""Transcribe los WAV del pipeline con faster-whisper sin servicios de pago.

Los resultados se guardan en scripts/pipeline/out/transcripciones-locales,
una ruta ignorada por Git. Cada JSON conserva marcas de tiempo y métricas
de confianza para revisión editorial posterior.
"""

from __future__ import annotations

import argparse
import json
import time
import wave
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel


def cargar_wav_mono_16k(ruta: Path) -> np.ndarray:
    with wave.open(str(ruta), "rb") as audio:
        if audio.getnchannels() != 1 or audio.getframerate() != 16_000:
            raise ValueError(f"{ruta.name}: se esperaba WAV mono a 16 kHz")
        if audio.getsampwidth() != 2:
            raise ValueError(f"{ruta.name}: se esperaba PCM de 16 bits")
        muestras = np.frombuffer(audio.readframes(audio.getnframes()), dtype=np.int16)
    return muestras.astype(np.float32) / 32768.0


def transcribir(modelo: WhisperModel, entrada: Path, salida: Path, beam_size: int) -> None:
    inicio = time.time()
    muestras = cargar_wav_mono_16k(entrada)
    segmentos_iter, info = modelo.transcribe(
        muestras,
        language="es",
        beam_size=beam_size,
        vad_filter=True,
        condition_on_previous_text=True,
    )
    segmentos = []
    for indice, segmento in enumerate(segmentos_iter, start=1):
        texto = segmento.text.strip()
        if not texto:
            continue
        segmentos.append(
            {
                "inicio": round(float(segmento.start), 2),
                "fin": round(float(segmento.end), 2),
                "texto": texto,
                "probabilidadPromedio": round(float(segmento.avg_logprob), 4),
                "probabilidadSilencio": round(float(segmento.no_speech_prob), 4),
            }
        )
        if indice % 40 == 0:
            print(f"  {entrada.stem}: {segmento.end / 60:.1f} min procesados", flush=True)

    salida.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "fuente": entrada.name,
        "idioma": info.language,
        "probabilidadIdioma": round(float(info.language_probability), 4),
        "duracionSeg": round(len(muestras) / 16_000, 2),
        "modelo": "faster-whisper-small",
        "estadoRevision": "borrador_automatico",
        "segmentos": segmentos,
    }
    salida.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"  listo {entrada.name}: {len(segmentos)} segmentos en "
        f"{(time.time() - inicio) / 60:.1f} min -> {salida.name}",
        flush=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("entradas", nargs="+", type=Path)
    parser.add_argument("--salida", required=True, type=Path)
    parser.add_argument("--modelos", required=True, type=Path)
    parser.add_argument("--beam-size", type=int, default=1)
    args = parser.parse_args()

    print("Cargando faster-whisper-small (CPU int8)...", flush=True)
    modelo = WhisperModel(
        "small",
        device="cpu",
        compute_type="int8",
        download_root=str(args.modelos),
    )
    for entrada in args.entradas:
        if not entrada.exists():
            raise FileNotFoundError(entrada)
        salida = args.salida / f"{entrada.stem}.json"
        transcribir(modelo, entrada, salida, args.beam_size)


if __name__ == "__main__":
    main()
