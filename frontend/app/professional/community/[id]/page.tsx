"use client";

import React from "react";
import PostDetail from "@/app/components/PostDetail";

export default function ProfessionalPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <PostDetail id={id} />;
}
