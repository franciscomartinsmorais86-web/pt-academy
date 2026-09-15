#!/usr/bin/env python3
"""Converte todas as imagens da pasta do script para .webp.

Uso:
    python to_webp.py                  # converte tudo na pasta do script
    python to_webp.py -d ./fotos -r    # outra pasta, incluindo subpastas
    python to_webp.py -q 90 --delete   # qualidade 90 e apaga o original
    python to_webp.py --lossless       # sem perdas (bom para PNG/logos)

Requer: pip install Pillow
"""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageSequence, UnidentifiedImageError
except ImportError:
    sys.exit("Falta a Pillow. Instala com: pip install Pillow")

# Extensões que a Pillow lê e que faz sentido converter.
EXTENSOES = {
    ".webp", ".jpeg", ".jpe", ".jfif", ".png", ".gif", ".bmp", ".dib",
    ".tif", ".tiff", ".ppm", ".pgm", ".pbm", ".pnm", ".tga", ".ico",
    ".icns", ".im", ".pcx", ".sgi", ".jp2", ".j2k", ".jpf", ".jpx",
    ".avif", ".heic", ".heif", ".webp",
}

ANIMADOS = {".gif", ".webp", ".png", ".apng"}


def destino(ficheiro: Path, sobrescrever: bool) -> Path:
    alvo = ficheiro.with_suffix(".webp")
    if not sobrescrever:
        contador = 1
        while alvo.exists() and alvo != ficheiro:
            alvo = ficheiro.with_name(f"{ficheiro.stem}-{contador}.webp")
            contador += 1
    return alvo


def preparar(frame: Image.Image) -> Image.Image:
    """Normaliza o modo de cor para algo que o WebP aceite."""
    if frame.mode in ("RGB", "RGBA"):
        return frame
    if frame.mode in ("P", "LA", "PA") or "transparency" in frame.info:
        return frame.convert("RGBA")
    return frame.convert("RGB")


def converter(ficheiro: Path, args) -> Path | None:
    with Image.open(ficheiro) as img:
        animado = (
            getattr(img, "n_frames", 1) > 1
            and ficheiro.suffix.lower() in ANIMADOS
            and not args.primeiro_frame
        )

        alvo = destino(ficheiro, args.sobrescrever)
        opcoes = {
            "quality": args.qualidade,
            "method": args.metodo,
            "lossless": args.lossless,
        }

        if animado:
            frames = [preparar(f.copy()) for f in ImageSequence.Iterator(img)]
            frames[0].save(
                alvo,
                "WEBP",
                save_all=True,
                append_images=frames[1:],
                duration=img.info.get("duration", 100),
                loop=img.info.get("loop", 0),
                **opcoes,
            )
        else:
            icc = img.info.get("icc_profile")
            exif = img.info.get("exif")
            base = preparar(img)
            if icc:
                opcoes["icc_profile"] = icc
            if exif:
                opcoes["exif"] = exif
            base.save(alvo, "WEBP", **opcoes)

    return alvo


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Converte imagens para .webp.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "-d", "--dir", default=None,
        help="pasta a processar (por omissão, a pasta do próprio script)",
    )
    parser.add_argument("-r", "--recursivo", action="store_true",
                        help="incluir subpastas")
    parser.add_argument("-q", "--qualidade", type=int, default=82,
                        help="qualidade 1-100 (ignorada em modo lossless)")
    parser.add_argument("-m", "--metodo", type=int, default=6,
                        choices=range(0, 7),
                        help="esforço de compressão: 0 rápido, 6 melhor")
    parser.add_argument("--lossless", action="store_true",
                        help="compressão sem perdas")
    parser.add_argument("--primeiro-frame", action="store_true",
                        help="em imagens animadas, guardar só o 1.º frame")
    parser.add_argument("--sobrescrever", action="store_true",
                        help="substituir .webp já existentes")
    parser.add_argument("--apagar", action="store_true",
                        help="apagar o ficheiro original após converter")
    parser.add_argument("--simular", action="store_true",
                        help="mostrar o que seria feito, sem escrever nada")
    args = parser.parse_args()

    pasta = Path(args.dir).expanduser() if args.dir else Path(__file__).resolve().parent
    if not pasta.is_dir():
        sys.exit(f"Pasta inválida: {pasta}")

    padrao = "**/*" if args.recursivo else "*"
    ficheiros = sorted(
        f for f in pasta.glob(padrao)
        if f.is_file()
        and f.suffix.lower() in EXTENSOES
        and f.resolve() != Path(__file__).resolve()
    )

    if not ficheiros:
        print(f"Nenhuma imagem encontrada em {pasta}")
        return

    convertidos = falhados = ignorados = 0
    poupado = 0

    for ficheiro in ficheiros:
        alvo = ficheiro.with_suffix(".webp")
        if ficheiro.suffix.lower() == ".webp" and not args.sobrescrever:
            ignorados += 1
            continue
        if alvo.exists() and alvo != ficheiro and not args.sobrescrever:
            print(f"  ignorado (já existe): {ficheiro.name}")
            ignorados += 1
            continue

        if args.simular:
            print(f"  {ficheiro.name} -> {destino(ficheiro, args.sobrescrever).name}")
            convertidos += 1
            continue

        try:
            origem_tam = ficheiro.stat().st_size
            saida = converter(ficheiro, args)
            novo_tam = saida.stat().st_size
            poupado += origem_tam - novo_tam
            delta = (novo_tam - origem_tam) / origem_tam * 100
            print(f"  {ficheiro.name} -> {saida.name} "
                  f"({origem_tam // 1024} KB -> {novo_tam // 1024} KB, {delta:+.0f}%)")
            convertidos += 1
            if args.apagar and saida.resolve() != ficheiro.resolve():
                ficheiro.unlink()
        except (UnidentifiedImageError, OSError, ValueError) as erro:
            print(f"  falhou: {ficheiro.name} ({erro})")
            falhados += 1

    print(f"\n{convertidos} convertidos, {ignorados} ignorados, {falhados} falhados.")
    if poupado and not args.simular:
        print(f"Espaço poupado: {poupado / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    main()
