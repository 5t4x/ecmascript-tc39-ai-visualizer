"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Loader({ proposal }: { proposal: string }) {
  const [dots, setDots] = useState(0);
  const router = useRouter();
  const dotsRef = useRef(dots);

  useEffect(() => {
    const abort = new AbortController();

    const updateInterval = setInterval(() => {
      fetch(`/proposals/${proposal}/status`, { signal: abort.signal }).then(
        (res) => {
          if (res.status === 204) router.refresh();
        }
      );
    }, 2e3);

    const dotsInterval = setInterval(() => {
      dotsRef.current = (dotsRef.current + 1) % 4;
      setDots(dotsRef.current);
    }, 500);

    return () => {
      abort.abort();
      clearInterval(dotsInterval);
      clearInterval(updateInterval);
    };
  }, [proposal, router]);

  return (
    <>
      <h1 className="mt-4">Loading{".".repeat(dots)}</h1>
      <p>This tab will automatically refresh once the content is generated.</p>
    </>
  );
}
