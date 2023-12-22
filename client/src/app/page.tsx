"use client";

import React, { useEffect, useState } from "react";

interface BackendData {
  users: string[];
}

function App() {
  const [backendData, setBackendData] = useState<BackendData>({ users: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api");
        const data = await res.json();
        setBackendData(data as BackendData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return <div>{JSON.stringify(backendData)}</div>;
}

export default App;
