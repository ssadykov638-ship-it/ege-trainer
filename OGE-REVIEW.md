# OGE review status

Publication requested by the user after the automated OCR cleanup. Full visual
source-text and independently transcribed answer-key review remains incomplete.

30 variants have been extracted from the supplied Social Studies 2026 PDF.
Each variant contains 15 tasks. Visible numbering is 1-15; original numbering
is retained in `sourceTask` for answer-table mapping:

`2, 3, 4, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19`.

The answer constants were transcribed from PDF pages 182-183. Structural and
grading tests do not constitute an independent verification of that transcription.

Remaining full-review requirements:

- Compare every question and option with the rendered source page.
- Remove OCR artifacts, retaining full scenario context and both judgments.
- Review matching columns independently, including all five rows.
- Check every answer against its original task number in the source key.
- Run OGE grading, UI and viewport checks plus existing EGE regressions.
- Bump resource versions and publish only after those checks pass.

Known issues include OCR garbage in single-choice stems, punctuation and word
corruption, and artifacts before comparison-task stems. The local preview is
for review, not a finished student-facing release.

Follow-up automated audit covered all 450 tasks. Boxed-number prefixes, known
watermark artifacts and the merged questions in variant 20 were repaired.
Missing scenario text in variants 9, 12, 14, 19, 21 and 29 was restored from
the source OCR. Corrections are reproducible in `tools/oge_text_corrections.json`.
These checks do not replace the full visual/source-key release requirements above.
