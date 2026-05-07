"use client";

import React from "react";
import PostDetail from "@/components/features/community/PostDetail";

export default function PatientPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <PostDetail id={id} />;
}
