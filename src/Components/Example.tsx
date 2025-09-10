import React, { useEffect, useRef, useState, useMemo } from "react";
import OmSpinner from "./OmSpinner";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { writeMessage, subscribeToMessages } from "../lib/db";
import { toast } from "react-toastify";
import styles from "./Example.module.css";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= breakpoint);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);
    return isMobile;
  }

function Example() {
  const { ref, inView } = useInView();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const disabledIdsRef = useRef<Set<number>>(new Set());
  const [initialCursorReady, setInitialCursorReady] = useState(false);
  const pageSize = 108;
  // forceUpdate is used to trigger re-render when ref changes
  const [, forceUpdate] = useState(0);

  const debouncedWriteMessage = useMemo(() => debounce(async (id: number) => {
    try {
      await writeMessage(id);
    } catch (error) {
      console.error("Error in debounced writeMessage:", error);
      toast.error("❌ Failed to send message. Please try again.");
    }
  }, 300), []);

  const isMobile = useIsMobile();

  // Helper to get classNames for project button
  const getButtonClass = (id, isSelected, isDisabled, isMobile) => {
    let classNames = [styles.projectButton];
    if (isMobile) classNames.push(styles.projectButtonMobile);
    if (isSelected) classNames.push(styles.projectButtonSelected);
    if (isDisabled) classNames.push(styles.projectButtonDisabled);
    if (id % 108 === 0) classNames.push(styles.projectButton108th);
    return classNames.join(" ");
  };

  // Memoized debounced update for disabled IDs
  const debouncedUpdateDisabledIds = useMemo(() => debounce((newSet: Set<number>) => {
    const currentSet = disabledIdsRef.current;
    const isChanged = newSet.size !== currentSet.size || [...newSet].some((id) => !currentSet.has(id));
    if (isChanged) {
      disabledIdsRef.current = newSet;
      forceUpdate((prev) => prev + 1);
    }
    if (!initialCursorReady && newSet.size > 0) {
      setInitialCursorReady(true);
    }
  }, 300), [initialCursorReady]);

  // Firebase subscription
  useEffect(() => {
    const unsubscribe = subscribeToMessages((data: any) => {
      const list = data ? Object.values(data) : [];
      const newSet = new Set<number>(list.map((item) => (item as { text: number }).text));
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
    enabled: initialCursorReady,
  });

  const debouncedFetchNextPage = useMemo(() => debounce(fetchNextPage, 300), [fetchNextPage]);
  const debouncedFetchPreviousPage = useMemo(() => debounce(fetchPreviousPage, 300), [fetchPreviousPage]);

  useEffect(() => {
    if (inView) debouncedFetchNextPage();
  }, [inView, debouncedFetchNextPage]);

  const handleButtonClick = (id: number) => {
    setSelectedId(id);
    disabledIdsRef.current.add(id);
    forceUpdate((prev) => prev + 1); // Needed to re-render for disabled state
    debouncedWriteMessage(id);
  };

  const selectedProject = useMemo(() =>
    data?.pages.flatMap((page) => page.data).find((project) => project.id === selectedId)
  , [data, selectedId]);

  if (!initialCursorReady) return <OmSpinner />;

  return (
    <div className={styles.container}>
      <h1
        className={`${styles.heading} ${isMobile ? styles.headingMobile : ""}`}
      >
        श्री राम जय राम जय जय राम
      </h1>

      <b
        className={`${styles.stickyBar} ${
          isMobile ? styles.stickyBarMobile : ""
        }`}
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
              className={`${styles.loadButton} ${
                isMobile ? styles.loadButtonMobile : ""
              }`}
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
                  className={styles.pageContainer}
                >
                  <div className={styles.projectList}>
                    {page.data.map((project) => {
                      const isDisabled = disabledIdsRef.current.has(project.id);
                      const isSelected = selectedId === project.id;
                      return (
                        <button
                          id={`project-button-${project.id}`}
                          key={project.id}
                          disabled={isDisabled}
                          onClick={() => handleButtonClick(project.id)}
                          className={getButtonClass(
                            project.id,
                            isSelected,
                            isDisabled,
                            isMobile
                          )}
                        >
                          <p className={styles.projectButtonText}>
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
              className={styles.loadButton}
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
            <div className={styles.selectedProject}>
              <h2 style={{ color: "#6d4c41" }}>Selected Project Details</h2>
              <pre>{JSON.stringify(selectedProject, null, 2)}</pre>
            </div>
          )}
        </>
      )}

      <hr className={styles.hr} />
    </div>
  );
}

export default Example;
