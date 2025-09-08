import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Example from "../Components/Example";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
      <ToastContainer position="top-right" autoClose={3000} />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}


