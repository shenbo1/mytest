import { createSignal, Show, onMount } from "solid-js";
import type { ColumnDef } from "@tanstack/solid-table";
import { DataTable } from "~/components/ui/datatable";
import {
  getReservations,
  approveReservationApi,
  cancelReservationApi,
  completeReservationApi,
  updateReservationApi,
  getRestaurants,
  type Reservation,
  type Restaurant,
  getReservationApi,
} from "~/services/reservationService";
import { AsyncButton, Button } from "~/components/ui/button";
import { showToast } from "~/components/ui/toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { FormField } from "~/components/ui/text-field";
import { CardItem } from "~/components/ui/card-item";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import dayjs from "dayjs";
import {
  STATUS_MAP,
  getStatusOptions,
  getStatusInfo,
} from "~/constants/reservation";

export default function AdminListPage() {
  const [page, setPage] = createSignal(1);
  const [pageSize] = createSignal(5);
  const [result, setResult] = createSignal<any>(null);
  const [loading, setLoading] = createSignal(true);

  const [showCancelDialog, setShowCancelDialog] = createSignal(false);
  const [cancelReason, setCancelReason] = createSignal("");
  const [cancelId, setCancelId] = createSignal("");

  const [showViewDialog, setShowViewDialog] = createSignal(false);
  const [showEditDialog, setShowEditDialog] = createSignal(false);
  const [viewReservation, setViewReservation] =
    createSignal<Reservation | null>(null);
  const [editingReservation, setEditingReservation] = createSignal<
    Partial<Reservation>
  >({});
  const [restaurants, setRestaurants] = createSignal<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = createSignal(false);

  const [statusFilter, setStatusFilter] = createSignal<number | undefined>(
    undefined,
  );
  const [arriveTimeStart, setArriveTimeStart] = createSignal("");
  const [arriveTimeEnd, setArriveTimeEnd] = createSignal("");

  const loadData = async () => {
    setLoading(true);
    try {
      const filter: any = {};

      if (statusFilter() !== undefined) {
        filter.status = statusFilter();
      }

      if (arriveTimeStart()) {
        filter.arriveTimeStart = dayjs(arriveTimeStart()).format(
          "YYYY-MM-DD 00:00:00",
        );
      }

      if (arriveTimeEnd()) {
        filter.arriveTimeEnd = dayjs(arriveTimeEnd()).format(
          "YYYY-MM-DD 23:59:59",
        );
      }

      const filterParam = Object.keys(filter).length > 0 ? filter : undefined;

      const data = await getReservations(
        pageSize(),
        (page() - 1) * pageSize(),
        filterParam,
      );
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    loadData();
  };

  const clearFilters = () => {
    setStatusFilter(undefined);
    setArriveTimeStart("");
    setArriveTimeEnd("");
    loadData();
  };

  onMount(() => {
    loadData();
  });

  const columns: ColumnDef<Reservation>[] = [
    // {
    //   accessorKey: "id",
    //   header: "Reservation ID",
    // },

    {
      accessorKey: "restaurantName",
      header: "Restaurant Name",
    },
    {
      accessorKey: "guestName",
      header: "Guest Name",
    },
    {
      accessorKey: "arriveTime",
      header: "Arrival Time",
      cell: ({ getValue }) => {
        return dayjs(getValue() as string).format("YYYY-MM-DD HH:mm");
      },
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as number;
        const statusInfo = getStatusInfo(status);
        return (
          <span
            class={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        );
      },
    },
    {
      accessorKey: "tableSize",
      header: "Table Size",
    },

    // {
    //   accessorKey: "guestPhone",
    //   header: "Guest Phone",
    // },
    {
      accessorKey: "guestEmail",
      header: "Guest Email",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const reservation = row.original;
        return (
          <div class="flex gap-2">
            <AsyncButton
              size="sm"
              variant="outline"
              onClick={async () => {
                const model = await getReservationApi(reservation.id);
                console.log("model");
                setViewReservation(model as Reservation);
                setShowViewDialog(true);
              }}
            >
              View
            </AsyncButton>

            {reservation.operate?.includes(1) && (
              <AsyncButton
                size="sm"
                onClick={async () => {
                  await approveReservationApi(reservation.id);
                  showToast({
                    title: "Success",
                    description: "Reservation approved",
                    variant: "success",
                    duration: 3000,
                  });
                  await loadData();
                }}
              >
                Approve
              </AsyncButton>
            )}
            {reservation.operate?.includes(2) && (
              <AsyncButton
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCancelDialog(true);
                  setCancelId(reservation.id);
                }}
              >
                Cancel
              </AsyncButton>
            )}
            {reservation.operate?.includes(3) && (
              <AsyncButton
                size="sm"
                onClick={async () => {
                  await completeReservationApi(reservation.id);
                  showToast({
                    title: "Success",
                    description: "Reservation completed",
                    variant: "success",
                    duration: 3000,
                  });
                  await loadData();
                }}
              >
                Complete
              </AsyncButton>
            )}
          </div>
        );
      },
    },
  ];

  const handleCancelConfirm = async () => {
    if (!cancelReason().trim()) {
      showToast({
        title: "Error",
        description: "Please enter a reason for cancellation",
        variant: "error",
        duration: 3000,
      });
      return;
    }

    await cancelReservationApi(cancelId(), cancelReason());
    showToast({
      title: "Success",
      description: "Reservation cancelled successfully",
      variant: "success",
      duration: 3000,
    });
    setShowCancelDialog(false);
    setCancelReason("");
    await loadData();
  };

  const handleEditClick = () => {
    setEditingReservation({ ...viewReservation()! });
    setShowViewDialog(false);
    setShowEditDialog(true);
    loadRestaurants();
  };

  const loadRestaurants = async () => {
    setLoadingRestaurants(true);
    const data = await getRestaurants();
    setRestaurants(data || []);
    setLoadingRestaurants(false);
  };

  const handleEditSubmit = async () => {
    await updateReservationApi({
      id: editingReservation().id!,
      restaurantId: editingReservation().restaurantId,
      restaurantName: editingReservation().restaurantName,
      tableSize: editingReservation().tableSize,
      guestName: editingReservation().guestName,
      guestPhone: editingReservation().guestPhone,
      guestEmail: editingReservation().guestEmail,
      arriveTime: dayjs(editingReservation().arriveTime).format(
        "YYYY-MM-DD HH:mm:00",
      ),
    });

    showToast({
      title: "Success",
      description: "Reservation updated successfully",
      variant: "success",
      duration: 3000,
    });

    setShowEditDialog(false);
    await loadData();
  };

  return (
    <div class="container mx-auto py-10 px-4">
      <div class="text-left mb-100">
        <h1 class="text-3xl font-bold mb-4">Admin - Reservations</h1>
        <p class="text-muted-foreground mt-1">
          Administrators can view all user reservation information here.
        </p>
      </div>

      {/* 筛选器 */}
      <div class="bg-card rounded-lg border p-4 mb-4">
        <div class="grid grid-cols-3 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Status
            </label>
            <Select
              value={statusFilter()?.toString() || ""}
              onChange={(value) => {
                setStatusFilter(value ? parseInt(value) : undefined);
              }}
              options={getStatusOptions()}
              itemComponent={(props) => {
                const status = parseInt(props.item.rawValue);
                const statusInfo = getStatusInfo(status);
                return (
                  <SelectItem item={props.item}>{statusInfo.label}</SelectItem>
                );
              }}
            >
              <SelectTrigger>
                <SelectValue<string>>
                  {(state) => {
                    const selected = state.selectedOption();
                    if (!selected) return "All Statuses";
                    const status = parseInt(selected);
                    const statusInfo = getStatusInfo(status);
                    return statusInfo.label;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent />
            </Select>
          </div>

          <FormField
            label="Arrival Time From"
            type="date"
            value={arriveTimeStart()}
            onChange={(e: Event & { currentTarget: HTMLInputElement }) =>
              setArriveTimeStart(e.currentTarget.value)
            }
          />

          <FormField
            label="Arrival Time To"
            type="date"
            value={arriveTimeEnd()}
            onChange={(e: Event & { currentTarget: HTMLInputElement }) =>
              setArriveTimeEnd(e.currentTarget.value)
            }
          />
        </div>

        {/* 筛选按钮 */}
        <div class="flex gap-2 mt-4 justify-end">
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
          <Button onClick={applyFilters}>Query</Button>
        </div>
      </div>

      <Show when={!loading()} fallback={<div>Loading...</div>}>
        <DataTable
          data={result()?.data ?? []}
          columns={columns}
          pagination={{
            pageIndex: page() - 1,
            pageSize: pageSize(),
            pageCount: Math.ceil((result()?.total ?? 0) / pageSize()),
            onPageChange: async (newPage: number) => {
              setPage(newPage + 1);
              await loadData();
            },
            total: result()?.total ?? 0,
          }}
        />
      </Show>

      <AlertDialog open={showCancelDialog()} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent class="max-w-md" showCloseButton={false}>
          <div class="space-y-4">
            <AlertDialogTitle class="text-xl font-bold text-center">
              Cancel Reservation
            </AlertDialogTitle>

            <AlertDialogDescription class="space-y-4 pt-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Cancellation Reason
                </label>
                <textarea
                  class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter the reason for cancellation"
                  value={cancelReason()}
                  onInput={(
                    e: Event & { currentTarget: HTMLTextAreaElement },
                  ) => setCancelReason(e.currentTarget.value)}
                  rows={4}
                />
              </div>
            </AlertDialogDescription>

            <div class="flex gap-2">
              <AsyncButton
                variant="outline"
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancelReason("");
                }}
              >
                Back
              </AsyncButton>
              <AsyncButton onClick={handleCancelConfirm}>
                Confirm Cancel
              </AsyncButton>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showViewDialog()} onOpenChange={setShowViewDialog}>
        <AlertDialogContent class="max-w-2xl" showCloseButton={true}>
          <div class="space-y-4">
            <AlertDialogTitle class="text-xl font-bold text-center">
              Reservation Details
            </AlertDialogTitle>

            <AlertDialogDescription class="space-y-4 pt-2">
              <Card>
                <CardHeader>
                  <CardTitle class="text-base">
                    Reservation Information
                  </CardTitle>
                </CardHeader>
                <CardContent class="space-y-3">
                  <CardItem
                    label="Reservation ID"
                    value={viewReservation()?.id || ""}
                    itemClass="text-base font-semibold"
                  />
                  <CardItem
                    label="Restaurant"
                    value={viewReservation()?.restaurantName || ""}
                    itemClass="text-base font-semibold"
                  />
                  <CardItem
                    label="Arrival Time"
                    value={
                      viewReservation()?.arriveTime
                        ? dayjs(viewReservation()!.arriveTime).format(
                            "YYYY-MM-DD HH:mm",
                          )
                        : ""
                    }
                    itemClass="text-base font-semibold"
                  />
                  <CardItem
                    label="Table Size"
                    value={`${viewReservation()?.tableSize || 0} `}
                    itemClass="text-base font-semibold"
                  />
                  <CardItem
                    label="Status"
                    value={(() => {
                      const status = viewReservation()?.status || 0;
                      return getStatusInfo(status).label;
                    })()}
                    itemClass={`text-base font-semibold ${STATUS_MAP[viewReservation()?.status || 0]?.color}`}
                  />

                  <div class="border-t pt-3 mt-3">
                    <h4 class="text-sm font-semibold mb-2">
                      Guest Information
                    </h4>
                    <CardItem
                      label="Guest Name"
                      value={viewReservation()?.guestName || ""}
                      itemClass="text-base font-semibold"
                    />
                    <CardItem
                      label="Guest Phone"
                      value={viewReservation()?.guestPhone || ""}
                      itemClass="text-base font-semibold"
                    />
                    <CardItem
                      label="Guest Email"
                      value={viewReservation()?.guestEmail || ""}
                      itemClass="text-base font-semibold"
                    />
                  </div>

                  <Show when={viewReservation()?.cancelReason}>
                    <div class="border-t pt-3 mt-3">
                      <CardItem
                        label="Cancellation Reason"
                        value={viewReservation()?.cancelReason || ""}
                        itemClass="text-base font-semibold text-red-600"
                      />
                    </div>
                  </Show>
                </CardContent>
              </Card>
            </AlertDialogDescription>

            <div class="flex gap-2">
              {/* <Button
                variant="outline"
                onClick={() => setShowViewDialog(false)}
              >
                Close
              </Button> */}
              {/* <Show when={viewReservation()?.status === 0}>
                <Button onClick={handleEditClick}>Edit</Button>
              </Show> */}
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showEditDialog()} onOpenChange={setShowEditDialog}>
        <AlertDialogContent class="max-w-2xl" showCloseButton={false}>
          <div class="space-y-4">
            <AlertDialogTitle class="text-xl font-bold text-center">
              Edit Reservation
            </AlertDialogTitle>

            <AlertDialogDescription class="space-y-4 pt-2">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Restaurant
                  </label>
                  <Show
                    when={!loadingRestaurants()}
                    fallback={<div class="text-center py-2">Loading...</div>}
                  >
                    <Select
                      value={editingReservation().restaurantId || ""}
                      onChange={(value) => {
                        const restaurant = restaurants().find(
                          (r) => r.id === value,
                        );
                        setEditingReservation((prev) => ({
                          ...prev,
                          restaurantId: value || undefined,
                          restaurantName: restaurant?.name || "",
                        }));
                      }}
                      options={restaurants().map((r) => r.id)}
                      itemComponent={(props) => {
                        const restaurant = restaurants().find(
                          (r) => r.id === props.item.rawValue,
                        );
                        return (
                          <SelectItem item={props.item}>
                            {restaurant?.name}
                          </SelectItem>
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue<string>>
                          {(state) => {
                            const restaurant = restaurants().find(
                              (r) => r.id === state.selectedOption(),
                            );
                            return restaurant?.name || "Select a restaurant";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent />
                    </Select>
                  </Show>
                </div>

                <FormField
                  label="Table Size"
                  placeholder="Enter table size"
                  type="number"
                  value={editingReservation().tableSize?.toString() || ""}
                  onChange={(e: Event & { currentTarget: HTMLInputElement }) =>
                    setEditingReservation((prev) => ({
                      ...prev,
                      tableSize: parseInt(e.currentTarget.value) || 0,
                    }))
                  }
                />

                <FormField
                  label="Arrival Time"
                  type="datetime-local"
                  value={
                    editingReservation().arriveTime
                      ? dayjs(editingReservation().arriveTime).format(
                          "YYYY-MM-DD HH:mm",
                        )
                      : ""
                  }
                  onChange={(
                    e: Event & { currentTarget: HTMLInputElement },
                  ) => {
                    const date = dayjs(e.currentTarget.value).format(
                      "YYYY-MM-DD HH:mm",
                    );
                    setEditingReservation((prev) => ({
                      ...prev,
                      arriveTime: date,
                    }));
                  }}
                />

                <FormField
                  label="Guest Name"
                  placeholder="Enter guest name"
                  type="text"
                  value={editingReservation().guestName || ""}
                  onChange={(e: Event & { currentTarget: HTMLInputElement }) =>
                    setEditingReservation((prev) => ({
                      ...prev,
                      guestName: e.currentTarget.value,
                    }))
                  }
                />

                <FormField
                  label="Guest Phone"
                  placeholder="Enter guest phone"
                  type="tel"
                  value={editingReservation().guestPhone || ""}
                  onChange={(e: Event & { currentTarget: HTMLInputElement }) =>
                    setEditingReservation((prev) => ({
                      ...prev,
                      guestPhone: e.currentTarget.value,
                    }))
                  }
                />

                <FormField
                  label="Guest Email"
                  placeholder="Enter guest email"
                  type="email"
                  value={editingReservation().guestEmail || ""}
                  onChange={(e: Event & { currentTarget: HTMLInputElement }) =>
                    setEditingReservation((prev) => ({
                      ...prev,
                      guestEmail: e.currentTarget.value,
                    }))
                  }
                />
              </div>
            </AlertDialogDescription>

            <div class="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Back
              </Button>
              <AsyncButton onClick={handleEditSubmit}>Save Changes</AsyncButton>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
