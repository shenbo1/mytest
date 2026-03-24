import { createSignal, onMount } from "solid-js";
import { Button, AsyncButton } from "~/components/ui/button";
import { Flex } from "~/components/ui/flex";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { showToast } from "~/components/ui/toast";
import { useParams, useNavigate } from "@solidjs/router";
import {
  getReservationApi,
  approveReservationApi,
  cancelReservationApi,
  completeReservationApi,
} from "~/services/reservationService";
import type { Reservation } from "~/services/reservationService";
import dayjs from "dayjs";
import { CardItem } from "~/components/ui/card-item";
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

function ReservationDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = createSignal<Reservation | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [showCancelDialog, setShowCancelDialog] = createSignal(false);
  const [cancelReason, setCancelReason] = createSignal("");

  onMount(async () => {
    await loadReservation();
  });

  const loadReservation = async () => {
    try {
      setLoading(true);
      const data = await getReservationApi(params.id);
      if (data) {
        setReservation(data as Reservation);
      } else {
        showToast({
          title: "Error",
          description: "Reservation not found",
          variant: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to load reservation details",
        variant: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!reservation()) return;
    try {
      await approveReservationApi(reservation()!.id);
      showToast({
        title: "Success",
        description: "Reservation approved",
        variant: "success",
        duration: 3000,
      });
      await loadReservation();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to approve reservation",
        variant: "error",
        duration: 3000,
      });
    }
  };

  const handleCancelClick = () => {
    setCancelReason("");
    setShowCancelDialog(true);
  };

  const handleCancel = async () => {
    if (!reservation()) return;
    if (!cancelReason().trim()) {
      showToast({
        title: "Validation Error",
        description: "Please enter a cancellation reason",
        variant: "error",
        duration: 3000,
      });
      return;
    }
    try {
      await cancelReservationApi(reservation()!.id, cancelReason());
      showToast({
        title: "Success",
        description: "Reservation cancelled",
        variant: "success",
        duration: 3000,
      });
      setShowCancelDialog(false);
      await loadReservation();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to cancel reservation",
        variant: "error",
        duration: 3000,
      });
    }
  };

  const handleComplete = async () => {
    if (!reservation()) return;
    try {
      await completeReservationApi(reservation()!.id);
      showToast({
        title: "Success",
        description: "Reservation completed",
        variant: "success",
        duration: 3000,
      });
      await loadReservation();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to complete reservation",
        variant: "error",
        duration: 3000,
      });
    }
  };

  const getStatusLabel = (status: number) => {
    const statusMap: Record<number, string> = {
      0: "Requested",
      1: "Approved",
      2: "Cancelled",
      3: "Completed",
    };
    return statusMap[status] || status.toString();
  };

  return (
    <Flex class="min-h-screen items-center justify-center p-4">
      <Card class="w-full max-w-2xl">
        <CardHeader>
          <CardTitle class="text-2xl font-bold text-center">
            Reservation Details
          </CardTitle>
          <CardDescription class="text-center">
            View detailed information about your reservation
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          {loading() ? (
            <div class="text-center py-8">Loading...</div>
          ) : reservation() ? (
            <div class="space-y-4">
              <CardItem
                label="Status"
                value={getStatusLabel(reservation()!.status)}
              />
              <CardItem
                label="Restaurant Name"
                value={reservation()!.restaurantName}
              />
              <CardItem
                label="Date & Time"
                value={dayjs(reservation()!.arriveTime).format(
                  "YYYY-MM-DD HH:mm",
                )}
              />
              <CardItem
                label="Table Size"
                value={`${reservation()!.tableSize}`}
              />
              <CardItem label="Guest Name" value={reservation()!.guestName} />
              <CardItem label="Guest Phone" value={reservation()!.guestPhone} />
              <CardItem label="Guest Email" value={reservation()!.guestEmail} />
            </div>
          ) : (
            <div class="text-center py-8 text-muted-foreground">
              Reservation not found
            </div>
          )}
        </CardContent>
        <CardFooter class="flex gap-2 justify-center">
          {reservation() && reservation()!.status === 0 && (
            <>
              <Button variant="outline" onClick={handleApprove}>
                Approve
              </Button>
              <Button variant="outline" onClick={handleCancelClick}>
                Cancel
              </Button>
            </>
          )}
          {reservation() && reservation()!.status === 1 && (
            <Button variant="outline" onClick={handleComplete}>
              Complete
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate("/reservation/list")}
          >
            Back to List
          </Button>
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
                onClick={handleCancel}
                disabled={!cancelReason().trim()}
                class="flex-1"
              >
                Confirm Cancel
              </AsyncButton>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
export default ReservationDetail;
