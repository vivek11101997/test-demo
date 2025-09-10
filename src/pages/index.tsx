import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Example from "../Components/Example";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Test from "../Components/test";
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Test/>
      <ToastContainer position="top-right" autoClose={3000} />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}


