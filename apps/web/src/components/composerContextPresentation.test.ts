import { ThreadId } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import { buildMessageContext, threadReferenceContextRecord } from "~/lib/composerContextRecords";
import { toKindScopedComposerContextId } from "~/lib/composerContextReferences";
import {
  composerContextRecordsFromDraft,
  uploadedContextRecordFromDraft,
} from "./composerContextPresentation";

describe("composerContextRecordsFromDraft", () => {
  it("keeps a thread-reference chip backed by its persisted record", () => {
    const reference = threadReferenceContextRecord({
      contextId: toKindScopedComposerContextId("thread-reference", "local_thread-1"),
      label: "Authentication refactor",
      threadId: "thread-1",
      projectTitle: "T3 Code",
      providerName: "codex",
      model: "gpt-5.6-sol",
      summary: "Refresh-token rotation is pending verification.",
      changedFiles: [],
      checkpointRef: null,
    });
    const record = composerContextRecordsFromDraft({
      terminalContexts: [],
      threadReferences: [reference],
    }).get(reference.contextId);

    expect(record).toEqual({ kind: "thread-reference", record: reference });
  });

  it("recovers the uploaded record when clipboard data points at an attachment already in the draft", () => {
    const file = {
      type: "file" as const,
      id: "file-1",
      name: "file.txt",
      mimeType: "text/plain",
      sizeBytes: 4,
      file: new File(["test"], "file.txt"),
      uploadedAttachmentId: "attachment-1",
    };
    const draftRecord = composerContextRecordsFromDraft({
      terminalContexts: [],
      files: [file],
    }).get("file_file-1");

    expect(draftRecord && uploadedContextRecordFromDraft(draftRecord)).toMatchObject({
      kind: "file",
      contextId: "file_file-1",
      attachmentId: "attachment-1",
    });
  });

  it("resolves each wire reference to its own backing draft even when producer ids collide", () => {
    const id = "same.id:1";
    const terminal = {
      id,
      threadId: ThreadId.make("t1"),
      terminalId: "default",
      terminalLabel: "Terminal",
      lineStart: 1,
      lineEnd: 1,
      text: "output",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    const image = {
      type: "image" as const,
      id,
      name: "shot.png",
      mimeType: "image/png",
      sizeBytes: 1,
      file: new File(["x"], "shot.png"),
      previewUrl: "blob:shot",
    };
    const file = {
      type: "file" as const,
      id,
      name: "file.txt",
      mimeType: "text/plain",
      sizeBytes: 1,
      file: null,
    };
    const draftRecords = composerContextRecordsFromDraft({
      terminalContexts: [terminal],
      images: [image],
      files: [file],
    });
    const message = buildMessageContext({
      terminalContexts: [terminal],
      reviewComments: [],
      previewAnnotations: [],
      attachments: [
        { attachment: image, attachmentId: "uploaded-image" },
        { attachment: file, attachmentId: "uploaded-file" },
      ],
    })!;
    expect(draftRecords.size).toBe(3);
    for (const record of message.records) {
      expect(draftRecords.get(record.contextId)?.kind).toBe(record.kind);
    }
  });
});
