import { NextResponse } from "next/server";

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      status: true,
      data,
    },
    { status },
  );
}

export function jsonError(
  {
    status = 500,
    title = "Internal Server Error",
    detail = "An unexpected error occurred",
    instance,
    code,
    fallbackData,
  }: {
    status?: number;
    title?: string;
    detail?: string;
    instance?: string;
    code?: string;
    fallbackData?: unknown;
  } = {},
  init?: ResponseInit,
) {
  return NextResponse.json(
    {
      success: false,
      status: false,
      title,
      detail,
      instance,
      code,
      data: fallbackData,
      error: {
        status,
        title,
        detail,
        instance,
        code,
      },
    },
    { status, ...init },
  );
}
