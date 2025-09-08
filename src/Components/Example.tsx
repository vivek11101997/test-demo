import React, { useEffect, useRef, useState, useMemo } from "react";
import OmSpinner from "./OmSpinner";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { writeMessage, subscribeToMessages } from "../lib/db";
import { toast } from "react-toastify";
function Example() {
  const { ref, inView } = useInView();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const disabledIdsRef = useRef<Set<number>>(new Set());
  const [initialCursorReady, setInitialCursorReady] = useState(false);
  const pageSize = 108;
  const [, forceUpdate] = useState(0);

  const debouncedWriteMessage = useMemo(() => {
    return debounce(async (id: number) => {
      try {
        await writeMessage(id);
      } catch (error) {
        console.error("Error in debounced writeMessage:", error);
        // alert("Failed to send message. Please try again.");
        toast.error("❌ Failed to send message. Please try again.");
      }
    }, 300);
  }, []);
  const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false); // Default false for SSR

    useEffect(() => {
      // Only runs in the browser
      const checkMobile = () => setIsMobile(window.innerWidth <= breakpoint);

      checkMobile(); // Set initial value
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
    }, [breakpoint]);

    return isMobile;
  };
  const isMobile = useIsMobile();

  const getButtonStyle = (
    id: number,
    isSelected: boolean,
    isDisabled: boolean,
    isMobile: boolean
  ) => {
    const is108th = id % 108 === 0;

    return {
      flex: 1,
      padding: "15px 8px",
      fontSize: isMobile ? "1rem" : "1.1rem",
      width: "100%",
      maxWidth: "400px",
      margin: "8px auto",
      border: `2px solid ${
        isSelected ? "#4CAF50" : is108th ? "#FF9800" : "#a1887f"
      }`,
      borderRadius: "16px",
      background: isSelected
        ? "#E8F5E9"
        : is108th
        ? "#FFF3E0"
        : isDisabled
        ? "#f0f0f0"
        : "#ffffff",

      color: isDisabled ? "#9e9e9e" : is108th ? "#BF360C" : "#4e342e",
      cursor: isDisabled ? "not-allowed" : "pointer",
      fontWeight: is108th ? "bold" : "normal",
      transition: "all 0.3s ease",
      boxShadow: isSelected
        ? "0 0 12px rgba(76, 175, 80, 0.6)"
        : is108th
        ? "0 0 10px rgba(255, 152, 0, 0.5)"
        : "0 1px 4px rgba(0,0,0,0.1)",
      textAlign: "center",
    };
  };

  const debouncedUpdateDisabledIds = useMemo(
    () =>
      debounce((newSet: Set<number>) => {
        const currentSet = disabledIdsRef.current;
        const isChanged =
          newSet.size !== currentSet.size ||
          [...newSet].some((id) => !currentSet.has(id));

        if (isChanged) {
          disabledIdsRef.current = newSet;
          forceUpdate((prev) => prev + 1);
        }

        // Once it's populated, mark as ready
        if (!initialCursorReady && newSet.size > 0) {
          setInitialCursorReady(true);
        }
      }, 300),
    [initialCursorReady]
  );

  // Firebase subscription
  useEffect(() => {
    const unsubscribe = subscribeToMessages((data: any) => {
      const list = data ? Object.values(data) : [];
      const newSet = new Set<number>(
        list.map((item) => (item as { text: number }).text)
      );
      debouncedUpdateDisabledIds(newSet);
    });

    return () => {
      unsubscribe();
      debouncedUpdateDisabledIds.cancel();
    };
  }, [debouncedUpdateDisabledIds]);

  // Infinite Query (delayed until initialCursorReady)
  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery({
    queryKey: ["projects"],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`/api/projects?cursor=${pageParam}`);
      const result = await response.json();
      return {
        data: result.data,
        previousId: result.previousId,
        nextId: result.nextId,
      };
    },
    initialPageParam: disabledIdsRef.current.size,
    getPreviousPageParam: (firstPage) => firstPage.previousId,
    getNextPageParam: (lastPage) => lastPage.nextId,
    enabled: initialCursorReady, // <-- Delay query until data is ready
  });

  const debouncedFetchNextPage = useMemo(
    () => debounce(() => fetchNextPage(), 300),
    [fetchNextPage]
  );

  const debouncedFetchPreviousPage = useMemo(
    () => debounce(() => fetchPreviousPage(), 300),
    [fetchPreviousPage]
  );

  useEffect(() => {
    if (inView) {
      debouncedFetchNextPage();
    }
  }, [inView, debouncedFetchNextPage]);

  const handleButtonClick = (id: number) => {
    setSelectedId(id);
    disabledIdsRef.current.add(id);
    forceUpdate((prev) => prev + 1);
    debouncedWriteMessage(id);
  };

  const selectedProject = useMemo(() => {
    return data?.pages
      .flatMap((page) => page.data)
      .find((project) => project.id === selectedId);
  }, [data, selectedId]);

  // Show nothing until Firebase data is loaded
  if (!initialCursorReady) {
    return <OmSpinner />;
  }

  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #fff8e1, #ffecb3)",
        fontFamily: "Georgia, serif",
        color: "#4e342e",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#d84315",
          fontSize: isMobile ? "1.8rem" : "2.5rem",
          marginBottom: "1rem",
          textShadow: "1px 1px 2px #ffcc80",
        }}
      >
        श्री राम जय राम जय जय राम
      </h1>

      <b
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "#fff8e1",
          padding: isMobile ? "0.8rem" : "1rem",
          display: "block",
          textAlign: "center",
          fontSize: isMobile ? "1rem" : "1.3rem",
          color: "#6d4c41",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          borderBottom: "1px solid #ffe082",
        }}
      >
        Number of Mala completed:{" "}
        {Math.floor(disabledIdsRef.current.size / 108)}
      </b>

      {status === "pending" ? (
        <OmSpinner />
      ) : status === "error" ? (
        <span>Error: {(error as Error).message}</span>
      ) : (
        <>
          {/* Load Older Button */}
          <div
            style={{
              textAlign: "center",
              marginBottom: isMobile ? "1rem" : "1.5rem",
              marginTop: "1rem",
            }}
          >
            <button
              onClick={() => debouncedFetchPreviousPage()}
              disabled={!hasPreviousPage || isFetchingPreviousPage}
              style={{
                border: "1px solid #a1887f",
                borderRadius: "12px",
                fontSize: isMobile ? "1rem" : "1.1rem",
                padding: isMobile ? "0.6rem 1rem" : "0.8rem 1.5rem",
                cursor: !hasPreviousPage ? "not-allowed" : "pointer",
                background: !hasPreviousPage ? "#f0f0f0" : "#fff3e0",
                color: !hasPreviousPage ? "#9e9e9e" : "#5d4037",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              {isFetchingPreviousPage
                ? "Loading more..."
                : hasPreviousPage
                ? "Load Older"
                : "Nothing more to load"}
            </button>
          </div>

          {/* Project Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              margin: "2rem 0",
            }}
          >
            {data.pages.map((page, pageIndex) => {
              const firstItem = page?.data?.[0];
              const pageNumber = firstItem
                ? Math.floor(firstItem.id / pageSize)
                : pageIndex;

              return (
                <div
                  key={pageIndex}
                  id={`page-${pageNumber}`}
                  style={{
                    background: "rgba(255, 253, 231, 0.7)",
                    borderRadius: "12px",
                    padding: "1rem",
                    boxShadow: "inset 0 0 8px #ffe082",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    {page.data.map((project: any) => {
                      const isDisabled = disabledIdsRef.current.has(project.id);
                      const isSelected = selectedId === project.id;
                      return (
                        <button
                          id={`project-button-${project.id}`}
                          key={project.id}
                          disabled={isDisabled}
                          onClick={() => handleButtonClick(project.id)}
                          style={getButtonStyle(
                            project.id,
                            isSelected,
                            isDisabled,
                            isMobile
                          )}
                        >
                          <p
                            style={{
                              margin: 0,
                              textAlign: "center",
                              lineHeight: "1.5",
                            }}
                          >
                            {project.id}{" "}
                            {project.id % 108 === 0 ? (
                              <>
                                ✨ श्री राम जय राम जय जय राम <br />✨ जानकी जीवन
                                स्मरण, जय जय राम ✨
                              </>
                            ) : (
                              <>✨ श्री राम जय राम जय जय राम ✨</>
                            )}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load Newer Button */}
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              ref={ref}
              onClick={() => debouncedFetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
              style={{
                border: "1px solid #a1887f",
                borderRadius: "12px",
                padding: "0.8rem 1.5rem",
                fontSize: "1.1rem",
                cursor: !hasNextPage ? "not-allowed" : "pointer",
                background: !hasNextPage ? "#f0f0f0" : "#fff3e0",
                color: !hasNextPage ? "#9e9e9e" : "#5d4037",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              {isFetchingNextPage
                ? "Loading more..."
                : hasNextPage
                ? "Load Newer"
                : "Nothing more to load"}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            {isFetching && !isFetchingNextPage
              ? "Background Updating..."
              : null}
          </div>

          {/* Selected Project Display */}
          {selectedProject && (
            <div
              style={{
                marginTop: "2rem",
                background: "#fff8e1",
                padding: "1rem",
                borderRadius: "10px",
                border: "1px solid #ffe082",
              }}
            >
              <h2 style={{ color: "#6d4c41" }}>Selected Project Details</h2>
              <pre>{JSON.stringify(selectedProject, null, 2)}</pre>
            </div>
          )}
        </>
      )}

      <hr style={{ margin: "2rem 0", borderColor: "#ffe082" }} />
    </div>
  );
}

export default Example;
