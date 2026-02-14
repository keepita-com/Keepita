import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { AUTH_STORAGE_KEY } from "../store";

const VerifyTokenPage: React.FC = () => {
  const [status, setStatus] = useState<"waiting" | "received" | "error">(
    "waiting",
  );
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const ADMIN_PANEL_ORIGIN = "https://panel.keepita.com";

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== ADMIN_PANEL_ORIGIN) {
        console.warn("Blocked message from unauthorized origin:", event.origin);
        return;
      }

      if (event.data?.type === "ADMIN_IMPERSONATION_HANDSHAKE") {
        console.log("Received impersonation handshake:", event.data);

        const { accessToken, refreshToken, user } = event.data.payload;

        if (!accessToken || !user) {
          setStatus("error");
          setErrorMsg("Invalid payload: missing accessToken or user");
          console.error("Invalid payload:", event.data.payload);
          return;
        }

        try {
          const authData = {
            user: user,
            token: accessToken,
            refresh: refreshToken,
            isAuthenticated: true,
          };

          console.log("Saving auth data to localStorage:", authData);

          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

          const saved = localStorage.getItem(AUTH_STORAGE_KEY);
          if (!saved) {
            throw new Error("Failed to persist to localStorage");
          }

          setStatus("received");

          setTimeout(() => {
            console.log("Redirecting to home...");
            window.location.replace("/");
          }, 500);
        } catch (err) {
          setStatus("error");
          setErrorMsg(err instanceof Error ? err.message : "Unknown error");
          console.error("Failed to save auth data:", err);
        }
      }
    };

    const signalReady = () => {
      if (window.opener) {
        window.opener.postMessage(
          { type: "VERIFY_PAGE_READY" },
          ADMIN_PANEL_ORIGIN,
        );
        console.log("Sent READY signal to admin panel");
      }
    };

    window.addEventListener("message", handleMessage);

    const readyTimer = setTimeout(signalReady, 100);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(readyTimer);
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-900 text-white">
      <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-xl flex flex-col items-center min-w-[300px]">
        {status === "waiting" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              Waiting for Handshake...
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Establishing secure connection
            </p>
          </>
        )}

        {status === "received" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-green-400">
              Authentication Received!
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-400">
              Authentication Failed
            </h2>
            <p className="text-sm text-gray-400 mt-2 text-center">{errorMsg}</p>
            <button
              onClick={() => window.close()}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            >
              Close Window
            </button>
          </>
        )}
      </div>

      {import.meta.env.DEV && (
        <div className="mt-4 text-xs text-gray-500">
          Status: {status} | Origin: {window.location.origin}
        </div>
      )}
    </div>
  );
};

export default VerifyTokenPage;
