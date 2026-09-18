# OGE History processing

## Published scope

Variants 1-13 are adapted and verified. Variants 14-30 are NOT adapted yet.
Variant 2: all 17 source tasks and keys checked against pages 11-16 and 240;
shared map retains its legend, table is native HTML, and 51 viewport renders pass.
Variant 3: all 17 source tasks and keys checked against pages 19-24 and 241;
shared map retains its legend, table is native HTML, and 51 viewport renders pass.
Variant 4: all 17 source tasks and keys checked against pages 27-32 and 241;
shared map retains its legend, table is native HTML, and 51 viewport renders pass.
Variant 5: all 17 source tasks and keys checked against pages 35-40 and 241;
shared map retains its legend, table is native HTML, and 51 viewport renders pass.
Variant 6: all 17 source tasks and keys checked against pages 43-48 and 241;
shared map retains its legend, table is native HTML, and 51 viewport renders pass.
Variant 7: all 17 source tasks and keys checked against pages 51-56 and 242;
shared map retains its legend, table is native HTML, and 51 viewport renders pass.
Variant 8: all 17 source tasks and keys checked against pages 59-64 and 242;
shared map retains its legend, table is native HTML, and 51 viewport renders pass.
Variant 9: all 17 source tasks and keys checked against pages 67-72 and 242;
shared map retains its legend, table is native HTML, and 51 viewport renders pass.
Variant 10: all 17 source tasks and keys checked against pages 75-80 and 242;
shared map retains its legend, table is native HTML, and 51 viewport renders pass.
Variant 11: all 17 source tasks and keys checked against pages 83-87 and 243;
shared map retains its legend, table is native HTML, and 51 viewport renders pass.
Variant 12: all 17 source tasks and keys checked against pages 90-94 and 243;
shared map retains its legend, table is native HTML, and 51 viewport renders pass.
Variant 13: all 17 source tasks and keys checked against pages 97-102 and 243;
shared map retains its legend, table is native HTML, and 51 viewport renders pass.
The user approved the sample, requested the remaining variants and authorized
GitHub publication. Publication of the verified sample is incremental work,
not fulfillment of the remaining-variants request.

## Reference format

- Retain source tasks 1-17. Skip written-response tasks 18-24.
- Render prose across the entire task width, including numeric-option grids.
- Numeric sequences use a text input with `inputmode="numeric"`, not an app keypad.
- Retain the whole shared map and its legend in tasks 8, 9 and 10.
- Repeat cultural materials in tasks 13-14 and the event list in tasks 15-17.
- Statistical tables use native HTML with all source values and units.
- Store `sourceTask` and `sourceVariant` explicitly; never map by shifted indices.
- Allow alternate pair orders for task 6 when specified in the answer table.
- Multi-answer tasks ignore selection order; chronology sequences do not.
- Current scoring is completed/correct task counts, not official partial exam points.

## Preparation completed

PDF pages 2-247 are rendered and OCR text plus spatial word boxes are available
locally under ignored `review/history`. `tools/history-source-manifest.json`
records variant boundaries and key-page references. OCR is not release-ready.

## Remaining work

Adapt variants 2-30 to the sample format, verify source text and figures, transcribe
and independently check their keys, then run grading and viewport tests before
publishing each verified batch. Do not append raw OCR or placeholder tasks to the
student-facing data. Preserve the verified variant 1 and existing EGE/OGE data.
