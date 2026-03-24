/**
 * 预订状态枚举
 */
export const ReservationStatus = {
  REQUESTED: 0,
  APPROVED: 1,
  CANCELLED: 2,
  COMPLETED: 3,
} as const;

export type ReservationStatusType =
  (typeof ReservationStatus)[keyof typeof ReservationStatus];

export const STATUS_MAP: Record<number, { label: string; color: string }> = {
  [ReservationStatus.REQUESTED]: {
    label: "Requested",
    color: "bg-yellow-100 text-yellow-800",
  },
  [ReservationStatus.APPROVED]: {
    label: "Approved",
    color: "bg-green-100 text-green-800",
  },
  [ReservationStatus.CANCELLED]: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
  },
  [ReservationStatus.COMPLETED]: {
    label: "Completed",
    color: "bg-blue-100 text-blue-800",
  },
};

export const getStatusOptions = (): string[] => {
  return [...Object.values(ReservationStatus).map(String)];
};
export const getStatusInfo = (
  status: number,
): { label: string; color: string } => {
  return (
    STATUS_MAP[status] || {
      label: "Unknown",
      color: "bg-gray-100 text-gray-800",
    }
  );
};
