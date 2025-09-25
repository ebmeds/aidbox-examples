import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from "@/lib/constants";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
const { Logging } = require('@google-cloud/logging');
const logging = new Logging();
const log = logging.log('aidbox-smart-app');
const metadata = { resource: { type: 'cloud_run_revision' } };

export async function decidePageSize(pageSize: string | undefined) {
  if (pageSize) {
    const number = Number(pageSize);
    if (PAGE_SIZES.includes(number)) {
      return number;
    }
  }

  const saved = await getCookie("pageSize", { cookies });
  if (saved) {
    const number = Number(saved);
    if (PAGE_SIZES.includes(number)) {
      return number;
    }
  }

  return DEFAULT_PAGE_SIZE;
}

export async function logError(err: unknown, service = "default-service") {
  let errorMessage: string;
  let errorStack: string | undefined;

  if (err instanceof Error) {
    errorMessage = err.message;
    errorStack = err.stack;
  } else if (typeof err === 'string') {
    errorMessage = err;
  } else {
    try {
      errorMessage = JSON.stringify(err);
    } catch {
      errorMessage = String(err);
    }
  }

  const entry = log.entry(metadata, {
    severity: 'ERROR',
    message: errorMessage,
    stack: errorStack,
    service,
  });

  await log.write(entry);
  console.log('Logged error to Cloud Logging');
}