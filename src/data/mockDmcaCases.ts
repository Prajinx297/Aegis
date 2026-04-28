import type { DmcaCase } from "@/lib/types";

export const mockDmcaCases: DmcaCase[] = [
  {
    id: "AEGIS-DMCA-4401",
    assetId: "asset-001",
    assetName: "UCL_Final_Opening_Cut.mp4",
    platform: "YouTube",
    infringingUrl: "https://youtube.com/watch?v=pirated-ucl-cut",
    filedDate: "2026-04-24T11:43:00Z",
    status: "Under Review",
    expectedResolution: "Within 6 hours",
    infringementType: "Unauthorized Distribution",
    timeline: [
      { label: "Detection confirmed", at: "11:39 UTC", note: "Gemini verified a near-exact frame match." },
      { label: "Notice generated", at: "11:41 UTC", note: "Platform-specific legal clauses applied." },
      { label: "Filed to YouTube", at: "11:43 UTC", note: "Awaiting platform review." },
    ],
    notice:
      "This notice concerns the unauthorized distribution of the protected audiovisual asset UCL_Final_Opening_Cut.mp4. AEGIS matched the uploaded media with 94.8% neural similarity and a 4-bit perceptual hash distance. The claimant requests immediate removal under DMCA Section 512.",
  },
  {
    id: "AEGIS-DMCA-4398",
    assetId: "asset-008",
    assetName: "PostMatch_Reel_16x9.mp4",
    platform: "X / Twitter",
    infringingUrl: "https://x.com/clipvault/status/8812091293",
    filedDate: "2026-04-23T16:12:00Z",
    status: "Content Removed",
    expectedResolution: "Resolved",
    infringementType: "Exact Copy",
    timeline: [
      { label: "Detection confirmed", at: "16:03 UTC", note: "Exact fingerprint collision detected." },
      { label: "Notice generated", at: "16:06 UTC", note: "Standard media takedown template used." },
      { label: "Content removed", at: "16:42 UTC", note: "Post disabled after rapid review." },
    ],
    notice:
      "The content identified at the supplied URL is an unauthorized copy of the registered highlight asset PostMatch_Reel_16x9.mp4 and infringes the rights holder's exclusive rights to reproduce and distribute the work.",
  },
  {
    id: "AEGIS-DMCA-4393",
    assetId: "asset-013",
    assetName: "Coach_Tactics_Board.png",
    platform: "Google",
    infringingUrl: "https://sites.google.com/view/tactics-drop/board",
    filedDate: "2026-04-23T08:11:00Z",
    status: "Escalated",
    expectedResolution: "Escalation in progress",
    infringementType: "Derivative Work",
    timeline: [
      { label: "Detection confirmed", at: "08:04 UTC", note: "Derivative styling retained strategic formations." },
      { label: "Initial notice filed", at: "08:11 UTC", note: "Automated rights claim submitted." },
      { label: "Escalated", at: "12:22 UTC", note: "Platform requested supplemental evidence." },
    ],
    notice:
      "The derivative visual published at the referenced Google-hosted page reproduces the distinctive composition, annotation structure, and encoded tactical intelligence of Coach_Tactics_Board.png without authorization.",
  },
  {
    id: "AEGIS-DMCA-4387",
    assetId: "asset-003",
    assetName: "LockerRoom_Audio_Master.wav",
    platform: "Custom",
    infringingUrl: "https://fanarchive.example/audio/locker-room-exclusive",
    filedDate: "2026-04-22T18:01:00Z",
    status: "Pending",
    expectedResolution: "Within 24 hours",
    infringementType: "Unauthorized Distribution",
    timeline: [
      { label: "Detection confirmed", at: "17:56 UTC", note: "Audio embedding overlap exceeded 0.91." },
      { label: "Notice generated", at: "17:59 UTC", note: "Custom abuse mailbox fallback selected." },
      { label: "Notice sent", at: "18:01 UTC", note: "Waiting on operator acknowledgement." },
    ],
    notice:
      "The audio file distributed through the listed domain reproduces the protected locker room recording and was identified using acoustic fingerprint similarity and waveform alignment checks.",
  },
  {
    id: "AEGIS-DMCA-4381",
    assetId: "asset-004",
    assetName: "Press_Conference_Transcript.pdf",
    platform: "YouTube",
    infringingUrl: "https://youtube.com/watch?v=press-transcript-readout",
    filedDate: "2026-04-21T13:34:00Z",
    status: "Content Removed",
    expectedResolution: "Resolved",
    infringementType: "Derivative Work",
    timeline: [
      { label: "Detection confirmed", at: "13:30 UTC", note: "Narrated transcript reuse found in derivative video." },
      { label: "Notice generated", at: "13:32 UTC", note: "Speech-to-text evidence attached." },
      { label: "Content removed", at: "15:02 UTC", note: "Platform compliance completed." },
    ],
    notice:
      "A derivative audio-visual adaptation of the protected transcript was published without permission, preserving the original structure and wording of the rights holder's work.",
  },
];
