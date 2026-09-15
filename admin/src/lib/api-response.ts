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
    detail = "An unexpected error occurred",
    instance,
    code,
  }: {
    status?: number;
    detail?: string;
    instance?: string;
    code?: string;
  } = {},
  init?: ResponseInit,
) {
  return NextResponse.json(
    {
      success: false,
      status: false,
      error: {
        status,
        detail,
        instance,
        code,
      },
    },
    { status, ...init },
  );
}
