#!/bin/bash

INPUT=""
while IFS= read -r; do
    INPUT="${INPUT}
${REPLY}"
done

WAVFILE=$(echo "$INPUT" | /cygdrive/c/Windows/system32/cscript /nologo bin/text2wave.vbs)
WAVFILE=$(echo "$WAVFILE" | perl -pe's@\r|\n@@g')
WAVFILE=$(cygpath -au "$WAVFILE")

cat "$WAVFILE"
rm -f "$WAVFILE"
