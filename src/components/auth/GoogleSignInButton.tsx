"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button";

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M5.3 14.3l-.8.6-2.4 1.9C3.7 20 7.6 22.5 12 22.5c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 1-3.6 1-2.8 0-5.1-1.9-6-4.4z"
      />
      <path
        fill="#4A90E2"
        d="M3.1 7.2C2.4 8.6 2 10.2 2 12s.4 3.4 1.1 4.8l3.2-2.5C5.8 13.5 5.5 12.8 5.5 12s.3-1.5.8-2.3L3.1 7.2z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.5c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.5 14.7 1.5 12 1.5 7.6 1.5 3.7 4 2.1 8l3.2 2.5C6.9 7.4 9.2 5.5 12 5.5z"
      />
    </svg>
  );
}

interface GoogleSignInButtonProps {
  onClick: () => void | Promise<void>;
  label?: string;
}

export default function GoogleSignInButton({
  onClick,
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full gap-2.5"
      isLoading={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await onClick();
        } finally {
          setLoading(false);
        }
      }}
    >
      {!loading && <GoogleGlyph className="h-5 w-5" />}
      {label}
    </Button>
  );
}
