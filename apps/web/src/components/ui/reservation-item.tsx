import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CardItem } from "~/components/ui/card-item";
import dayjs from "dayjs";
import { AsyncButton, Button } from "./button";
import { Show, createSignal } from "solid-js";
import type { Reservation } from "~/services/reservationService";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  TextField,
  TextFieldLabel,
  TextFieldInput,
} from "~/components/ui/text-field";
import { getStatusInfo, ReservationStatus } from "~/constants/reservation";

interface ReservationItemProps {
  reservation: Reservation;
  onCancel?: (reason: string) => void;
  onEdit?: () => void;
}
export function ReservationItem(props: ReservationItemProps) {
  const { reservation, onCancel, onEdit } = props;
  const [showCancelDialog, setShowCancelDialog] = createSignal(false);
  const [cancelReason, setCancelReason] = createSignal("");

  const handleCancelClick = () => {
    setCancelReason("");
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    if (!cancelReason().trim()) {
      return;
    }
    onCancel?.(cancelReason());
    setShowCancelDialog(false);
  };

  return (
    <>
      <Card class="border min-w-[280px] md:min-w-[350px]">
        <CardHeader class="pb-3">
          <div class="flex justify-left items-start">
            <div class="text-left">
              <CardTitle class="text-lg">
                {reservation.restaurantName}
              </CardTitle>
              <CardDescription class="mt-1 text-red-500">
                {dayjs(reservation.arriveTime).format("YYYY-MM-DD HH:mm dddd")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-2">
          <CardItem label="Table Size" value={`${reservation.tableSize} `} />
          <CardItem label="Guest Name" value={reservation.guestName} />
          <CardItem label="Phone" value={reservation.guestPhone} />
          <CardItem label="Email" value={reservation.guestEmail} />
          <CardItem
            label="Status"
            itemClass={`${getStatusInfo(reservation.status).color}`}
            value={getStatusInfo(reservation.status).label}
          />
          {reservation.cancelReason && (
            <CardItem
              itemClass="text-red-500"
              label="Reason"
              value={reservation.cancelReason}
            />
          )}
        </CardContent>

        <CardFooter class="gap-2">
          <Show when={reservation.status === ReservationStatus.REQUESTED}>
            {onEdit && (
              <Button
                variant="outline"
                onClick={onEdit}
                class="flex-1"
              >
                Edit
              </Button>
            )}
            <AsyncButton
              onClick={handleCancelClick}
              variant="secondary"
              class="flex-1"
            >
              Cancel
            </AsyncButton>
          </Show>
        </CardFooter>
      </Card>

      <AlertDialog open={showCancelDialog()} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent class="max-w-md">
          <div class="space-y-4">
            <AlertDialogTitle class="text-xl font-bold text-center">
              Confirm Cancellation
            </AlertDialogTitle>

            <AlertDialogDescription class="space-y-4 pt-2">
              <p class="text-sm text-muted-foreground">
                Are you sure you want to cancel this reservation?
              </p>

              <TextField class="grid gap-2">
                <TextFieldLabel>Cancellation Reason</TextFieldLabel>
                <TextFieldInput
                  placeholder="Please enter the reason for cancellation"
                  value={cancelReason()}
                  onInput={(e) => setCancelReason(e.currentTarget.value)}
                />
              </TextField>
            </AlertDialogDescription>

            <div class="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                class="flex-1"
              >
                Back
              </Button>
              <AsyncButton
                onClick={handleConfirmCancel}
                disabled={!cancelReason().trim()}
                class="flex-1"
              >
                Confirm Cancel
              </AsyncButton>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
