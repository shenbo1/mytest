import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  Observable,
} from "@apollo/client";
import { showToast } from "~/components/ui/toast";
import { logout } from "~/services/authService";

const API_URL =
  import.meta.env.VITE_API_URL + "/graphql" || "http://localhost:3000/graphql";

const errorLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next(response) {
        if (response.errors?.length) {
          for (const error of response.errors) {
            const { message, extensions } = error;

            if (extensions?.code === "UNAUTHENTICATED") {
              logout();
              continue;
            }

            if (extensions?.code === "FORBIDDEN") {
              continue;
            }

            if (extensions?.code === "BAD_USER_INPUT") {
              console.warn("[输入验证失败]", message);
              continue;
            }

            showToast({
              title: "Error",
              description: message,
              duration: 3000,
            });
          }
        }

        observer.next(response);
      },
      error(error) {
        observer.error(error);
      },
      complete() {
        observer.complete();
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  });
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("token");

  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : "",
      "content-type": "application/json",
    },
  });

  return forward(operation);
});

const requestLoggerLink = new ApolloLink((operation, forward) => {
  if (import.meta.env.DEV) {
    console.log(
      `[🚀 GraphQL Request] ${operation.operationName}`,
      operation.variables,
    );
  }

  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next(response) {
        if (import.meta.env.DEV) {
          console.log(
            `[✅ GraphQL Response] ${operation.operationName}`,
            response,
          );
        }
        observer.next(response);
      },
      error(error) {
        observer.error(error);
      },
      complete() {
        observer.complete();
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  });
});

const httpLink = new HttpLink({
  uri: API_URL,
  credentials: "include",
  fetchOptions: {
    cache: "no-cache",
  },
});

const linkChain = ApolloLink.from([
  errorLink,
  requestLoggerLink,
  authLink.concat(httpLink),
]);

export const client = new ApolloClient({
  link: linkChain,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          reservations: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

export type { ApolloClient };
