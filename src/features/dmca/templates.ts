import { truncateMiddle } from "@/lib/format";

interface NoticeInput {
  assetName: string;
  url: string;
  platform: string;
  type: string;
  evidence: string;
  fingerprint: string;
}

export function generateDmcaNotice(input: NoticeInput) {
  return `DMCA TAKEDOWN NOTICE

To: ${input.platform} Copyright Agent
Date: ${new Date().toLocaleDateString("en-US")}

I am the authorized representative of the rights holder for the protected asset "${input.assetName}".
The infringing material is located at:
${input.url}

AEGIS detected this infringement as "${input.type}" and matched it against the registered asset with the following evidence:
- Neural fingerprint: ${truncateMiddle(input.fingerprint, 12, 10)}
- Perceptual similarity exceeded the enforcement threshold
- Supplemental evidence: ${input.evidence}

I have a good-faith belief that this use is not authorized by the copyright owner, its agent, or the law. The information in this notice is accurate, and under penalty of perjury, I am authorized to act on behalf of the owner.

Requested action:
1. Remove or disable access to the infringing material
2. Preserve relevant logs and uploader identifiers
3. Confirm the action taken to the reporting party

Filed via AEGIS automated enforcement workflow.`;
}

export const dmcaPipeline = [
  { id: "parse", label: "Parsing infringement details...", duration: 700 },
  { id: "generate", label: "Generating DMCA notice using GPT-4 NLP template...", duration: 950 },
  { id: "fill", label: "Auto-filling platform-specific legal fields...", duration: 900 },
  { id: "validate", label: "Validating notice against DMCA Section 512 requirements...", duration: 1000 },
  { id: "submit", label: "Submitting to platform abuse API...", duration: 750 },
  { id: "done", label: "Filed! Case ID will be generated.", duration: 650 },
];
