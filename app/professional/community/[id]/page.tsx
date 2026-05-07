"use client";

import React from "react";
import PostDetail from "@/components/features/community/PostDetail";

export default function ProfessionalPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <PostDetail id={id} />;
}
