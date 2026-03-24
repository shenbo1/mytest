import { AsyncButton, Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Flex } from "~/components/ui/flex";
import { Progress, ProgressValueLabel } from "~/components/ui/progress";
import { createSignal, createMemo, For, Show, onMount } from "solid-js";
import { CardItem } from "~/components/ui/card-item";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import ButtonGroup from "~/components/ui/button-group";
import { FormField } from "~/components/ui/text-field";
import { showToast, Toaster } from "~/components/ui/toast";
import { useFormValidation } from "~/hooks/use-form-validation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  createReservationApi,
  updateReservationApi,
  getRestaurants,
  type Restaurant,
  type CreateReservationInput,
  type Reservation,
} from "~/services/reservationService";
import { useNavigate } from "@solidjs/router";

dayjs.extend(isSameOrAfter);

interface FormData {
  restaurantId: string;
  date: string;
  time: string;
  tableSize: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
}

interface ReservationFormProps {
  mode?: "create" | "edit";
  initialData?: Reservation;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReservationForm(props: ReservationFormProps) {
  const navigate = useNavigate();
  const [step, setStep] = createSignal(1);
  const [restaurants, setRestaurants] = createSignal<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = createSignal(true);

  const [formData, setFormData] = createSignal<FormData>({
    restaurantId: props.initialData?.restaurantId || "",
    date: props.initialData
      ? dayjs(props.initialData.arriveTime).format("YYYY-MM-DD")
      : "",
    time: props.initialData
      ? dayjs(props.initialData.arriveTime).format("HH:mm")
      : "",
    tableSize: props.initialData?.tableSize || 1,
    guestName: props.initialData?.guestName || "",
    guestPhone: props.initialData?.guestPhone || "",
    guestEmail: props.initialData?.guestEmail || "",
  });

  const { errors, validate, hasErrors, setFieldError } = useFormValidation({
    guestName: {
      required: true,
      validator: (value) => {
        if (value.trim().length < 1 || value.trim().length > 20) {
          return "Guest name length must be between 1 and 20 characters";
        }
        return undefined;
      },
      message: "Guest name is required and must be between 1 and 20 characters",
    },
    guestPhone: {
      required: true,
      pattern: /^1[0-9]{10}$/,
      message: "Guest phone must be a valid phone number with 11 digits",
    },
    guestEmail: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Guest email must be a valid email address",
    },
  });

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldError(field, undefined);
  };

  const tableSizes = createMemo(() => {
    const sizes = [];
    for (let i = 1; i <= 20; i++) {
      sizes.push({ value: i, label: `${i}` });
    }
    return sizes;
  });

  const startDate = createMemo(() => {
    const now = dayjs();
    const currentHour = now.hour();
    if (currentHour >= 21) {
      return now.add(1, "day").startOf("day");
    }
    return now.startOf("day");
  });

  const dateRange = createMemo(() => {
    const dates = [];
    const start = startDate();

    for (let i = 0; i <= 90; i++) {
      const date = start.add(i, "day");
      const value = date.format("YYYY-MM-DD");
      const label = date.format("ddd, MMM D");
      dates.push({ value, label });
    }
    return dates;
  });

  const timeRange = createMemo(() => {
    const times = [
      { value: "10:30", label: "10:30" },
      { value: "11:00", label: "11:00" },
      { value: "11:30", label: "11:30" },
      { value: "12:00", label: "12:00" },
      { value: "12:30", label: "12:30" },
      { value: "13:00", label: "13:00" },
      { value: "13:30", label: "13:30" },
      { value: "14:00", label: "14:00" },
      { value: "16:00", label: "16:00" },
      { value: "16:30", label: "16:30" },
      { value: "17:00", label: "17:00" },
      { value: "17:30", label: "17:30" },
      { value: "18:00", label: "18:00" },
      { value: "18:30", label: "18:30" },
      { value: "19:00", label: "19:00" },
      { value: "19:30", label: "19:30" },
      { value: "20:00", label: "20:00" },
      { value: "20:30", label: "20:30" },
      { value: "21:00", label: "21:00" },
    ];

    const selectedDateObj = dayjs(formData().date);
    const today = dayjs();

    if (selectedDateObj.isSame(today, "day")) {
      const currentMinutes = today.hour() * 60 + today.minute();

      return times.filter((time) => {
        const [hour, minute] = time.value.split(":").map(Number);
        const timeMinutes = hour * 60 + minute;
        return timeMinutes > currentMinutes;
      });
    }

    return times;
  });

  if (!formData().date && dateRange().length > 0) {
    updateField("date", dateRange()[0].value);
  }

  if (!formData().time && timeRange().length > 0) {
    updateField("time", timeRange()[0]?.value || "");
  }

  const [showConfirmDialog, setShowConfirmDialog] = createSignal(false);
  const [showSuccessDialog, setShowSuccessDialog] = createSignal(false);

  const handleSubmit = async () => {
    if (validate(formData()) && hasErrors()) {
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    const arriveTime = dayjs(
      `${formData().date} ${formData().time}`,
    ).toISOString();

    const input: CreateReservationInput = {
      restaurantId: formData().restaurantId,
      restaurantName:
        restaurants().find((r) => r.id === formData().restaurantId)?.name ?? "",
      tableSize: formData().tableSize,
      guestName: formData().guestName,
      guestPhone: formData().guestPhone,
      guestEmail: formData().guestEmail,
      arriveTime,
    };

    try {
      if (props.mode === "edit" && props.initialData) {
        await updateReservationApi({
          id: props.initialData.id,
          ...input,
        });
      } else {
        await createReservationApi(input);
      }

      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
    } catch (error) {
      showToast({
        title: "Error",
        description:
          props.mode === "edit"
            ? "Failed to update reservation"
            : "Failed to create reservation",
        variant: "error",
        duration: 3000,
      });
    }
  };

  onMount(async () => {
    setLoadingRestaurants(true);
    const data = await getRestaurants();
    setRestaurants(data || []);
    if (props.mode === "create" && data && data.length > 0) {
      updateField("restaurantId", data[0].id);
    }

    setLoadingRestaurants(false);
  });

  return (
    <>
      <Card class="w-full max-w-lg">
        <CardHeader>
          <CardTitle class="text-2xl font-bold text-center">
            {props.mode === "edit" ? "Edit Reservation" : "New Reservation"}
          </CardTitle>
          <CardDescription class="space-y-3 text-center">
            <p class="text-sm text-muted-foreground">
              {props.mode === "edit"
                ? "Modify your reservation by filling out the form below."
                : "Make a reservation by filling out the form below."}
            </p>
            <Progress
              value={step()}
              minValue={0}
              maxValue={2}
              getValueLabel={({ value, max }) => `Step ${value} of ${max}`}
              class="w-full mt-2"
            >
              <ProgressValueLabel />
            </Progress>
          </CardDescription>
        </CardHeader>
        <CardContent class="text-left">
          <Show when={step() === 1}>
            <div class="space-y-4">
              <Show
                when={!loadingRestaurants()}
                fallback={
                  <div class="text-center py-4">Loading restaurants...</div>
                }
              >
                <ButtonGroup
                  dataSource={restaurants().map((r) => ({
                    label: r.name,
                    value: r.id,
                  }))}
                  value={formData().restaurantId}
                  label="Arrive Restaurant"
                  onItemClick={(value) =>
                    updateField("restaurantId", String(value))
                  }
                />
              </Show>
              <ButtonGroup
                dataSource={dateRange()}
                value={formData().date}
                label="Arrive Date"
                onItemClick={(value) => {
                  updateField("date", String(value));
                  updateField("time", timeRange()[0].value);
                }}
              />

              <ButtonGroup
                dataSource={timeRange()}
                value={formData().time}
                label="Arrive Time"
                onItemClick={(value) => {
                  updateField("time", String(value));
                }}
              />

              <ButtonGroup
                dataSource={tableSizes()}
                value={formData().tableSize}
                label="Table Size"
                onItemClick={(value) => updateField("tableSize", Number(value))}
              />
            </div>
          </Show>
          <Show when={step() === 2}>
            <div class="space-y-4">
              <div class="space-y-4 pt-2">
                <h3 class="text-sm font-semibold">Guest Information</h3>
                <FormField
                  label="* Guest Name"
                  placeholder="Enter guest name"
                  type="text"
                  value={formData().guestName}
                  onChange={(
                    e: Event & { currentTarget: HTMLInputElement },
                  ) => {
                    updateField("guestName", e.currentTarget.value);
                  }}
                  error={errors().guestName}
                  itemClass={errors().guestName ? "border-red-500" : ""}
                />
                <FormField
                  label="* Guest Phone"
                  placeholder="Enter guest phone"
                  type="tel"
                  value={formData().guestPhone}
                  onChange={(e: Event & { currentTarget: HTMLInputElement }) =>
                    updateField("guestPhone", e.currentTarget.value)
                  }
                  error={errors().guestPhone}
                  itemClass={errors().guestPhone ? "border-red-500" : ""}
                />
                <FormField
                  label="* Guest Email"
                  placeholder="Enter guest email"
                  type="email"
                  value={formData().guestEmail}
                  onChange={(e: Event & { currentTarget: HTMLInputElement }) =>
                    updateField("guestEmail", e.currentTarget.value)
                  }
                  error={errors().guestEmail}
                  itemClass={errors().guestEmail ? "border-red-500" : ""}
                />
              </div>
            </div>
          </Show>
        </CardContent>
        <CardFooter>
          <Show when={step() === 1}>
            <Button
              class="w-full"
              onClick={() => {
                setStep(2);
              }}
            >
              Next
            </Button>
          </Show>
          <Show when={step() === 2}>
            <Button
              variant="outline"
              class="w-full mr-2"
              onClick={() => {
                setStep(1);
              }}
            >
              Prev
            </Button>

            <AsyncButton class="w-full" onClick={handleSubmit}>
              {props.mode === "edit" ? "Update" : "Submit"}
            </AsyncButton>
          </Show>

          <AlertDialog
            open={showConfirmDialog()}
            onOpenChange={setShowConfirmDialog}
          >
            <AlertDialogContent class="max-w-md">
              <div class="space-y-4">
                <AlertDialogTitle class="text-xl font-bold text-center">
                  Please Confirm Your Reservation
                </AlertDialogTitle>

                <AlertDialogDescription class="space-y-4 pt-2">
                  <Card class="bg-muted/50">
                    <CardHeader class="pb-3">
                      <CardTitle class="text-base">
                        Reservation Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-3">
                      <CardItem
                        label="Restaurant"
                        value={
                          restaurants().find(
                            (r) => r.id === formData().restaurantId,
                          )?.name || "Unknown"
                        }
                      />
                      <CardItem
                        label="Date Time"
                        value={`${formData().date} ${formData().time}`}
                      />
                      <CardItem
                        label="Table Size"
                        value={`${formData().tableSize}`}
                      />

                      <CardItem
                        label="Guest Name"
                        value={formData().guestName}
                      />
                      <CardItem
                        label="Guest Phone"
                        value={formData().guestPhone}
                      />
                      <CardItem
                        label="Guest Email"
                        value={formData().guestEmail}
                      />
                    </CardContent>
                  </Card>
                </AlertDialogDescription>

                <Flex>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Cancel
                  </Button>
                  <AsyncButton onClick={handleConfirmSubmit}>
                    {props.mode === "edit" ? "Update" : "Confirm"} Reservation
                  </AsyncButton>
                </Flex>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={showSuccessDialog()}
            onOpenChange={setShowSuccessDialog}
          >
            <AlertDialogContent class="max-w-md" showCloseButton={false}>
              <div class="space-y-4 text-center">
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  ✔️
                </div>
                <AlertDialogTitle class="text-xl font-bold">
                  {props.mode === "edit"
                    ? "Update Successful!"
                    : "Reservation Successful!"}
                </AlertDialogTitle>
                <AlertDialogDescription class="text-muted-foreground">
                  Your reservation has been{" "}
                  {props.mode === "edit" ? "updated" : "created"} successfully
                </AlertDialogDescription>
                <AsyncButton
                  onClick={() => {
                    if (props.onSuccess) {
                      props.onSuccess();
                    } else {
                      navigate("/reservation/list");
                    }
                  }}
                >
                  {props.mode === "edit"
                    ? "Back to List"
                    : "View My Reservation"}
                </AsyncButton>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          <Toaster />
        </CardFooter>
      </Card>
    </>
  );
}
