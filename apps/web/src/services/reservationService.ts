import { gql } from "@apollo/client";
import { client } from "../lib/apollo-client";

export interface CreateReservationInput {
  restaurantId: string;
  restaurantName: string;
  tableSize: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  arriveTime: string;
}

export interface UpdateReservationInput extends Partial<CreateReservationInput> {
  id: string;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  tableSize: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  arriveTime: string;
  status: number;
  operate?: number[];
  userId: string;
  cancelReason?: string;
}

export interface ReservationFilter {
  status?: number;
  arriveTimeStart?: string;
  arriveTimeEnd?: string;
}

export interface ReservationsResponse {
  reservations: {
    data: Reservation[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
export interface ReservationResponse {
  reservation: Reservation;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  phone: string;
}

export interface RestaurantsResponse {
  restaurants: Restaurant[];
}

export interface RestaurantResponse {
  restaurant: Restaurant;
}

// GraphQL Queries & Mutations
const CREATE_RESERVATION_MUTATION = gql`
  mutation CreateReservation($input: CreateReservationInput!) {
    createReservation(input: $input) {
      restaurantId
      tableSize
      guestName
      guestPhone
      guestEmail
      arriveTime
    }
  }
`;

const GET_RESERVATIONS_QUERY = gql`
  query GetReservations(
    $limit: Int!
    $offset: Int!
    $filter: ReservationFilterInput
  ) {
    reservations(limit: $limit, offset: $offset, filter: $filter) {
      data {
        id
        status
        restaurantId
        restaurantName
        tableSize
        guestName
        guestPhone
        guestEmail
        arriveTime
        status
        operate
        cancelReason
      }
      total
      limit
      offset
      hasMore
    }
  }
`;

const GET_RESERVATION_QUERY = gql`
  query GetReservation($id: String!) {
    reservation(id: $id) {
      id
      restaurantId
      restaurantName
      tableSize
      guestName
      guestPhone
      guestEmail
      arriveTime
      status
    }
  }
`;

const UPDATE_RESERVATION_MUTATION = gql`
  mutation UpdateReservation($input: UpdateReservationInput!) {
    updateReservation(updateReservationInput: $input) {
      id
      restaurantId
      tableSize
      guestName
      guestPhone
      guestEmail
      status
    }
  }
`;

const CANCEL_RESERVATION_MUTATION = gql`
  mutation cancel($id: String!, $reason: String!) {
    cancel(id: $id, reason: $reason) {
      id
      restaurantId
      tableSize
      guestName
      guestPhone
      guestEmail
      status
    }
  }
`;

const COMPLETE_RESERVATION_MUTATION = gql`
  mutation CompleteReservation($id: String!) {
    complete(id: $id) {
      id
      restaurantId
      tableSize
      guestName
      guestPhone
      guestEmail
      status
    }
  }
`;

const APPROVE_RESERVATION_MUTATION = gql`
  mutation ApproveReservation($id: String!) {
    approve(id: $id) {
      id
      restaurantId
      tableSize
      guestName
      guestPhone
      guestEmail
      status
    }
  }
`;

const GET_RESTAURANTS_QUERY = gql`
  query GetRestaurants {
    restaurants {
      id
      name
      description
      address
      phone
    }
  }
`;

export const createReservationApi = async (input: CreateReservationInput) => {
  const { data } = await client.mutate({
    mutation: CREATE_RESERVATION_MUTATION,
    variables: { input },
  });
  return data;
};

/**
 * 获取预订列表（分页）
 */
export const getReservations = async (
  limit: number = 10,
  offset: number = 0,
  filter?: ReservationFilter,
) => {
  const { data } = await client.query<ReservationsResponse>({
    query: GET_RESERVATIONS_QUERY,
    variables: { limit, offset, filter },
  });
  return data?.reservations;
};

/**
 * 获取单个预订详情
 */
export const getReservationApi = async (id: string) => {
  const { data } = await client.query<ReservationResponse>({
    query: GET_RESERVATION_QUERY,
    variables: { id },
  });
  return data?.reservation;
};

/**
 * 更新预订
 */
export const updateReservationApi = async (input: UpdateReservationInput) => {
  const { data } = await client.mutate({
    mutation: UPDATE_RESERVATION_MUTATION,
    variables: { input },
  });
  return data;
};

/**
 * 取消预订
 */
export const cancelReservationApi = async (id: string, reason: string) => {
  const { data } = await client.mutate({
    mutation: CANCEL_RESERVATION_MUTATION,
    variables: { id, reason },
  });
  return data;
};

/**
 * 完成预订
 */
export const completeReservationApi = async (id: string) => {
  const { data } = await client.mutate({
    mutation: COMPLETE_RESERVATION_MUTATION,
    variables: { id },
  });
  return data;
};

/**
 * 批准预订
 */
export const approveReservationApi = async (id: string) => {
  const { data } = await client.mutate({
    mutation: APPROVE_RESERVATION_MUTATION,
    variables: { id },
  });
  return data;
};

/** 获取餐厅 */
export const getRestaurants = async () => {
  const { data } = await client.query<RestaurantsResponse>({
    query: GET_RESTAURANTS_QUERY,
  });
  return data?.restaurants;
};
