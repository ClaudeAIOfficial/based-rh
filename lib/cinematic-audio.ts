import { CHEER_B64 } from "@/lib/audio/cheer";
import { SCREAM_B64_1 } from "@/lib/audio/scream-1";
import { SCREAM_B64_2 } from "@/lib/audio/scream-2";
import { SCREAM_B64_3 } from "@/lib/audio/scream-3";

export const CHEER_AUDIO = `data:audio/mpeg;base64,${CHEER_B64}`;
export const SCREAM_AUDIO = `data:audio/mpeg;base64,${SCREAM_B64_1}${SCREAM_B64_2}${SCREAM_B64_3}`;
